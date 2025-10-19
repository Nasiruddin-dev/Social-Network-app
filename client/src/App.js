import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Explore from "./pages/explore/Explore";
import Search from "./pages/search/Search";
import Messages from "./pages/messages/Messages";
import Notifications from "./pages/notifications/Notifications";
import Friends from "./pages/friends/Friends";
import Groups from "./pages/groups/Groups";
import Events from "./pages/events/Events";
import "./style.scss";
import MobileNav from "./components/mobileNav/MobileNav";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const { currentUser } = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"} app-layout`}>
          <Navbar />
          <div className="main-row" style={{ display: "flex" }}>
            <LeftBar />
            <div className="content" style={{ flex: 6 }}>
              <Outlet />
            </div>
            <RightBar />
          </div>
          <MobileNav />
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/register" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:id",
          element: <Profile />,
        },
        {
          path: "/explore",
          element: <Explore />,
        },
        {
          path: "/search",
          element: <Search />,
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/notifications",
          element: <Notifications />,
        },
        {
          path: "/friends",
          element: <Friends />,
        },
        {
          path: "/groups",
          element: <Groups />,
        },
        {
          path: "/events",
          element: <Events />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
