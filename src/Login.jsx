import { useState } from "react";
import "./login.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://voice-agent-backend-yzgl.onrender.com/api"
).replace(/\/+$/, "");

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const isRegister = mode === "register";
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const requestBody = isRegister
        ? {
            name: name.trim(),
            username: username.trim(),
            password,
          }
        : {
            username: username.trim(),
            password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.message || `Request failed with status ${response.status}`
        );
        return;
      }

      if (!data.success) {
        setMessage(
          data.message ||
            (isRegister ? "Registration failed" : "Login failed")
        );
        return;
      }

      if (isRegister) {
        setMessage("Account created successfully. Please sign in.");
        setMode("login");
        setPassword("");
        return;
      }

      const displayName = data.name || username.trim();

      localStorage.setItem("ddlLabUser", displayName);

      if (typeof onLogin === "function") {
        onLogin(displayName);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setMessage("The server took too long to respond. Please try again.");
      } else {
        setMessage(
          "Cannot connect to the backend. Check your internet connection and try again."
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">DDL</div>

        <div className="login-brand">
          <h1>DDL LAB</h1>
          <p>AI VOICE AUTOMATION</p>
        </div>

        <div className="login-heading">
          <h2>
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to continue to DDL LAB"
              : "Register to access the DDL LAB platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="login-field">
              <label htmlFor="register-name">Full name</label>

              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              minLength={3}
              maxLength={30}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === "login"
                  ? "Enter password"
                  : "Create a password (minimum 8 characters)"
              }
              minLength={mode === "register" ? 8 : undefined}
              maxLength={72}
              required
            />
          </div>

          {message && (
            <div
              className="login-error"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "SIGNING IN..."
                : "CREATING ACCOUNT..."
              : mode === "login"
                ? "SIGN IN"
                : "CREATE ACCOUNT"}
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          {mode === "login" ? (
            <>
              <span>New to DDL LAB? </span>

              <button
                type="button"
                onClick={() => switchMode("register")}
                disabled={loading}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              <span>Already have an account? </span>

              <button
                type="button"
                onClick={() => switchMode("login")}
                disabled={loading}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="login-footer">DDL LAB © 2026</div>
      </div>
    </div>
  );
}