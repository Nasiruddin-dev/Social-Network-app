import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Events from "../../assets/6.png";
import Messages from "../../assets/10.png";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const LeftBar = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <Link to={`/profile/${currentUser.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="user">
              <img
                src={currentUser.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E"}
                alt=""
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
              <span>{currentUser.name}</span>
            </div>
          </Link>
          <Link to="/friends" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="item">
              <img src={Friends} alt="" />
              <span>Friends</span>
            </div>
          </Link>
          <Link to="/groups" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="item">
              <img src={Groups} alt="" />
              <span>Groups</span>
            </div>
          </Link>
        </div>
        <hr />
        <div className="menu">
          <span>Your shortcuts</span>
          <Link to="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="item">
              <img src={Events} alt="" />
              <span>Events</span>
            </div>
          </Link>
          <Link to="/messages" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="item">
              <img src={Messages} alt="" />
              <span>Messages</span>
            </div>
          </Link>
        </div>
        <hr />
        {/* Others section removed as requested */}
      </div>
    </div>
  );
};

export default LeftBar;
