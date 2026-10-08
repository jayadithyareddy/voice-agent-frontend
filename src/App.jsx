import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Phone,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  PhoneCall,
  MessageSquare,
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  TrendingUp,
  LogOut,
} from "lucide-react";

import "./index.css";
import CustomerImport from "./CustomerImport";
import Login from "./Login";
import Chatbot from "./Chatbot";

const API_URL = "http://localhost:8080/api";

const initialCustomers = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    company: "Sharma Enterprises",
    status: "Active",
    notes: "Interested in premium plan",
  },
  {
    id: 2,
    name: "Priya Reddy",
    phone: "+91 99887 66554",
    email: "priya@example.com",
    company: "Reddy Solutions",
    status: "Active",
    notes: "Follow up next week",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    phone: "+91 91234 56789",
    email: "arjun@example.com",
    company: "AK Technologies",
    status: "Pending",
    notes: "Requested product demo",
  },
];

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  company: "",
  status: "Active",
  notes: "",
};

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("ddlLabUser"))
  );

  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("ddlLabUser") || ""
  );

  const [activePage, setActivePage] = useState("Dashboard");

  const [customers, setCustomers] = useState(initialCustomers);

  const [search, setSearch] = useState("");

  const [showCustomerImport, setShowCustomerImport] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [customerForm, setCustomerForm] = useState(emptyCustomer);

  const [backendOnline, setBackendOnline] = useState(false);

  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    checkBackend();
    loadCustomers();
  }, [loggedIn]);

  const handleLogin = (name) => {
    localStorage.setItem("ddlLabUser", name);
    setCurrentUser(name);
    setLoggedIn(true);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("ddlLabUser");
    setCurrentUser("");
    setLoggedIn(false);
  };

  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);

    try {
      const response = await fetch(`${API_URL}/customers`);

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }

      setBackendOnline(true);
    } catch (error) {
      console.log("Using local customer data:", error.message);
      setBackendOnline(false);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const importCustomers = async (importedCustomers) => {
    if (
      !Array.isArray(importedCustomers) ||
      importedCustomers.length === 0
    ) {
      return;
    }

    try {
      const savedCustomers = [];

      for (const customer of importedCustomers) {
        const response = await fetch(`${API_URL}/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customer.name || "",
            phone: customer.phone || "",
            email: customer.email || "",
            company: customer.company || "",
            status: customer.status || "Active",
            notes: customer.notes || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save imported customer");
        }

        const data = await response.json();

        const savedCustomer = data.customer || data;

        if (savedCustomer) {
          savedCustomers.push(savedCustomer);
        }
      }

      if (savedCustomers.length > 0) {
        setCustomers((current) => [
          ...savedCustomers,
          ...current,
        ]);
      }

      setShowCustomerImport(false);
      setBackendOnline(true);

      alert(
        `${savedCustomers.length} customer(s) imported successfully.`
      );
    } catch (error) {
      console.error("Import error:", error);

      alert(
        "Import failed. Make sure the Java backend is running on port 8080."
      );
    }
  };

  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ ...emptyCustomer });
    setShowCustomerModal(true);
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);

    setCustomerForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      company: customer.company || "",
      status: customer.status || "Active",
      notes: customer.notes || "",
    });

    setShowCustomerModal(true);
  };

  const closeCustomerModal = () => {
    if (savingCustomer) {
      return;
    }

    setShowCustomerModal(false);
    setEditingCustomer(null);
    setCustomerForm({ ...emptyCustomer });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveCustomer = async (event) => {
    event.preventDefault();

    if (
      !customerForm.name.trim() ||
      !customerForm.phone.trim()
    ) {
      alert("Name and phone are required.");
      return;
    }

    setSavingCustomer(true);

    try {
      const isEditing = Boolean(editingCustomer);

      const endpoint = isEditing
        ? `${API_URL}/customers/${editingCustomer.id}`
        : `${API_URL}/customers`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerForm.name.trim(),
          phone: customerForm.phone.trim(),
          email: customerForm.email.trim(),
          company: customerForm.company.trim(),
          status: customerForm.status,
          notes: customerForm.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      const savedCustomer = data.customer || data;

      if (!savedCustomer) {
        throw new Error("Unable to save customer");
      }

      if (isEditing) {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === savedCustomer.id
              ? savedCustomer
              : customer
          )
        );
      } else {
        setCustomers((current) => [
          savedCustomer,
          ...current,
        ]);
      }

      setBackendOnline(true);

      closeCustomerModal();
    } catch (error) {
      console.error(error);

      const localCustomer = {
        ...customerForm,
        id: editingCustomer?.id || Date.now(),
      };

      if (editingCustomer) {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === editingCustomer.id
              ? localCustomer
              : customer
          )
        );
      } else {
        setCustomers((current) => [
          localCustomer,
          ...current,
        ]);
      }

      closeCustomerModal();
    } finally {
      setSavingCustomer(false);
    }
  };

  const deleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `Delete ${customer.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      if (backendOnline && customer.id) {
        const response = await fetch(
          `${API_URL}/customers/${customer.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Delete request failed");
        }
      }
    } catch (error) {
      console.error(error);
    }

    setCustomers((current) =>
      current.filter(
        (item) => item.id !== customer.id
      )
    );
  };

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.company,
        customer.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [customers, search]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const pendingCustomers = customers.filter(
    (customer) => customer.status === "Pending"
  ).length;

  const navigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      icon: Users,
    },
    {
      label: "Voice Agent",
      icon: Phone,
    },
    {
      label: "Analytics",
      icon: BarChart3,
    },
    {
      label: "Knowledge Base",
      icon: BookOpen,
    },
    {
      label: "Settings",
      icon: Settings,
    },
  ];

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Bot size={22} />
          </div>

          <div>
            <div className="brand-title">
              DDL LAB
            </div>

            <div className="brand-subtitle">
              AI VOICE AUTOMATION
            </div>
          </div>

        </div>

        <nav className="sidebar-nav">

          {navigation.map((item) => {

            const Icon = item.icon;

            const isActive =
              activePage === item.label;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  setActivePage(item.label)
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="backend-status">

            <span
              className={`status-dot ${
                backendOnline
                  ? "online"
                  : "offline"
              }`}
            />

            <span>
              {backendOnline
                ? "Backend Online"
                : "Demo Mode"}
            </span>

          </div>

          <div className="user-card">

            <div className="user-avatar">
              {(currentUser || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="user-name">
                {currentUser || "DDL LAB Admin"}
              </div>

              <div className="user-role">
                Administrator
              </div>
            </div>

            <button
              className="icon-button"
              title="Logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>

          </div>

        </div>

      </aside>

      <main className="main-area">

        <header className="topbar">

          <div>

            <h1>
              {activePage}
            </h1>

            <p>
              {activePage === "Dashboard" &&
                "Manage your AI customer engagement system"}

              {activePage === "Customers" &&
                "Manage customer contacts and conversations"}

              {activePage === "Voice Agent" &&
                "Monitor and manage your AI voice agent"}

              {activePage === "Analytics" &&
                "Track customer engagement performance"}

              {activePage === "Knowledge Base" &&
                "Manage information used by your AI agent"}

              {activePage === "Settings" &&
                "Configure your AI customer engagement system"}
            </p>

          </div>

          <div className="topbar-actions">

            <div className="topbar-status">
              <span className="live-dot" />
              System Active
            </div>

          </div>

        </header>

        <div className="page-content">

          {activePage === "Dashboard" && (
            <DashboardPage
              customers={customers}
              activeCustomers={activeCustomers}
              pendingCustomers={pendingCustomers}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "Customers" && (
            <CustomersPage
              customers={customers}
              filteredCustomers={filteredCustomers}
              search={search}
              setSearch={setSearch}
              loadingCustomers={loadingCustomers}
              backendOnline={backendOnline}
              openAddCustomer={openAddCustomer}
              openEditCustomer={openEditCustomer}
              deleteCustomer={deleteCustomer}
              loadCustomers={loadCustomers}
              openCustomerImport={() =>
                setShowCustomerImport(true)
              }
            />
          )}

          {activePage === "Voice Agent" && (
            <VoiceAgentPage />
          )}

          {activePage === "Analytics" && (
            <AnalyticsPage
              customers={customers}
            />
          )}

          {activePage === "Knowledge Base" && (
            <KnowledgeBasePage />
          )}

          {activePage === "Settings" && (
            <SettingsPage />
          )}

        </div>

      </main>

      {showCustomerImport && (
        <CustomerImport
          onClose={() =>
            setShowCustomerImport(false)
          }
          onImport={importCustomers}
        />
      )}

      {showCustomerModal && (
        <CustomerModal
          customer={customerForm}
          editing={Boolean(editingCustomer)}
          saving={savingCustomer}
          onChange={handleFormChange}
          onClose={closeCustomerModal}
          onSubmit={saveCustomer}
        />
      )}

      <Chatbot />

    </div>
  );
}

function DashboardPage({
  customers,
  activeCustomers,
  pendingCustomers,
  setActivePage,
}) {
  return (
    <div className="dashboard-page">

      <section className="hero-banner">

        <div className="hero-content">

          <div className="hero-icon">
            <Bot size={28} />
          </div>

          <div>

            <div className="hero-label">
              DDL LAB AI VOICE
            </div>

            <h2>
              Your AI agent is ready to talk
            </h2>

            <p>
              Handle customer calls automatically,
              qualify leads, answer questions and
              create follow-ups.
            </p>

          </div>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setActivePage("Voice Agent")
          }
        >
          <PhoneCall size={17} />
          Open Voice Agent
        </button>

      </section>

      <section className="stat-grid">

        <StatCard
          icon={<Users size={21} />}
          label="Total Customers"
          value={customers.length}
          trend="+12%"
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Active Customers"
          value={activeCustomers}
          trend="+8%"
        />

        <StatCard
          icon={<PhoneCall size={21} />}
          label="Calls Today"
          value="24"
          trend="+18%"
        />

        <StatCard
          icon={<TrendingUp size={21} />}
          label="Success Rate"
          value="94%"
          trend="+4.2%"
        />

      </section>

      <section className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>
                AI Agent Overview
              </h3>

              <p>
                Current agent activity
              </p>
            </div>

            <span className="badge success">
              Active
            </span>

          </div>

          <div className="agent-overview">

            <div className="agent-circle">
              <Bot size={34} />
            </div>

            <div className="agent-info">

              <strong>
                DDL LAB Voice Agent
              </strong>

              <span>
                Ready for incoming conversations
              </span>

            </div>

          </div>

          <div className="mini-metrics">

            <div>
              <span>Calls</span>
              <strong>24</strong>
            </div>

            <div>
              <span>Avg. Duration</span>
              <strong>3m 42s</strong>
            </div>

            <div>
              <span>Resolved</span>
              <strong>22</strong>
            </div>

          </div>

        </div>

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>
                Recent Customers
              </h3>

              <p>
                Latest customer activity
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("Customers")
              }
            >
              View all
            </button>

          </div>

          <div className="recent-list">

            {customers.slice(0, 4).map(
              (customer) => (

                <div
                  className="recent-customer"
                  key={customer.id}
                >

                  <div className="customer-avatar">
                    {customer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="recent-customer-info">

                    <strong>
                      {customer.name}
                    </strong>

                    <span>
                      {customer.company ||
                        customer.phone}
                    </span>

                  </div>

                  <span
                    className={`badge ${
                      customer.status === "Active"
                        ? "success"
                        : "warning"
                    }`}
                  >
                    {customer.status}
                  </span>

                </div>
              )
            )}

            {customers.length === 0 && (
              <div className="empty-state">
                No customers yet.
              </div>
            )}

          </div>

        </div>

      </section>

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Quick Actions
            </h3>

            <p>
              Common tasks
            </p>
          </div>

        </div>

        <div className="quick-actions">

          <button
            className="quick-action"
            onClick={() =>
              setActivePage("Customers")
            }
          >
            <Users size={20} />

            <span>
              <strong>
                Manage Customers
              </strong>

              <small>
                Add, edit and manage customers
              </small>
            </span>

          </button>

          <button
            className="quick-action"
            onClick={() =>
              setActivePage("Voice Agent")
            }
          >
            <Phone size={20} />

            <span>
              <strong>
                Test Voice Agent
              </strong>

              <small>
                Start a demo conversation
              </small>
            </span>

          </button>

          <button
            className="quick-action"
            onClick={() =>
              setActivePage("Analytics")
            }
          >
            <BarChart3 size={20} />

            <span>
              <strong>
                View Analytics
              </strong>

              <small>
                Check performance metrics
              </small>
            </span>

          </button>

        </div>

      </section>

    </div>
  );
}

function CustomersPage({
  customers,
  filteredCustomers,
  search,
  setSearch,
  loadingCustomers,
  backendOnline,
  openAddCustomer,
  openEditCustomer,
  deleteCustomer,
  loadCustomers,
  openCustomerImport,
}) {
  return (
    <div className="customers-page">

      <div className="page-toolbar">

        <div>
          <h2>
            Customers
          </h2>

          <p>
            {customers.length} customer records
          </p>
        </div>

        <div className="toolbar-right">

          <button
            className="secondary-button"
            onClick={openCustomerImport}
          >
            Import Customer
          </button>

          <button
            className="primary-button"
            onClick={openAddCustomer}
          >
            <Plus size={18} />
            Add Customer
          </button>

        </div>

      </div>

      <div className="customer-toolbar panel">

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="toolbar-right">

          <span
            className={`connection-label ${
              backendOnline
                ? "connected"
                : "disconnected"
            }`}
          >
            <span className="status-dot" />

            {backendOnline
              ? "Database connected"
              : "Local demo data"}
          </span>

          <button
            className="secondary-button"
            onClick={loadCustomers}
          >
            Refresh
          </button>

        </div>

      </div>

      <div className="panel customer-table-panel">

        <div className="table-wrapper">

          <table className="customer-table">

            <thead>

              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loadingCustomers ? (

                <tr>
                  <td
                    colSpan="6"
                    className="table-empty"
                  >
                    Loading customers...
                  </td>
                </tr>

              ) : filteredCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="table-empty"
                  >
                    No customers found.
                  </td>
                </tr>

              ) : (

                filteredCustomers.map(
                  (customer) => (

                    <tr key={customer.id}>

                      <td>

                        <div className="table-customer">

                          <div className="customer-avatar">
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>

                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              {customer.email ||
                                "No email"}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>
                        {customer.phone}
                      </td>

                      <td>
                        {customer.company || "—"}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            customer.status === "Active"
                              ? "success"
                              : "warning"
                          }`}
                        >
                          {customer.status}
                        </span>

                      </td>

                      <td className="notes-cell">
                        {customer.notes || "—"}
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="icon-button"
                            title="Call"
                            onClick={() =>
                              (window.location.href =
                                `tel:${customer.phone}`)
                            }
                          >
                            <PhoneCall size={16} />
                          </button>

                          <button
                            className="icon-button"
                            title="SMS"
                            onClick={() =>
                              (window.location.href =
                                `sms:${customer.phone}`)
                            }
                          >
                            <MessageSquare size={16} />
                          </button>

                          <button
                            className="icon-button"
                            title="Edit"
                            onClick={() =>
                              openEditCustomer(customer)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button danger"
                            title="Delete"
                            onClick={() =>
                              deleteCustomer(customer)
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function CustomerModal({
  customer,
  editing,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >

      <div
        className="modal-card"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
              {editing
                ? "Edit Customer"
                : "Add Customer"}
            </h2>

            <p>
              {editing
                ? "Update customer information"
                : "Create a new customer record"}
            </p>

          </div>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>

        <form onSubmit={onSubmit}>

          <div className="form-grid">

            <label className="form-field">

              <span>
                Name *
              </span>

              <input
                name="name"
                value={customer.name}
                onChange={onChange}
                placeholder="Customer name"
                required
              />

            </label>

            <label className="form-field">

              <span>
                Phone *
              </span>

              <input
                name="phone"
                value={customer.phone}
                onChange={onChange}
                placeholder="+91 98765 43210"
                required
              />

            </label>

            <label className="form-field">

              <span>
                Email
              </span>

              <input
                name="email"
                type="email"
                value={customer.email}
                onChange={onChange}
                placeholder="customer@example.com"
              />

            </label>

            <label className="form-field">

              <span>
                Company
              </span>

              <input
                name="company"
                value={customer.company}
                onChange={onChange}
                placeholder="Company name"
              />

            </label>

            <label className="form-field">

              <span>
                Status
              </span>

              <select
                name="status"
                value={customer.status}
                onChange={onChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </label>

            <label className="form-field full-width">

              <span>
                Notes
              </span>

              <textarea
                name="notes"
                value={customer.notes}
                onChange={onChange}
                placeholder="Add customer notes..."
                rows="4"
              />

            </label>

          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Add Customer"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          <TrendingUp size={13} />
          {trend} this month
        </small>

      </div>

    </div>
  );
}

function VoiceAgentPage() {
  return (
    <div className="voice-page">

      <section className="voice-grid">

        <div className="panel voice-agent-card">

          <div className="voice-status">
            <span className="live-dot" />
            LIVE AGENT
          </div>

          <div className="voice-orb">
            <Bot size={52} />
          </div>

          <h2>
            DDL LAB Voice Agent
          </h2>

          <p>
            Your AI voice agent is configured
            and ready to handle customer
            conversations.
          </p>

          <button className="primary-button">
            <PhoneCall size={18} />
            Start Test Call
          </button>

        </div>

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>
                Agent Performance
              </h3>

              <p>
                Today's activity
              </p>
            </div>

          </div>

          <div className="performance-list">

            <div className="performance-item">
              <PhoneCall size={19} />
              <span>Calls handled</span>
              <strong>24</strong>
            </div>

            <div className="performance-item">
              <Clock3 size={19} />
              <span>Average duration</span>
              <strong>3m 42s</strong>
            </div>

            <div className="performance-item">
              <CheckCircle2 size={19} />
              <span>Successfully resolved</span>
              <strong>22</strong>
            </div>

            <div className="performance-item">
              <Activity size={19} />
              <span>Customer satisfaction</span>
              <strong>94%</strong>
            </div>

          </div>

        </div>

      </section>

      <section className="panel">

        <div className="panel-header">

          <div>
            <h3>
              Recent Calls
            </h3>

            <p>
              Latest AI agent conversations
            </p>
          </div>

        </div>

        <div className="call-list">

          {[
            ["Rahul Sharma", "3m 12s", "Resolved"],
            ["Priya Reddy", "4m 08s", "Resolved"],
            ["Arjun Kumar", "2m 51s", "Follow-up"],
          ].map(
            ([name, duration, status]) => (

              <div
                className="call-row"
                key={name}
              >

                <div className="customer-avatar">
                  {name.charAt(0)}
                </div>

                <div className="call-info">

                  <strong>
                    {name}
                  </strong>

                  <span>
                    Voice conversation
                  </span>

                </div>

                <span>
                  {duration}
                </span>

                <span
                  className={`badge ${
                    status === "Resolved"
                      ? "success"
                      : "warning"
                  }`}
                >
                  {status}
                </span>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}

function AnalyticsPage({ customers }) {
  return (
    <div className="analytics-page">

      <section className="analytics-grid">

        <StatCard
          icon={<PhoneCall size={21} />}
          label="Total Calls"
          value="1,248"
          trend="+18%"
        />

        <StatCard
          icon={<CheckCircle2 size={21} />}
          label="Resolved"
          value="1,176"
          trend="+14%"
        />

        <StatCard
          icon={<Clock3 size={21} />}
          label="Avg. Call Time"
          value="3m 42s"
          trend="-8%"
        />

        <StatCard
          icon={<TrendingUp size={21} />}
          label="Success Rate"
          value="94%"
          trend="+4.2%"
        />

      </section>

      <section className="analytics-grid-large">

        <div className="panel chart-panel">

          <div className="panel-header">

            <div>
              <h3>
                Call Activity
              </h3>

              <p>
                Calls handled over the last 7 days
              </p>
            </div>

          </div>

          <div className="fake-chart">

            {[42, 58, 51, 76, 68, 88, 94].map(
              (height, index) => (

                <div
                  className="chart-column"
                  key={index}
                >

                  <div
                    className="chart-bar"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span>
                    {
                      [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                      ][index]
                    }
                  </span>

                </div>

              )
            )}

          </div>

        </div>

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>
                Customer Overview
              </h3>

              <p>
                Current customer base
              </p>
            </div>

          </div>

          <div className="overview-number">
            {customers.length}
          </div>

          <div className="overview-label">
            Total customers
          </div>

          <div className="overview-bars">

            <div>
              <span>
                Active
              </span>

              <strong>
                {
                  customers.filter(
                    (customer) =>
                      customer.status === "Active"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {
                  customers.filter(
                    (customer) =>
                      customer.status === "Pending"
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

function KnowledgeBasePage() {
  const articles = [
    [
      "Company Information",
      "Business details and company information",
    ],
    [
      "Products & Services",
      "Product catalog and service information",
    ],
    [
      "FAQs",
      "Frequently asked customer questions",
    ],
    [
      "Policies",
      "Returns, support and business policies",
    ],
  ];

  return (
    <div className="knowledge-page">

      <div className="page-toolbar">

        <div>

          <h2>
            Knowledge Base
          </h2>

          <p>
            Information available to your AI agent
          </p>

        </div>

        <button className="primary-button">

          <Plus size={18} />

          Add Knowledge

        </button>

      </div>

      <div className="knowledge-grid">

        {articles.map(
          ([title, description], index) => (

            <div
              className="panel knowledge-card"
              key={title}
            >

              <div className="knowledge-icon">
                <BookOpen size={22} />
              </div>

              <h3>
                {title}
              </h3>

              <p>
                {description}
              </p>

              <div className="knowledge-footer">

                <span>
                  {index + 3} documents
                </span>

                <button className="text-button">
                  Manage
                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}

function SettingsPage() {
  return (
    <div className="settings-page">

      <section className="panel settings-section">

        <div className="panel-header">

          <div>

            <h3>
              AI Agent Settings
            </h3>

            <p>
              Configure your voice agent
            </p>

          </div>

        </div>

        <div className="settings-list">

          <label className="setting-row">

            <div>

              <strong>
                Agent enabled
              </strong>

              <span>
                Allow the AI agent to handle
                conversations
              </span>

            </div>

            <input
              type="checkbox"
              defaultChecked
            />

          </label>

          <label className="setting-row">

            <div>

              <strong>
                Automatic follow-ups
              </strong>

              <span>
                Create follow-up tasks after
                conversations
              </span>

            </div>

            <input
              type="checkbox"
              defaultChecked
            />

          </label>

          <label className="setting-row">

            <div>

              <strong>
                Call recording
              </strong>

              <span>
                Save call recordings for review
              </span>

            </div>

            <input
              type="checkbox"
              defaultChecked
            />

          </label>

        </div>

      </section>

      <section className="panel settings-section">

        <div className="panel-header">

          <div>

            <h3>
              Business Information
            </h3>

            <p>
              Basic business configuration
            </p>

          </div>

        </div>

        <div className="form-grid">

          <label className="form-field">

            <span>
              Business Name
            </span>

            <input
              placeholder="Your business name"
            />

          </label>

          <label className="form-field">

            <span>
              Support Email
            </span>

            <input
              placeholder="support@example.com"
            />

          </label>

          <label className="form-field full-width">

            <span>
              Business Description
            </span>

            <textarea
              rows="4"
              placeholder="Describe your business..."
            />

          </label>

        </div>

        <div className="settings-footer">

          <button className="primary-button">
            Save Settings
          </button>

        </div>

      </section>

    </div>
  );
}

export default App;
