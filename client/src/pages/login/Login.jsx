import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.scss";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setErr] = useState(null);

  const navigate = useNavigate()

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setErr(err.response?.data || "Login failed");
      // Redirect to register if error indicates user not found or wrong credentials
      if (
        err.response?.data?.toLowerCase().includes("not found") ||
        err.response?.data?.toLowerCase().includes("wrong") ||
        err.response?.data?.toLowerCase().includes("invalid")
      ) {
        setTimeout(() => navigate("/register"), 1500);
      }
    }
  };

  return (
  <div className="login">
      <div className="card">
        <div className="left">
          <h1>Social Network App</h1>
          <p>
             Connect with friends, share posts and stories, discover people, chat one-on-one or in groups, and plan events — all in one modern social platform.
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            {err && err}
            <button onClick={handleLogin}>Login</button>
          </form>
          <div className="switch-auth">
            <span>Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
