import "./friends.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { Link } from "react-router-dom";

const Friends = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Fetch following list
  const { data: following = [], isLoading } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
  queryFn: () => axiosInstance.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data)
  });

  // Unfollow mutation
  const unfollowMutation = useMutation(
  (userid) => axiosInstance.delete(`/relationships?userid=${userid}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      },
    }
  );

  const handleUnfollow = (userid) => {
    if (window.confirm("Are you sure you want to unfollow this person?")) {
      unfollowMutation.mutate(userid);
    }
  };

  if (isLoading) return <div className="friends">Loading...</div>;

  return (
    <div className="friends">
      <div className="container">
        <h1>Friends ({following.length})</h1>
        <p className="subtitle">People you follow</p>
        
        {following.length === 0 ? (
          <div className="no-friends">
            <p>You're not following anyone yet.</p>
            <Link to="/explore">
              <button>Discover People</button>
            </Link>
          </div>
        ) : (
          <div className="friends-grid">
            {following.map((friend) => (
              <div className="friend-card" key={friend.id}>
                <Link to={`/profile/${friend.id}`}>
                  <img
                    src={friend.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23ddd' width='120' height='120'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E"}
                    alt={friend.name}
                    className="friend-img"
                  />
                </Link>
                <div className="friend-info">
                  <Link to={`/profile/${friend.id}`} style={{ textDecoration: 'none' }}>
                    <h3>{friend.name}</h3>
                  </Link>
                  <p className="username">@{friend.username || friend.name.toLowerCase().replace(/\s+/g, '')}</p>
                  <div className="friend-actions">
                    <Link to={`/messages?user=${friend.id}`}>
                      <button className="message-btn">Message</button>
                    </Link>
                    <button 
                      className="unfollow-btn" 
                      onClick={() => handleUnfollow(friend.id)}
                      disabled={unfollowMutation.isLoading}
                    >
                      {unfollowMutation.isLoading ? "Unfollowing..." : "Unfollow"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
