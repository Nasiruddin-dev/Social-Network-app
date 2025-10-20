import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSearch, setShareSearch] = useState("");
  const [sentTo, setSentTo] = useState({});

  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
  queryFn: () => axiosInstance.get("/likes?postid=" + post.id).then((res) => {
      return res.data;
    })
  });

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
  if (liked) return axiosInstance.delete("/likes?postid=" + post.id);
  return axiosInstance.post("/likes", { postid: post.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );
  const deleteMutation = useMutation(
  (postid) => {
  return axiosInstance.delete("/posts/" + postid);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };

  // Fetch following list to share with
  const { data: following = [] } = useQuery({
    queryKey: ["myFollowing", currentUser?.id],
  queryFn: () => axiosInstance.get(`/relationships/following?userid=${currentUser.id}`).then((res) => res.data),
    enabled: !!currentUser?.id
  });

  // Send share as a direct message
  const sendShareMutation = useMutation(
    (receiverId) =>
  axiosInstance.post("/messages", {
        receiverId,
        message: `Shared a post by ${post.name}:\n${post.desc || ""}`.slice(0, 500),
      }),
    {
      onSuccess: (_data, receiverId) => {
        setSentTo((prev) => ({ ...prev, [receiverId]: true }));
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      },
      onError: (error) => {
        const msg = error?.response?.data || error?.message || "Failed to send";
        alert(`Could not send: ${msg}`);
      },
    }
  );

  const filteredFollowing = following.filter((u) =>
    u.name.toLowerCase().includes(shareSearch.toLowerCase())
  );

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img 
              src={post.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"} 
              alt={post.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="details">
              <Link
                to={`/profile/${post.userid}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              {post.place && (
                <span style={{ fontSize: '13px', color: '#65676b' }}> is at <strong>{post.place}</strong></span>
              )}
              {post.taggedFriends && (() => {
                try {
                  const friends = JSON.parse(post.taggedFriends);
                  if (friends.length > 0) {
                    return (
                      <span style={{ fontSize: '13px', color: '#65676b' }}>
                        {' '}with <strong>{friends.map(f => f.name).join(', ')}</strong>
                      </span>
                    );
                  }
                } catch (e) {
                  return null;
                }
                return null;
              })()}
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.userid === currentUser.id && (
            <button onClick={handleDelete}>delete</button>
          )}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          {post.img && post.img !== "null" && (
            <img 
              src={post.img} 
              alt="" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : data.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            See Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon onClick={() => setShareOpen(true)} />
            <span onClick={() => setShareOpen(true)}>Share</span>
          </div>
        </div>
  {commentOpen && <Comments postid={post.id} />}
      {shareOpen && (
        <div className="post-share-overlay" onClick={() => setShareOpen(false)}>
          <div className="post-share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="post-share-header">
              <h3>Share to friends</h3>
              <button className="post-share-close" onClick={() => setShareOpen(false)}>×</button>
            </div>
            <div className="post-share-search">
              <input
                type="text"
                placeholder="Search friends..."
                value={shareSearch}
                onChange={(e) => setShareSearch(e.target.value)}
              />
            </div>
            <div className="post-share-list">
              {filteredFollowing.length === 0 ? (
                <p className="post-share-empty">No friends found</p>
              ) : (
                filteredFollowing.map((u) => (
                  <div className="post-share-item" key={u.id}>
                    <div className="post-share-user">
                      <img
                        src={u.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect fill='%23ddd' width='36' height='36'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt={u.name}
                      />
                        <span>
                          <span style={{ color: '#444' }}>{u.name}</span>
                          {u.username && (
                            <span style={{ color: '#6a64f1', fontWeight: 'bold', marginLeft: 4 }}>
                              @{u.username}
                            </span>
                          )}
                        </span>
                    </div>
                    <button
                      className="post-share-send"
                      onClick={() => sendShareMutation.mutate(u.id)}
                      disabled={sendShareMutation.isLoading || sentTo[u.id] || u.id === currentUser.id}
                    >
                      {sentTo[u.id] ? "Sent" : sendShareMutation.isLoading ? "Sending..." : "Send"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Post;
