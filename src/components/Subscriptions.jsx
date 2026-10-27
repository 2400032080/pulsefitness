import { useEffect, useState } from "react";

function Subscriptions({ onBack }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [memberId, setMemberId] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [status, setStatus] = useState("ACTIVE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // =========================
  // GET SUBSCRIPTIONS
  // =========================

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("JWT token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/subscriptions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        setError(
          `Server error ${response.status}: ${errorText}`
        );

        setLoading(false);
        return;
      }

      const data = await response.json();

      setSubscriptions(data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Subscription Service.");
      setLoading(false);
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setMemberId("");
    setPlan("BASIC");
    setStatus("ACTIVE");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // =========================
  // ADD SUBSCRIPTION
  // =========================

  const addSubscription = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId: Number(memberId),
            plan,
            status,
            startDate,
            endDate,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        setError(
          `Server error ${response.status}: ${errorText}`
        );

        return;
      }

      clearForm();
      fetchSubscriptions();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Subscription Service.");
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (subscription) => {
    setEditingId(subscription.id);
    setMemberId(subscription.memberId);
    setPlan(subscription.plan);
    setStatus(subscription.status);
    setStartDate(subscription.startDate);
    setEndDate(subscription.endDate);
    setShowForm(true);
    setError("");
  };

  // =========================
  // UPDATE SUBSCRIPTION
  // =========================

  const updateSubscription = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/subscriptions/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId: Number(memberId),
            plan,
            status,
            startDate,
            endDate,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        setError(
          `Server error ${response.status}: ${errorText}`
        );

        return;
      }

      clearForm();
      fetchSubscriptions();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Subscription Service.");
    }
  };

  // =========================
  // DELETE SUBSCRIPTION
  // =========================

  const deleteSubscription = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/subscriptions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        setError(
          `Server error ${response.status}: ${errorText}`
        );

        return;
      }

      fetchSubscriptions();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Subscription Service.");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredSubscriptions = subscriptions.filter(
    (subscription) => {
      const searchText = search.toLowerCase();

      return (
        subscription.id
          .toString()
          .includes(searchText) ||

        subscription.memberId
          .toString()
          .includes(searchText) ||

        subscription.plan
          .toLowerCase()
          .includes(searchText) ||

        subscription.status
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <h2>Loading subscriptions...</h2>;
  }

  // =========================
  // UI
  // =========================

  return (
    <div>

      {/* BACK BUTTON */}

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>


      {/* HEADER */}

      <div className="members-header">

        <div>

          <h2>Subscriptions</h2>

          <p>
            Manage all PulseFit membership subscriptions
          </p>

        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setMemberId("");
            setPlan("BASIC");
            setStatus("ACTIVE");
            setStartDate("");
            setEndDate("");
            setError("");
          }}
        >
          + Add Subscription
        </button>

      </div>


      {/* SEARCH */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search by ID, member ID, plan or status..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      {/* ERROR */}

      {error && (
        <p className="message">
          {error}
        </p>
      )}


      {/* ADD / EDIT FORM */}

      {showForm && (

        <div className="member-form">

          <h3>
            {editingId
              ? "Edit Subscription"
              : "Add Subscription"}
          </h3>

          <form
            onSubmit={
              editingId
                ? updateSubscription
                : addSubscription
            }
          >

            <label>Member ID</label>

            <input
              type="number"
              placeholder="Enter member ID"
              value={memberId}
              onChange={(e) =>
                setMemberId(e.target.value)
              }
              required
            />


            <label>Plan</label>

            <select
              value={plan}
              onChange={(e) =>
                setPlan(e.target.value)
              }
            >

              <option value="BASIC">
                BASIC
              </option>

              <option value="PREMIUM">
                PREMIUM
              </option>

            </select>


            <label>Status</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >

              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="EXPIRED">
                EXPIRED
              </option>

              <option value="CANCELLED">
                CANCELLED
              </option>

            </select>


            <label>Start Date</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              required
            />


            <label>End Date</label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              required
            />


            <div className="form-buttons">

              <button type="submit">

                {editingId
                  ? "Update Subscription"
                  : "Add Subscription"}

              </button>

              <button
                type="button"
                onClick={clearForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* SUBSCRIPTION TABLE */}

      {filteredSubscriptions.length === 0 ? (

        <p>
          {search
            ? "No subscriptions match your search."
            : "No subscriptions found."}
        </p>

      ) : (

        <div className="members-table-container">

          <table className="members-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Member ID</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredSubscriptions.map(
                (subscription) => (

                  <tr key={subscription.id}>

                    <td>
                      {subscription.id}
                    </td>

                    <td>
                      {subscription.memberId}
                    </td>

                    <td>
                      <strong>
                        {subscription.plan}
                      </strong>
                    </td>

                    <td>
                      {subscription.status}
                    </td>

                    <td>
                      {subscription.startDate}
                    </td>

                    <td>
                      {subscription.endDate}
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          onClick={() =>
                            startEdit(subscription)
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteSubscription(
                              subscription.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Subscriptions;