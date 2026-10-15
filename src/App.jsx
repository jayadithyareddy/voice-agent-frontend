
import React, { useState, useEffect } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./index.css";
import Login from "./Login";

const API_URL = "https://voice-agent-backend-yzgl.onrender.com/api";
const USER_KEY = "ddlLabUser";

function App() {
  const [user, setUser] = useState(() => localStorage.getItem(USER_KEY) || "");
  const [page, setPage] = useState("Dashboard");
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function checkBackend() {
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/health");
      setOnline(response.ok);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) checkBackend();
  }, [user]);

  function login(username) {
    const value = String(username || "User").trim();
    localStorage.setItem(USER_KEY, value);
    setUser(value);
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    setUser("");
    setPage("Dashboard");
  }

  function addCustomer(event) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage("Enter a name and email.");
      return;
    }

    setCustomers((previous) =>
      previous.concat({
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
      })
    );
    setName("");
    setEmail("");
    setMessage("Customer added.");
  }

  function removeCustomer(id) {
    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id)
    );
  }

  const filteredCustomers = customers.filter((customer) =>
    (customer.name + " " + customer.email)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!user) return <Login onLogin={login} />;

  const pages = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Voice Agent", icon: Bot },
    { label: "Customers", icon: Users },
    { label: "Knowledge Base", icon: BookOpen },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Bot size={28} />
          <div>
            <h2>Voice AI</h2>
            <span>Management Console</span>
          </div>
        </div>

        <nav className="navigation">
          {pages.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className={
                  page === item.label ? "nav-item nav-active" : "nav-item"
                }
                onClick={() => {
                  setPage(item.label);
                  setMessage("");
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <strong>{user}</strong>
          <button
            type="button"
            className="nav-item logout-button"
            onClick={logout}
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>Welcome back, {user}</p>
          </div>
          <div className="topbar-actions">
            <span
              className={
                online ? "status-pill status-online" : "status-pill status-offline"
              }
            >
              {online ? <Wifi size={15} /> : <WifiOff size={15} />}
              {online ? "Backend online" : "Backend offline"}
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={checkBackend}
              disabled={loading}
              aria-label="Refresh backend status"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {page === "Dashboard" && (
            <>
              <section className="welcome-banner">
                <div>
                  <span className="eyebrow">OVERVIEW</span>
                  <h2>Your AI voice agent workspace</h2>
                  <p>Manage your service and customers in one place.</p>
                </div>
                <Bot size={45} />
              </section>

              <section className="stats-grid">
                <article className="stat-card">
                  <Users size={24} />
                  <p>Total Customers</p>
                  <h3>{customers.length}</h3>
                </article>
                <article className="stat-card">
                  <Activity size={24} />
                  <p>Backend Status</p>
                  <h3>{online ? "Online" : "Offline"}</h3>
                </article>
                <article className="stat-card">
                  <BookOpen size={24} />
                  <p>Knowledge Base</p>
                  <h3>Available to configure</h3>
                </article>
                <article className="stat-card">
                  <Bot size={24} />
                  <p>Voice Agent</p>
                  <h3>Dashboard ready</h3>
                </article>
              </section>

              <section className="panel">
                <h2>System health</h2>
                <p>
                  {online
                    ? "Backend health check succeeded."
                    : "The backend could not be reached. Check the service and API URL."}
                </p>
                {online ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <WifiOff size={22} />
                )}
                <button
                  type="button"
                  className="primary-button"
                  onClick={checkBackend}
                >
                  Check connection
                </button>
              </section>
            </>
          )}

          {page === "Voice Agent" && (
            <section className="panel">
              <Bot size={30} />
              <h2>Voice Agent</h2>
              <p>Backend endpoint: {API_URL + "/health"}</p>
              <p>{online ? "Connected" : "Not connected"}</p>
              <button
                type="button"
                className="primary-button"
                onClick={checkBackend}
              >
                Test connection
              </button>
            </section>
          )}

          {page === "Customers" && (
            <section className="panel">
              <h2>Customer Management</h2>
              <form className="customer-form" onSubmit={addCustomer}>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Customer name"
                  aria-label="Customer name"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Customer email"
                  aria-label="Customer email"
                />
                <button type="submit" className="primary-button">
                  <Plus size={17} /> Add customer
                </button>
              </form>

              {message && <p>{message}</p>}

              <div className="search-box">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers"
                  aria-label="Search customers"
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => removeCustomer(customer.id)}
                            aria-label={"Delete " + customer.name}
                          >
                            <Trash2 size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan="3">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {page === "Knowledge Base" && (
            <section className="panel">
              <BookOpen size={30} />
              <h2>Knowledge Base</h2>
              <p>
                Connect your knowledge base API to manage documents here.
              </p>
            </section>
          )}

          {page === "Settings" && (
            <section className="panel">
              <Settings size={30} />
              <h2>Settings</h2>
              <p>Signed in as: {user}</p>
              <p>Backend API: {API_URL}</p>
              <button
                type="button"
                className="danger-button"
                onClick={logout}
              >
                <LogOut size={17} /> Sign out
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
