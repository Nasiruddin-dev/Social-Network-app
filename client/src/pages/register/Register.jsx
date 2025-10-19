import { useState } from "react";
import { Link } from "react-router-dom";
import "./register.scss";
import axios from "axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [err, setErr] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = {};
    if (!inputs.username?.trim()) errors.username = "Username is required";
    if (!inputs.email?.trim()) errors.email = "Email is required";
    if (!inputs.password?.trim()) errors.password = "Password is required";
    return errors;
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErr("Please fill all required fields");
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
      setSuccess(true);
      setErr(null);
      setFieldErrors({});
    } catch (err) {
      setErr(err.response.data);
      setSuccess(false);
    }
  };

  console.log(err)

  return (
    <div className="register force-mobile">
      <div className="card">
        <div className="left">
          <h1>Social Network App</h1>
          <p>
            Connect with friends, share posts and stories, discover people, chat one-on-one or in groups, and plan events — all in one modern social platform.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <div className="intro">
            <h2>Join the Community</h2>
          </div>
          <form>
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            {fieldErrors.username && (
              <span style={{ color: "red", fontSize: 12 }}>
                {fieldErrors.username}
              </span>
            )}
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <span style={{ color: "red", fontSize: 12 }}>
                {fieldErrors.email}
              </span>
            )}
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
            {fieldErrors.password && (
              <span style={{ color: "red", fontSize: 12 }}>
                {fieldErrors.password}
              </span>
            )}
            <input
              type="text"
              placeholder="Name"
              name="name"
              onChange={handleChange}
            />
            {err && err}
            {success && <span style={{color: 'green'}}>Registered successfully!</span>}
            <button onClick={handleClick}>Register</button>
          </form>
          <div className="switch-auth">
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
