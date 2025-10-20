import "./notifications.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";
import { Link } from "react-router-dom";
import moment from "moment";

const Notifications = () => {
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["notifications"],
  queryFn: () => axiosInstance.get("/notifications").then((res) => res.data)
  });

  const markAsReadMutation = useMutation(
  (notificationId) => axiosInstance.put(`/notifications/${notificationId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    }
  );

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {isLoading ? (
        "Loading notifications..."
      ) : error ? (
        "Error loading notifications"
      ) : data && data.length > 0 ? (
        <div className="notification-list">
          {data.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? "read" : "unread"}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <Link to={`/profile/${notification.senderid}`}>
                <img
                  src={
                    notification.profilePic ||
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"
                  }
                  alt={notification.name}
                />
              </Link>
              <div className="notification-content">
                <p>
                  <Link to={`/profile/${notification.senderid}`}>
                    <strong>{notification.name}</strong>
                  </Link>{" "}
                  {notification.content}
                </p>
                <span className="notification-time">{moment(notification.createdAt).fromNow()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No notifications yet.</p>
      )}
    </div>
  );
};

export default Notifications;
