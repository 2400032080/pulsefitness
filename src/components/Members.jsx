import { useEffect, useState } from "react";

function Members({ onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [search, setSearch] = useState("");

  // MEMBER DETAILS
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSubscriptions, setMemberSubscriptions] = useState([]);
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  // =========================
  // GET MEMBERS
  // =========================

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("JWT token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/members",
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

      setMembers(data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Member Service.");
      setLoading(false);
    }
  };

  // =========================
  // VIEW MEMBER DETAILS
  // =========================

  const viewMemberDetails = async (member) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("JWT token not found. Please login again.");
        return;
      }

      setSelectedMember(member);
      setDetailsLoading(true);
      setError("");

      // GET SUBSCRIPTIONS

      const subscriptionResponse = await fetch(
        "http://localhost:8080/subscriptions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!subscriptionResponse.ok) {
        const errorText =
          await subscriptionResponse.text();

        setError(
          `Subscription error ${subscriptionResponse.status}: ${errorText}`
        );

        setDetailsLoading(false);
        return;
      }

      const subscriptionData =
        await subscriptionResponse.json();

      const filteredSubscriptions =
        subscriptionData.filter(
          (subscription) =>
            Number(subscription.memberId) ===
            Number(member.id)
        );

      setMemberSubscriptions(
        filteredSubscriptions
      );

      // GET ATTENDANCE

      const attendanceResponse = await fetch(
        "http://localhost:8080/attendance",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!attendanceResponse.ok) {
        const errorText =
          await attendanceResponse.text();

        setError(
          `Attendance error ${attendanceResponse.status}: ${errorText}`
        );

        setDetailsLoading(false);
        return;
      }

      const attendanceData =
        await attendanceResponse.json();

      const filteredAttendance =
        attendanceData.filter(
          (record) =>
            Number(record.memberId) ===
            Number(member.id)
        );

      setMemberAttendance(
        filteredAttendance
      );

      setDetailsLoading(false);

    } catch (error) {
      console.error(error);
      setError("Unable to load member details.");
      setDetailsLoading(false);
    }
  };

  // =========================
  // BACK FROM MEMBER DETAILS
  // =========================

  const closeMemberDetails = () => {
    setSelectedMember(null);
    setMemberSubscriptions([]);
    setMemberAttendance([]);
    setError("");
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // ADD MEMBER
  // =========================

  const addMember = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/members",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
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
      fetchMembers();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Member Service.");
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (member) => {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone);
    setShowForm(true);
    setError("");
  };

  // =========================
  // UPDATE MEMBER
  // =========================

  const updateMember = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/members/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
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
      fetchMembers();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Member Service.");
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================

  const deleteMember = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/members/${id}`,
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

      fetchMembers();

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Member Service.");
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredMembers = members.filter((member) => {
    const searchText = search.toLowerCase();

    return (
      member.name
        .toLowerCase()
        .includes(searchText) ||
      member.email
        .toLowerCase()
        .includes(searchText) ||
      member.phone.includes(searchText) ||
      member.id
        .toString()
        .includes(searchText)
    );
  });

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <h2>Loading members...</h2>;
  }

  // =========================
  // MEMBER DETAILS PAGE
  // =========================

  if (selectedMember) {
    return (
      <div className="member-details">

        <button
          className="back-button"
          onClick={closeMemberDetails}
        >
          ← Back to Members
        </button>

        <div className="members-header">
          <div>
            <h2>Member Details</h2>
            <p>
              View member subscription and attendance
            </p>
          </div>
        </div>

        {error && (
          <p className="message">
            {error}
          </p>
        )}

        {/* MEMBER INFORMATION */}

        <div className="details-card">

          <h3>
            {selectedMember.name}
          </h3>

          <p>
            <strong>ID:</strong>{" "}
            {selectedMember.id}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {selectedMember.email}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {selectedMember.phone}
          </p>

        </div>

        {detailsLoading ? (

          <h3>Loading member details...</h3>

        ) : (

          <>
            {/* SUBSCRIPTION */}

            <div className="details-section">

              <h2>Subscription</h2>

              {memberSubscriptions.length === 0 ? (

                <div className="details-card">
                  <p>
                    No subscription found.
                  </p>
                </div>

              ) : (

                memberSubscriptions.map(
                  (subscription) => (

                    <div
                      className="details-card"
                      key={subscription.id}
                    >

                      <p>
                        <strong>Subscription ID:</strong>{" "}
                        {subscription.id}
                      </p>

                      <p>
                        <strong>Plan:</strong>{" "}
                        {subscription.plan}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {subscription.status}
                      </p>

                      <p>
                        <strong>Start Date:</strong>{" "}
                        {subscription.startDate}
                      </p>

                      <p>
                        <strong>End Date:</strong>{" "}
                        {subscription.endDate}
                      </p>

                    </div>

                  )
                )

              )}

            </div>


            {/* ATTENDANCE */}

            <div className="details-section">

              <h2>Attendance</h2>

              {memberAttendance.length === 0 ? (

                <div className="details-card">
                  <p>
                    No attendance records found.
                  </p>
                </div>

              ) : (

                <div className="members-table-container">

                  <table className="members-table">

                    <thead>

                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {memberAttendance.map(
                        (record) => (

                          <tr key={record.id}>

                            <td>
                              {record.id}
                            </td>

                            <td>
                              {record.date}
                            </td>

                            <td>
                              {record.status}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

      </div>
    );
  }

  // =========================
  // MEMBERS PAGE
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

          <h2>Members</h2>

          <p>
            Manage all PulseFit gym members
          </p>

        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setName("");
            setEmail("");
            setPhone("");
            setError("");
          }}
        >
          + Add Member
        </button>

      </div>


      {/* SEARCH */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search by name, email, phone or ID..."
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
              ? "Edit Member"
              : "Add Member"}
          </h3>

          <form
            onSubmit={
              editingId
                ? updateMember
                : addMember
            }
          >

            <label>Name</label>

            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />


            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            <label>Phone</label>

            <input
              type="text"
              placeholder="Enter phone"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
            />


            <div className="form-buttons">

              <button type="submit">
                {editingId
                  ? "Update Member"
                  : "Add Member"}
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


      {/* MEMBER TABLE */}

      {filteredMembers.length === 0 ? (

        <p>
          {search
            ? "No members match your search."
            : "No members found."}
        </p>

      ) : (

        <div className="members-table-container">

          <table className="members-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredMembers.map(
                (member) => (

                  <tr key={member.id}>

                    <td>
                      {member.id}
                    </td>

                    <td>
                      <strong>
                        {member.name}
                      </strong>
                    </td>

                    <td>
                      {member.email}
                    </td>

                    <td>
                      {member.phone}
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          onClick={() =>
                            viewMemberDetails(member)
                          }
                        >
                          View Details
                        </button>

                        <button
                          onClick={() =>
                            startEdit(member)
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteMember(
                              member.id
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

export default Members;