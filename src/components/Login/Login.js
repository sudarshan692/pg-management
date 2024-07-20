import React, { useState, useEffect } from "react";
import { auth } from "../shared/firebase";
import { useHistory } from "react-router-dom";
import "./login.css";
import LoadingSpinner from "../shared/LoadingSpinner";
import CustomSnackbar from "../shared/CustomSnackbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const history = useHistory();

  useEffect(() => {
    if (auth.currentUser) {
      history.push("/pg-selection");
    }
  }, [history]);

  const validateInputs = () => {
    let isValid = true;
    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email address");
      isValid = false;
    } else {
      setEmailError("");
    }
    // Password validation
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password should be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }
    return isValid;
  };

  const handleLogin = async () => {
    try {
      if (!validateInputs()) {
        return;
      }

      setLoading(true);
      await auth.signInWithEmailAndPassword(email, password);

      // Check if the logged-in user's email matches specific email ID
      if (email === 'sudarshanakpatil@gmail.com') {
        history.push("/admin-dashboard");
      }

      console.log("Login successful");
    } catch (error) {
      console.error("Error logging in:", error.message);
      // Check for specific error codes and show different error messages
      if (error.code === "auth/invalid-credential") {
        setSnackbarMessage("Please enter correct credentials.");
      } else if (error.code === "auth/too-many-requests") {
        setSnackbarMessage("Too many incorrect attempts. Try again later or reset your password.");
      } else {
        setSnackbarMessage("An error occurred during login. Please try after sometime.");
      }
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {loading && (
        <div className="overlay">
          <LoadingSpinner />
        </div>
      )}
      <h1 className="login-nav-heading">Welcome to PG Management Application</h1>
      <div className="login-card">
        <h2 className="card-heading">Admin Login</h2>
        <div>
          <label className="login-labels">Email *</label>
          <input
            placeholder="abc@gmail.com"
            className="login-inputboxes"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="login-validation-message">{emailError}</div>
        </div>
        <div>
          <label className="login-labels">Password *</label>
          <input
            placeholder="Password"
            className="login-inputboxes"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="login-validation-message">{passwordError}</div>
        </div>
        <button
          className="login-button"
          onClick={handleLogin}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgb(3, 21, 37)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#3f51b5";
          }}
        >
          LOG IN
        </button>
      </div>
      {showSnackbar && (
        <CustomSnackbar
          message={snackbarMessage}
          duration={10000}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
};

export default Login;
