import "./groups.scss";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import moment from "moment";

const Groups = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
  queryFn: () => axiosInstance.get("/groups").then((res) => res.data)
  });

  // Fetch group messages
  const { data: messages = [] } = useQuery({
    queryKey: ["groupMessages", selectedGroup?.id],
  queryFn: () => axiosInstance.get(`/groups/${selectedGroup.id}/messages`).then((res) => res.data),
    enabled: !!selectedGroup
  });

  // Fetch current group members
  const { data: members = [] } = useQuery({
    queryKey: ["groupMembers", selectedGroup?.id],
  queryFn: () => axiosInstance.get(`/groups/${selectedGroup.id}/members`).then((res) => res.data),
    enabled: !!selectedGroup
  });

  // Fetch following to suggest adding
  const { data: following = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
  queryFn: () => axiosInstance.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data),
    enabled: !!currentUser?.id
  });

  // Create group mutation
  const createGroupMutation = useMutation(
  (newGroup) => axiosInstance.post("/groups", newGroup),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        setShowCreateModal(false);
        setGroupName("");
        setGroupDesc("");
      },
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
  (newMessage) => axiosInstance.post(`/groups/${selectedGroup.id}/messages`, newMessage),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupMessages"] });
        setMessage("");
      },
    }
  );

  // Add member mutation
  const addMemberMutation = useMutation(
  (userId) => axiosInstance.post(`/groups/${selectedGroup.id}/members`, { userId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupMembers", selectedGroup?.id] });
      },
      onError: (error) => {
        alert("Failed to add member: " + (error.response?.data || error.message));
      }
    }
  );

  const handleCreateGroup = (e) => {
    e.preventDefault();
    console.log("Creating group with name:", groupName, "description:", groupDesc);
    if (groupName.trim()) {
      createGroupMutation.mutate(
        { name: groupName, description: groupDesc },
        {
          onError: (error) => {
            console.error("Error creating group:", error);
            alert("Failed to create group: " + (error.response?.data || error.message));
          }
        }
      );
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Sending message:", message, "to group:", selectedGroup?.id);
    if (message.trim()) {
      sendMessageMutation.mutate(
        { message },
        {
          onError: (error) => {
            console.error("Error sending message:", error);
            alert("Failed to send message: " + (error.response?.data || error.message));
          }
        }
      );
    }
  };

  if (isLoading) return <div className="groups">Loading...</div>;

  return (
    <div className="groups">
      <div className="groups-container">
        {/* Groups List Sidebar */}
        <div className="groups-sidebar">
          <div className="sidebar-header">
            <h2>Groups</h2>
            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              <AddIcon /> Create Group
            </button>
          </div>
          
          <div className="groups-list">
            {groups.length === 0 ? (
              <p className="no-groups">No groups yet. Create one!</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`group-item ${selectedGroup?.id === group.id ? "active" : ""}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="group-icon">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p>{group.memberCount || 0} members</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Group Chat Area */}
        <div className="group-chat">
          {selectedGroup ? (
            <>
              <div className="chat-header">
                <div>
                  <h2>{selectedGroup.name}</h2>
                  <p>{selectedGroup.description}</p>
                </div>
                <div>
                  <button onClick={() => setShowAddMembers(true)} className="create-btn">
                    <AddIcon /> Add Members
                  </button>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.userid === currentUser.id ? "own" : ""}`}
                    >
                      <div className="message-content">
                        <div className="message-header">
                          <img
                            src={msg.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E"}
                            alt={msg.name}
                          />
                          <span className="sender-name">{msg.name}</span>
                          <span className="message-time">{moment(msg.createdAt).fromNow()}</span>
                        </div>
                        <p className="message-text">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className="message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" disabled={!message.trim() || sendMessageMutation.isLoading}>
                  <SendIcon />
                </button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <h3>Select a group to start chatting</h3>
              <p>Choose a group from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group</h2>
              <CloseIcon onClick={() => setShowCreateModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What's this group about?"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={createGroupMutation.isLoading}>
                  {createGroupMutation.isLoading ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembers && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowAddMembers(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add members to {selectedGroup.name}</h2>
              <CloseIcon onClick={() => setShowAddMembers(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div className="members-container">
              <h4>Current Members</h4>
              <div className="members-list">
                {members.length === 0 ? (<p>No members yet</p>) : (
                  members.map(m => (
                    <div className="member-item" key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <img
                        src={m.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt={m.name || m.username || ''}
                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{m.name ? m.name : (m.username ? m.username : '')}</span>
                    </div>
                  ))
                )}
              </div>

              <h4>People you follow</h4>
              <div className="members-list">
                {following
                  .filter(f => !members.some(m => m.id === f.id))
                  .map(f => (
                    <div className="member-item" key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <img
                        src={f.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt={f.name || f.username || ''}
                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{f.name ? f.name : (f.username ? f.username : '')}</span>
                      <button onClick={() => addMemberMutation.mutate(f.id)} disabled={addMemberMutation.isLoading}>Add</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
