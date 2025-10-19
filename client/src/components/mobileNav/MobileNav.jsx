import "./mobileNav.scss";
import { NavLink } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const MobileNav = () => {
  const { currentUser } = useContext(AuthContext);
  const profilePath = currentUser ? `/profile/${currentUser.id}` : "/profile/0";

  return (
    <nav className="mobile-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Home">
        <HomeOutlinedIcon />
        <span>Home</span>
      </NavLink>
      <NavLink to="/explore" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Explore">
        <ExploreOutlinedIcon />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/events" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Events">
        <EventNoteOutlinedIcon />
        <span>Events</span>
      </NavLink>
      <NavLink to="/groups" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Groups">
        <GroupsOutlinedIcon />
        <span>Groups</span>
      </NavLink>
      <NavLink to="/messages" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Messages">
        <ChatBubbleOutlineIcon />
        <span>Chats</span>
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Notifications">
        <NotificationsNoneIcon />
        <span>Alerts</span>
      </NavLink>
      <NavLink to={profilePath} className={({ isActive }) => (isActive ? "tab active" : "tab")}
        aria-label="Profile">
        <PersonOutlineIcon />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
