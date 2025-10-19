import "./profile.scss";
// Removed social/location/message icons per request
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import { useState } from "react";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);

  const userid = parseInt(useLocation().pathname.split("/")[2]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userid],
    queryFn: () => makeRequest.get("/users/find/" + userid).then((res) => res.data),
    keepPreviousData: false,
  });

  const { isLoading: rIsLoading, data: relationshipData } = useQuery({
    queryKey: ["relationship", userid],
    queryFn: () => makeRequest.get("/relationships?followedUserid=" + userid).then((res) => res.data)
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["followers", userid],
    queryFn: () => makeRequest.get("/relationships/followers?userid=" + userid).then((res) => res.data)
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following", userid],
    queryFn: () => makeRequest.get("/relationships/following?userid=" + userid).then((res) => res.data)
  });

  // My following (to reflect follow state inside modals for arbitrary users)
  const { data: myFollowing = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
    queryFn: () => makeRequest.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (following) => {
      if (following) {
        return makeRequest.delete("/relationships?userid=" + userid);
      }
      return makeRequest.post("/relationships", { userid });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ["relationship", userid]});
        queryClient.invalidateQueries({ queryKey: ["followers", userid]});
        queryClient.invalidateQueries({ queryKey: ["following", userid]});
      },
    }
  );

  const handleFollow = () => {
    if (!relationshipData) return;
    mutation.mutate(relationshipData.includes(currentUser.id));
  };

  // Follow/unfollow arbitrary user from lists
  const followUserMutation = useMutation(
    ({ targetUserId, isFollowing }) => {
      if (isFollowing) {
        return makeRequest.delete(`/relationships?userid=${targetUserId}`);
      }
      return makeRequest.post("/relationships", { userid: targetUserId });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["myFollowing", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["followers", userid] });
        queryClient.invalidateQueries({ queryKey: ["following", userid] });
      },
    }
  );

  const isFollowingUser = (uid) => Array.isArray(myFollowing) && myFollowing.some((u) => u.id === uid);

  if (isLoading) return <div className="profile">loading</div>;

  return (
    <div className="profile" key={userid}>
      <div className="images">
        <img
          src={data.coverPic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect fill='%23ddd' width='800' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='30'%3ENo Cover%3C/text%3E%3C/svg%3E"}
          alt="Cover"
          className="cover"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect fill='%23ddd' width='800' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='30'%3ENo Cover%3C/text%3E%3C/svg%3E";
          }}
        />
        <img
          src={data.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='24'%3E%3F%3C/text%3E%3C/svg%3E"}
          alt="Profile"
          className="profilePic"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='24'%3E%3F%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            {/* Social icons removed as requested */}
          </div>
          <div className="center">
            <span>{data.name}</span>
            <div className="info">
              {/* Removed location and website items */}
              <div className="item">
                <span style={{ cursor: "pointer", textDecoration: "underline" }} title="Followers" onClick={() => setShowFollowers(true)}>
                  Followers: {Array.isArray(followers) ? followers.length : 0}
                </span>
              </div>
              <div className="item">
                <span style={{ cursor: "pointer", textDecoration: "underline" }} title="Following" onClick={() => setShowFollowing(true)}>
                  Following: {Array.isArray(following) ? following.length : 0}
                </span>
              </div>
            </div>
            {rIsLoading ? (
              "loading"
            ) : userid === currentUser.id ? (
              <>
                <button onClick={() => setOpenUpdate(true)}>update</button>
                <button onClick={logout}>logout</button>
              </>
            ) : (
              <button onClick={handleFollow} disabled={mutation.isLoading}>
                {mutation.isLoading
                  ? "..."
                  : relationshipData && relationshipData.includes(currentUser.id)
                  ? "Following"
                  : "Follow"}
              </button>
            )}
          </div>
          <div className="right">{/* Removed message and three dots icons */}</div>
        </div>
        <Posts userid={userid} />
      </div>

      {showFollowers && (
        <div className="modal-overlay" onClick={() => setShowFollowers(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Followers ({Array.isArray(followers) ? followers.length : 0})</h3>
            {Array.isArray(followers) && followers.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              <ul>
                {Array.isArray(followers) && followers.map((user) => (
                  <li key={user.id} style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                      to={`/profile/${user.id}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}
                      onClick={() => setShowFollowers(false)}
                    >
                      <img
                        src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt={user.name || user.username || 'User'}
                        style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 15 }}>
                        {user.name || user.username || 'Unknown'}
                      </span>
                    </Link>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => followUserMutation.mutate({ targetUserId: user.id, isFollowing: isFollowingUser(user.id) })}
                        disabled={followUserMutation.isLoading}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: isFollowingUser(user.id) ? "#e4e6eb" : "#5271ff", color: isFollowingUser(user.id) ? "#111" : "#fff" }}
                      >
                        {isFollowingUser(user.id) ? "Following" : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFollowers(false)}>Close</button>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="modal-overlay" onClick={() => setShowFollowing(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Following ({Array.isArray(following) ? following.length : 0})</h3>
            {Array.isArray(following) && following.length === 0 ? (
              <p>Not following anyone yet.</p>
            ) : (
              <ul>
                {Array.isArray(following) && following.map((user) => (
                  <li key={user.id} style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                      to={`/profile/${user.id}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}
                      onClick={() => setShowFollowing(false)}
                    >
                      <img
                        src={user.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Crect fill='%23ddd' width='30' height='30'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt={user.name || user.username || 'User'}
                        style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 15 }}>
                        {user.name || user.username || 'Unknown'}
                      </span>
                    </Link>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => followUserMutation.mutate({ targetUserId: user.id, isFollowing: isFollowingUser(user.id) })}
                        disabled={followUserMutation.isLoading}
                        style={{ padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: isFollowingUser(user.id) ? "#e4e6eb" : "#5271ff", color: isFollowingUser(user.id) ? "#111" : "#fff" }}
                      >
                        {isFollowingUser(user.id) ? "Following" : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowFollowing(false)}>Close</button>
          </div>
        </div>
      )}

      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;
