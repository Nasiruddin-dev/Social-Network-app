import "./rightBar.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { Link } from "react-router-dom";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [dismissedUsers, setDismissedUsers] = useState([]);

  // Fetch suggested users (users not followed by current user)
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ["suggestedUsers", currentUser?.id],
    queryFn: () => axiosInstance.get("/users/search?q=").then((res) => res.data)
  });

  // Fetch following list
  const { data: myFollowing = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
    queryFn: () => axiosInstance.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data)
  });

  // Follow mutation
  const followMutation = useMutation(
    ({ userid, isFollowing }) => {
      if (isFollowing) {
        return axiosInstance.delete(`/relationships?userid=${userid}`);
      }
      return axiosInstance.post("/relationships", { userid });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myFollowing"] });
      },
    }
  );

  const handleFollow = (userid) => {
    const isFollowing = myFollowing.some(u => u.id === userid);
    followMutation.mutate({ userid, isFollowing });
  };

  const handleDismiss = (userid) => {
    setDismissedUsers([...dismissedUsers, userid]);
  };

  const isFollowing = (userid) => {
    return myFollowing.some(u => u.id === userid);
  };

  // Filter suggestions: exclude current user, already following, and dismissed
  const filteredSuggestions = suggestedUsers
    .filter(user => 
      user.id !== currentUser.id && 
      !isFollowing(user.id) && 
      !dismissedUsers.includes(user.id)
    )
    .slice(0, 5);

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {filteredSuggestions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>No suggestions available</p>
          ) : (
            filteredSuggestions.map((user) => (
              <div className="user" key={user.id}>
                <div className="userInfo">
                  <img
                    src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"}
                    alt={user.name}
                  />
                  <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span>{user.name}</span>
                  </Link>
                </div>
                <div className="buttons">
                  <button onClick={() => handleFollow(user.id)} disabled={followMutation.isLoading}>
                    {isFollowing(user.id) ? "following" : "follow"}
                  </button>
                  <button onClick={() => handleDismiss(user.id)}>dismiss</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="item">
          <span>Online Friends</span>
          {myFollowing.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>No friends online</p>
          ) : (
            myFollowing.slice(0, 10).map((user) => (
              <div className="user" key={user.id}>
                <div className="userInfo">
                  <img
                    src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"}
                    alt={user.name}
                  />
                  <div className="online" />
                  <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span>{user.name}</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
