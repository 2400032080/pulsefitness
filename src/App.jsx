import { useEffect, useState } from "react";
import Members from "./components/Members";
import Subscriptions from "./components/Subscriptions";
import Attendance from "./components/Attendance";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [message, setMessage] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [page, setPage] = useState("dashboard");

  const [totalMembers, setTotalMembers] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);

  const [recentAttendance, setRecentAttendance] = useState([]);
  const [activeSubscriptionList, setActiveSubscriptionList] = useState([]);

  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // =========================
// LOGIN
// =========================

const handleLogin = async (e) => {
  e.preventDefault();

  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:8080/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }
    );

    const data = await response.text();

    console.log("Login status:", response.status);
    console.log("Login response:", data);

    if (response.ok) {
      localStorage.setItem("token", data);

      setLoggedIn(true);
      setPage("dashboard");
      setMessage("");
    } else {
      setMessage("Invalid email or password. Please try again.");
    }

  } catch (error) {
    console.error("Login error:", error);

    setMessage(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }
};
  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setMessage("");
    setDashboardError("");
    setPage("dashboard");
    setLoadingDashboard(false);
  };

  // =========================
  // DASHBOARD DATA
  // =========================

  useEffect(() => {
    if (loggedIn && page === "dashboard") {
      loadDashboardData();
    }
  }, [loggedIn, page]);

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    setDashboardError("");

    try {
      // Keep refresh message visible briefly
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingDashboard(false);
        return;
      }

      // =========================
      // MEMBERS
      // =========================

      const membersResponse = await fetch(
        "http://localhost:8080/members",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (membersResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!membersResponse.ok) {
        throw new Error("Members service failed");
      }

      const membersData = await membersResponse.json();

      setTotalMembers(membersData.length);

      // =========================
      // SUBSCRIPTIONS
      // =========================

      const subscriptionsResponse = await fetch(
        "http://localhost:8080/subscriptions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (subscriptionsResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!subscriptionsResponse.ok) {
        throw new Error("Subscription service failed");
      }

      const subscriptionsData =
        await subscriptionsResponse.json();

      const activeList = subscriptionsData.filter(
        (subscription) =>
          subscription.status === "ACTIVE"
      );

      setActiveSubscriptions(activeList.length);
      setActiveSubscriptionList(activeList);

      // =========================
      // ATTENDANCE
      // =========================

      const attendanceResponse = await fetch(
        "http://localhost:8080/attendance",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (attendanceResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!attendanceResponse.ok) {
        throw new Error("Attendance service failed");
      }

      const attendanceData =
        await attendanceResponse.json();

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const todayPresent = attendanceData.filter(
        (record) =>
          record.date === today &&
          record.status === "PRESENT"
      ).length;

      setTodayAttendance(todayPresent);

      setRecentAttendance(
        attendanceData.slice(-5).reverse()
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setDashboardError(
        "Unable to load dashboard data. Please check that all services are running."
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  // =========================
  // LOGGED-IN DASHBOARD
  // =========================

  if (loggedIn) {
    return (
      <div className="dashboard">

        {/* =========================
            HEADER
        ========================= */}

        <header className="dashboard-header">

          <h1>PulseFit</h1>

          <button onClick={handleLogout}>
            Logout
          </button>

        </header>


        {/* =========================
            DASHBOARD CONTENT
        ========================= */}

        <div className="dashboard-content">

          {/* =========================
              SIDEBAR
          ========================= */}

          <aside className="sidebar">

            <h2>Menu</h2>

            {/* DASHBOARD */}

            <button
              className={
                page === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage("dashboard")
              }
            >
              Dashboard
            </button>


            {/* MEMBERS */}

            <button
              className={
                page === "members"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage("members")
              }
            >
              Members
            </button>


            {/* SUBSCRIPTIONS */}

            <button
              className={
                page === "subscriptions"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage("subscriptions")
              }
            >
              Subscriptions
            </button>


            {/* ATTENDANCE */}

            <button
              className={
                page === "attendance"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPage("attendance")
              }
            >
              Attendance
            </button>

          </aside>


          {/* =========================
              MAIN CONTENT
          ========================= */}

          <main className="main-content">

            {/* =========================
                DASHBOARD PAGE
            ========================= */}

            {page === "dashboard" && (
              <>

                {/* WELCOME */}

                <div className="dashboard-welcome">

                  <h1>
                    Welcome to PulseFit
                  </h1>

                  <p>
                    Manage your gym members,
                    subscriptions and attendance
                    from one place.
                  </p>

                  <button
                    className="refresh-dashboard"
                    onClick={loadDashboardData}
                    disabled={loadingDashboard}
                  >
                    {loadingDashboard
                      ? "Refreshing..."
                      : "Refresh Dashboard"}
                  </button>

                </div>


                {/* DASHBOARD ERROR */}

                {dashboardError && (
                  <div className="dashboard-error">
                    {dashboardError}
                  </div>
                )}


                {/* =========================
                    STATISTICS
                ========================= */}

                <div className="stats">

                  <div className="stat-card">

                    <h3>
                      Total Members
                    </h3>

                    <p>
                      {totalMembers}
                    </p>

                  </div>


                  <div className="stat-card">

                    <h3>
                      Active Subscriptions
                    </h3>

                    <p>
                      {activeSubscriptions}
                    </p>

                  </div>


                  <div className="stat-card">

                    <h3>
                      Present Today
                    </h3>

                    <p>
                      {todayAttendance}
                    </p>

                  </div>

                </div>


                {/* =========================
                    QUICK ACTIONS
                ========================= */}

                <div className="dashboard-section">

                  <h2>
                    Quick Actions
                  </h2>

                  <div className="quick-actions">

                    <button
                      onClick={() =>
                        setPage("members")
                      }
                    >
                      Manage Members
                    </button>


                    <button
                      onClick={() =>
                        setPage("subscriptions")
                      }
                    >
                      Manage Subscriptions
                    </button>


                    <button
                      onClick={() =>
                        setPage("attendance")
                      }
                    >
                      Manage Attendance
                    </button>

                  </div>

                </div>


                {/* =========================
                    DASHBOARD GRID
                ========================= */}

                <div className="dashboard-grid">

                  {/* =========================
                      RECENT ATTENDANCE
                  ========================= */}

                  <div className="dashboard-panel">

                    <div className="panel-header">

                      <h2>
                        Recent Attendance
                      </h2>

                      <button
                        onClick={() =>
                          setPage("attendance")
                        }
                      >
                        View All
                      </button>

                    </div>


                    {recentAttendance.length === 0 ? (

                      <p className="empty-text">
                        No attendance records found.
                      </p>

                    ) : (

                      <div className="dashboard-table">

                        <table>

                          <thead>

                            <tr>

                              <th>
                                ID
                              </th>

                              <th>
                                Member ID
                              </th>

                              <th>
                                Date
                              </th>

                              <th>
                                Status
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {recentAttendance.map(
                              (record) => (

                                <tr
                                  key={record.id}
                                >

                                  <td>
                                    {record.id}
                                  </td>

                                  <td>
                                    {record.memberId}
                                  </td>

                                  <td>
                                    {record.date}
                                  </td>

                                  <td>

                                    <span
                                      className={
                                        record.status ===
                                        "PRESENT"
                                          ? "status-present"
                                          : "status-absent"
                                      }
                                    >
                                      {record.status}
                                    </span>

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </div>


                  {/* =========================
                      ACTIVE SUBSCRIPTIONS
                  ========================= */}

                  <div className="dashboard-panel">

                    <div className="panel-header">

                      <h2>
                        Active Subscriptions
                      </h2>

                      <button
                        onClick={() =>
                          setPage("subscriptions")
                        }
                      >
                        View All
                      </button>

                    </div>


                    {activeSubscriptionList.length === 0 ? (

                      <p className="empty-text">
                        No active subscriptions.
                      </p>

                    ) : (

                      <div className="subscription-list">

                        {activeSubscriptionList
                          .slice(0, 5)
                          .map(
                            (subscription) => (

                              <div
                                className="subscription-item"
                                key={
                                  subscription.id
                                }
                              >

                                <div>

                                  <strong>
                                    Member #
                                    {
                                      subscription.memberId
                                    }
                                  </strong>

                                  <p>
                                    {
                                      subscription.plan
                                    }
                                  </p>

                                </div>


                                <span className="status-active">
                                  {
                                    subscription.status
                                  }
                                </span>

                              </div>

                            )
                          )}

                      </div>

                    )}

                  </div>

                </div>

              </>
            )}


            {/* =========================
                MEMBERS PAGE
            ========================= */}

            {page === "members" && (

              <Members
                onBack={() =>
                  setPage("dashboard")
                }
              />

            )}


            {/* =========================
                SUBSCRIPTIONS PAGE
            ========================= */}

            {page === "subscriptions" && (

              <Subscriptions
                onBack={() =>
                  setPage("dashboard")
                }
              />

            )}


            {/* =========================
                ATTENDANCE PAGE
            ========================= */}

            {page === "attendance" && (

              <Attendance
                onBack={() =>
                  setPage("dashboard")
                }
              />

            )}

          </main>

        </div>

      </div>
    );
  }


  // =========================
  // LOGIN PAGE
  // =========================

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          PulseFit
        </h1>

        <p className="subtitle">
          Welcome back
        </p>


        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          <button type="submit">
            Login
          </button>

        </form>


        {message && (

          <p className="message">
            {message}
          </p>

        )}


        <p className="register-text">

          Don't have an account?{" "}

          <span>
            Register
          </span>

        </p>

      </div>

    </div>

  );
}

export default App;