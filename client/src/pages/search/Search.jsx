import { useLocation, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import "./search.scss";

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["search", query],
    queryFn: () => {
      // If no query, show all users (discover mode)
      if (!query) {
  return axiosInstance.get("/users/search?q=").then((res) => res.data);
      }
  return axiosInstance.get(`/users/search?q=${query}`).then((res) => res.data);
    }
  });

  // Get relationships for each user to show follow status
  const { data: myFollowing = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
  queryFn: () => axiosInstance.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data)
  });

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

  const isFollowing = (userid) => {
    return myFollowing.some(u => u.id === userid);
  };

  return (
    <div className="search-page">
      <h2>{query ? `Search Results for: "${query}"` : "Discover Users"}</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>
          <p>Error occurred.</p>
          <p style={{ color: 'red', fontSize: '12px' }}>
            {error?.response?.data || error?.message || "Unknown error"}
          </p>
        </div>
      ) : data && data.length > 0 ? (
        <div className="search-results">
          {data.filter(user => user.id !== currentUser.id).map((user) => (
            <div key={user.id} className="search-result-item">
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
        <p>{query ? `No users found matching "${query}"` : "No users to display"}</p>
      )}
    </div>
  );
};

export default Search;
