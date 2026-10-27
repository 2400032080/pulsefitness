import { useEffect, useState } from "react";

function Attendance({ onBack }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("PRESENT");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  // =========================
  // GET ATTENDANCE
  // =========================

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("JWT token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/attendance",
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

      setAttendance(data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Attendance Service.");
      setLoading(false);
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setMemberId("");
    setDate("");
    setStatus("PRESENT");
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // =========================
  // ADD ATTENDANCE
  // =========================

  const addAttendance = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/attendance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId: Number(memberId),
            date,
            status,
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
      fetchAttendance();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Attendance Service.");
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (record) => {
    setEditingId(record.id);
    setMemberId(record.memberId);
    setDate(record.date);
    setStatus(record.status);
    setShowForm(true);
    setError("");
  };

  // =========================
  // UPDATE ATTENDANCE
  // =========================

  const updateAttendance = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/attendance/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId: Number(memberId),
            date,
            status,
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
      fetchAttendance();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Attendance Service.");
    }
  };

  // =========================
  // DELETE ATTENDANCE
  // =========================

  const deleteAttendance = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/attendance/${id}`,
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

      fetchAttendance();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Attendance Service.");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredAttendance = attendance.filter(
    (record) => {
      const searchText = search.toLowerCase();

      return (
        record.id
          .toString()
          .includes(searchText) ||

        record.memberId
          .toString()
          .includes(searchText) ||

        record.date
          .toLowerCase()
          .includes(searchText) ||

        record.status
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <h2>Loading attendance...</h2>;
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

          <h2>Attendance</h2>

          <p>
            Track and manage member attendance
          </p>

        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setMemberId("");
            setDate("");
            setStatus("PRESENT");
            setError("");
          }}
        >
          + Mark Attendance
        </button>

      </div>


      {/* SEARCH */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search by ID, member ID, date or status..."
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
              ? "Edit Attendance"
              : "Mark Attendance"}
          </h3>

          <form
            onSubmit={
              editingId
                ? updateAttendance
                : addAttendance
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


            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />


            <label>Status</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >

              <option value="PRESENT">
                PRESENT
              </option>

              <option value="ABSENT">
                ABSENT
              </option>

            </select>


            <div className="form-buttons">

              <button type="submit">

                {editingId
                  ? "Update Attendance"
                  : "Mark Attendance"}

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


      {/* ATTENDANCE TABLE */}

      {filteredAttendance.length === 0 ? (

        <p>
          {search
            ? "No attendance records match your search."
            : "No attendance records found."}
        </p>

      ) : (

        <div className="members-table-container">

          <table className="members-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Member ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredAttendance.map(
                (record) => (

                  <tr key={record.id}>

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
                      <strong>
                        {record.status}
                      </strong>
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          onClick={() =>
                            startEdit(record)
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteAttendance(
                              record.id
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

export default Attendance;