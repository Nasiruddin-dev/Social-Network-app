import "./share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [place, setPlace] = useState("");
  const [showPlaceInput, setShowPlaceInput] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Fetch following list for tagging
  const { data: myFollowing = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
    queryFn: () => makeRequest.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data),
    enabled: showTagModal
  });

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const mutation = useMutation(
    (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    let imgUrl = "";
    if (file) imgUrl = await toBase64(file);
    mutation.mutate({ 
      desc, 
      img: imgUrl, 
      place: place || null,
      taggedFriends: taggedFriends.length > 0 ? JSON.stringify(taggedFriends) : null
    });
    setDesc("");
    setFile(null);
    setPlace("");
    setTaggedFriends([]);
    setShowPlaceInput(false);
  };

  const handleTagFriend = (friend) => {
    if (taggedFriends.find(f => f.id === friend.id)) {
      setTaggedFriends(taggedFriends.filter(f => f.id !== friend.id));
    } else {
      setTaggedFriends([...taggedFriends, friend]);
    }
  };

  const filteredFriends = myFollowing.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img 
              src={currentUser.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"} 
              alt={currentUser.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E";
              }}
            />
            <input
              type="text"
              placeholder={`What's on your mind ${currentUser.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {file && (
              <img className="file" alt="" src={URL.createObjectURL(file)} />
            )}
          </div>
        </div>
        
        {/* Display tagged friends and place */}
        {(taggedFriends.length > 0 || place) && (
          <div style={{ padding: '10px', fontSize: '14px', color: '#555' }}>
            {place && <div>📍 at <strong>{place}</strong></div>}
            {taggedFriends.length > 0 && (
              <div>
                👥 with <strong>{taggedFriends.map(f => f.name).join(', ')}</strong>
              </div>
            )}
          </div>
        )}

        {/* Place input */}
        {showPlaceInput && (
          <div style={{ padding: '10px' }}>
            <input
              type="text"
              placeholder="Where are you?"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {/* Tag friends modal */}
        {showTagModal && (
          <div style={{
            padding: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#fff'
          }}>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginBottom: '10px',
                border: '1px solid #ddd', 
                borderRadius: '5px',
                fontSize: '14px'
              }}
            />
            {filteredFriends.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => handleTagFriend(friend)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: taggedFriends.find(f => f.id === friend.id) ? '#e3f2fd' : 'transparent',
                  borderRadius: '5px',
                  marginBottom: '5px'
                }}
              >
                <img 
                  src={friend.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E"}
                  alt={friend.name}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                />
                <span style={{ color: '#222', fontWeight: 600, fontSize: '15px', letterSpacing: '0.01em' }}>{friend.name ? friend.name : (friend.username ? friend.username : '')}</span>
                {taggedFriends.find(f => f.id === friend.id) && (
                  <span style={{ marginLeft: 'auto', color: '#1976d2' }}>✓</span>
                )}
              </div>
            ))}
            {filteredFriends.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
                No friends found
              </div>
            )}
          </div>
        )}

        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item" onClick={() => setShowPlaceInput(!showPlaceInput)} style={{ cursor: 'pointer' }}>
              <img src={Map} alt="" />
              <span>Add Place</span>
            </div>
            <div className="item" onClick={() => setShowTagModal(!showTagModal)} style={{ cursor: 'pointer' }}>
              <img src={Friend} alt="" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
