
import "./explore.scss";
import Posts from "../../components/posts/Posts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useContext } from "react"; // keep
import { AuthContext } from "../../context/authContext";
import { Link } from "react-router-dom";

const Explore = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // User discovery logic (similar to Search page)
  const { isLoading, error, data: users } = useQuery({
    queryKey: ["exploreUsers"],
    queryFn: () => makeRequest.get("/users/search?q=").then((res) => res.data)
  });

  const { data: myFollowing = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
    queryFn: () => makeRequest.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data)
  });

  const followMutation = useMutation(
    ({ userid, isFollowing }) => {
      if (isFollowing) {
        return makeRequest.delete(`/relationships?userid=${userid}`);
      }
      return makeRequest.post("/relationships", { userid });
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

  const isFollowing = (userid) => {
    return myFollowing.some(u => u.id === userid);
  };

  return (
    <div className="explore">
      <h2>Explore</h2>
      <p>Discover trending posts and users!</p>

      <div className="explore-section">
        <h3>Trending Posts</h3>
        <Posts />
      </div>

      <div className="explore-section">
        <h3>Discover Users</h3>
        {isLoading ? (
          <p>Loading users...</p>
        ) : error ? (
          <div>
            <p>Error loading users.</p>
            <p style={{ color: 'red', fontSize: '12px' }}>
              {error?.response?.data || error?.message || "Unknown error"}
            </p>
          </div>
        ) : users && users.length > 0 ? (
          <div className="explore-users">
            {users.filter(user => user.id !== currentUser.id).map((user) => (
              <div key={user.id} className="explore-user-item">
                <img 
                  src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"} 
                  alt={user.name} 
                />
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>@{user.username}</p>
                </div>
                <div className="user-actions">
                  <Link to={`/profile/${user.id}`}>View Profile</Link>
                  <button 
                    onClick={() => handleFollow(user.id)}
                    disabled={followMutation.isLoading}
                  >
                    {isFollowing(user.id) ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users to display</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
