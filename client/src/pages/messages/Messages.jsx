import "./messages.scss";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useLocation } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment";

const Messages = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get user from URL params if redirected from friends page
  const urlParams = new URLSearchParams(location.search);
  const userIdFromUrl = urlParams.get('user');

  // Fetch conversations list
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => makeRequest.get("/messages/conversations").then((res) => res.data),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch messages for selected chat
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChat?.id],
    queryFn: () => makeRequest.get(`/messages/${selectedChat.id}`).then((res) => res.data),
    enabled: !!selectedChat,
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  // Fetch following list for new chat
  const { data: following = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
    queryFn: () => makeRequest.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data)
  });

  // Send message mutation
  const sendMessageMutation = useMutation(
    (newMessage) => makeRequest.post("/messages", newMessage),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        setMessage("");
      },
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select chat if user ID in URL
  useEffect(() => {
    if (userIdFromUrl && following.length > 0) {
      const user = following.find(f => f.id === parseInt(userIdFromUrl));
      if (user) {
        setSelectedChat(user);
      }
    }
  }, [userIdFromUrl, following]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      sendMessageMutation.mutate({
        receiverId: selectedChat.id,
        message: message.trim()
      });
    }
  };

  const filteredFollowing = following.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messages">
      <div className="messages-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>

          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {searchQuery ? (
              // Show filtered following list when searching
              filteredFollowing.length === 0 ? (
                <p className="no-results">No friends found</p>
              ) : (
                filteredFollowing.map((user) => (
                  <div
                    key={user.id}
                    className={`conversation-item ${selectedChat?.id === user.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedChat(user);
                      setSearchQuery("");
                    }}
                  >
                    <img
                      src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='18'%3E%3F%3C/text%3E%3C/svg%3E"}
                      alt={user.name}
                    />
                    <div className="conversation-info">
                      <h4>{user.name}</h4>
                      <p className="new-chat">Start a new conversation</p>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Show conversations list
              conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No messages yet</p>
                  <span>Search for friends to start chatting</span>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedChat?.id === conv.id ? "active" : ""}`}
                    onClick={() => setSelectedChat(conv)}
                  >
                    <img
                      src={conv.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='18'%3E%3F%3C/text%3E%3C/svg%3E"}
                      alt={conv.name}
                    />
                    <div className="conversation-info">
                      <h4>{conv.name}</h4>
                      <p className={conv.unread ? "unread" : ""}>{conv.lastMessage}</p>
                    </div>
                    <div className="conversation-meta">
                      <span className="time">{moment(conv.lastMessageTime).fromNow()}</span>
                      {conv.unread && <div className="unread-badge">{conv.unread}</div>}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <img
                  src={selectedChat.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"}
                  alt={selectedChat.name}
                />
                <div>
                  <h3>{selectedChat.name}</h3>
                  <span>Active now</span>
                </div>
              </div>

              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.senderid === currentUser.id ? "own" : ""}`}
                    >
                      <img
                        src={msg.senderid === currentUser.id 
                          ? currentUser.profilePic 
                          : selectedChat.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%23ddd' width='32' height='32'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt=""
                        className="message-avatar"
                      />
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <span className="message-time">{moment(msg.createdAt).format('h:mm A')}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
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
            <div className="no-chat-selected">
              <div className="placeholder">
                <h3>Select a conversation</h3>
                <p>Choose a friend from your list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
