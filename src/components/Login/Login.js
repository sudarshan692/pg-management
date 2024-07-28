import React, { useState, useEffect } from "react";
import { auth } from "../shared/firebase";
import { useHistory, useLocation } from "react-router-dom";
import "./login.css";
import LoadingSpinner from "../shared/LoadingSpinner";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (auth.currentUser) {
      history.push("/pg-selection");
    }
  }, [history]);

  useEffect(() => {
    if (location.state && location.state.showSnackbar) {
      setSnackbarMessage(location.state.message);
      setSnackbarSeverity(location.state.severity);
      setShowSnackbar(true);
      history.replace({
        pathname: location.pathname,
        state: {}
      });
    }
  }, [location, history]);

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
      // Show loading overlay before reloading
      document.body.classList.add('loading-overlay-visible');
      // Delay the reload to allow the overlay to be visible
      setTimeout(() => {
        window.location.reload();
      }, 100); // Adjust delay if needed
      if (email === 'sudarshanakpatil@gmail.com') {
        history.push({
          pathname: "/admin-dashboard",
          state: { showSnackbar: true, message: "Login successful", severity: "success" }
        });
      } else {
        history.push({
          pathname: "/pg-selection",
          state: { showSnackbar: true, message: "Login successful", severity: "success" }
        });
      }
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
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
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
            e.target.style.backgroundColor = "#1a73e8";
          }}
        >
          LOG IN
        </button>
      </div>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
