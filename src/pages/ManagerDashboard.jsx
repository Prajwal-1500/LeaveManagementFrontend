import { useEffect, useState } from "react";
import {
  getMyLeaves,
  applyLeave,
  cancelLeave,
  getTeamRequests,
  approveLeave,
  rejectLeave,
} from "../api/api";
import Navbar from "../components/Navbar";

const LEAVE_TYPES = [
  { id: 1, name: "Annual Leave" },
  { id: 2, name: "Unpaid Leave" },
  { id: 3, name: "Sick Leave" },
];

function statusBadge(status) {
  const map = {
    Pending: "warning",
    Approved: "success",
    Rejected: "danger",
    Cancelled: "secondary",
  };
  return (
    <span className={`badge bg-${map[status] || "secondary"}`}>{status}</span>
  );
}

export default function ManagerDashboard() {
  const [myData, setMyData] = useState({ requests: [], leaveBalances: [] });
  const [myLoading, setMyLoading] = useState(true);

  const [teamRequests, setTeamRequests] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leaveTypeId: 1,
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [applying, setApplying] = useState(false);
  const [formError, setFormError] = useState("");

  const [activeTab, setActiveTab] = useState("my");

  const [confirmAction, setConfirmAction] = useState(null); 
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchMyLeaves = async () => {
    try {
      setMyLoading(true);
      const res = await getMyLeaves();
      setMyData(res.data);
    } catch (err) {
      setError(
        "Failed to load your leaves: " + (err.response?.data || err.message),
      );
    } finally {
      setMyLoading(false);
    }
  };

  const fetchTeamLeaves = async () => {
    try {
      setTeamLoading(true);
      const res = await getTeamRequests();
      setTeamRequests(res.data);
    } catch (err) {
      setError(
        "Failed to load team leaves: " + (err.response?.data || err.message),
      );
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
    fetchTeamLeaves();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setFormError("");
    try {
      await applyLeave({
        leaveTypeId: Number(form.leaveTypeId),
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      });
      setMsg("Leave applied successfully!");
      setShowForm(false);
      setForm({ leaveTypeId: 1, startDate: "", endDate: "", reason: "" });
      fetchMyLeaves();
    } catch (err) {
      setFormError(err.response?.data || "Failed to apply leave.");
    } finally {
      setApplying(false);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    setActionLoading(true);
    setError("");
    try {
      if (type === "cancel") {
        await cancelLeave(id);
        setMsg("Leave cancelled successfully.");
        await fetchMyLeaves();
      } else if (type === "approve") {
        await approveLeave(id);
        setMsg("Leave approved successfully.");
        await fetchTeamLeaves();
      } else if (type === "reject") {
        await rejectLeave(id, rejectReason);
        setMsg("Leave rejected successfully.");
        setRejectReason("");
        await fetchTeamLeaves();
      }
    } catch (err) {
      const errMsg = err.response?.data || err.message || "Action failed.";
      setError(`Failed to ${type} leave: ${errMsg}`);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const cancelConfirm = () => {
    setConfirmAction(null);
    setRejectReason("");
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h4 className="mb-3">Manager Dashboard</h4>

        {msg && (
          <div className="alert alert-success alert-dismissible">
            {msg}
            <button className="btn-close" onClick={() => setMsg("")} />
          </div>
        )}
        {error && (
          <div className="alert alert-danger alert-dismissible">
            {error}
            <button className="btn-close" onClick={() => setError("")} />
          </div>
        )}

        {}
        {confirmAction && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between">
            <span>
              Are you sure you want to <strong>{confirmAction.type}</strong>{" "}
              leave request?
            </span>
            <div className="d-flex gap-2 ms-3 align-items-center">
              {confirmAction.type === "reject" && (
                <input
                  id="reject-reason-input"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter rejection reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ minWidth: "200px" }}
                />
              )}
              <button
                id={`confirm-yes-${confirmAction.id}`}
                className={`btn btn-sm ${
                  confirmAction.type === "approve"
                    ? "btn-success"
                    : confirmAction.type === "reject"
                      ? "btn-danger"
                      : "btn-warning"
                }`}
                onClick={executeConfirmedAction}
                disabled={actionLoading || (confirmAction.type === "reject" && !rejectReason.trim())}
              >
                {actionLoading ? "Processing..." : `Yes, ${confirmAction.type}`}
              </button>
              <button
                id="confirm-no"
                className="btn btn-sm btn-secondary"
                onClick={cancelConfirm}
                disabled={actionLoading}
              >
                No, cancel
              </button>
            </div>
          </div>
        )}

        {}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              id="tab-my"
              className={`nav-link ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Leaves
            </button>
          </li>
          <li className="nav-item">
            <button
              id="tab-team"
              className={`nav-link ${activeTab === "team" ? "active" : ""}`}
              onClick={() => setActiveTab("team")}
            >
              Team Requests
            </button>
          </li>
        </ul>

        {}
        {activeTab === "my" && (
          <>
            
            <div className="card mb-4">
              <div className="card-header">
                <strong>My Leave Balances</strong>
              </div>
              <div className="card-body">
                {myLoading ? (
                  <p>Loading...</p>
                ) : myData.leaveBalances.length === 0 ? (
                  <p className="text-muted">No balances assigned.</p>
                ) : (
                  <div className="row g-3">
                    {myData.leaveBalances.map((b, i) => (
                      <div key={i} className="col-md-4">
                        <div className="border rounded p-3 text-center">
                          <div className="fw-semibold">{b.leaveType}</div>
                          <div className="fs-4 text-primary">
                            {b.balanceDays}
                          </div>
                          <small className="text-muted">
                            days remaining ({b.year})
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <button
                id="apply-leave-btn"
                className="btn btn-primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Hide Form" : "Apply for Leave"}
              </button>
            </div>

            {showForm && (
              <div className="card mb-4">
                <div className="card-header">
                  <strong>Apply for Leave</strong>
                </div>
                <div className="card-body">
                  {formError && (
                    <div className="alert alert-danger py-2">{formError}</div>
                  )}
                  <form onSubmit={handleApply}>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Leave Type</label>
                        <select
                          id="leaveTypeId"
                          name="leaveTypeId"
                          className="form-select"
                          value={form.leaveTypeId}
                          onChange={handleFormChange}
                        >
                          {LEAVE_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Start Date</label>
                        <input
                          id="mgr-startDate"
                          type="date"
                          name="startDate"
                          className="form-control"
                          value={form.startDate}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">End Date</label>
                        <input
                          id="mgr-endDate"
                          type="date"
                          name="endDate"
                          className="form-control"
                          value={form.endDate}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Reason</label>
                        <textarea
                          id="mgr-reason"
                          name="reason"
                          className="form-control"
                          rows={2}
                          value={form.reason}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={applying}
                        >
                          {applying ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <strong>My Leave Requests</strong>
              </div>
              <div className="card-body p-0">
                {myLoading ? (
                  <p className="p-3">Loading...</p>
                ) : myData.requests.length === 0 ? (
                  <p className="p-3 text-muted">No leave requests found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Type</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myData.requests.map((r) => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.leaveType}</td>
                            <td>{r.startDate?.slice(0, 10)}</td>
                            <td>{r.endDate?.slice(0, 10)}</td>
                            <td>{r.reason}</td>
                            <td>{statusBadge(r.status)}</td>
                            <td>
                              {r.status === "Pending" &&
                                (confirmAction?.id === r.id &&
                                confirmAction?.type === "cancel" ? (
                                  <span className="text-muted small">
                                    See confirmation above ↑
                                  </span>
                                ) : (
                                  <button
                                    id={`cancel-my-${r.id}`}
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      setConfirmAction({
                                        id: r.id,
                                        type: "cancel",
                                      })
                                    }
                                    disabled={!!confirmAction}
                                  >
                                    Cancel
                                  </button>
                                ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "team" && (
          <div className="card">
            <div className="card-header">
              <strong>Team Leave Requests</strong>
            </div>
            <div className="card-body p-0">
              {teamLoading ? (
                <p className="p-3">Loading...</p>
              ) : teamRequests.length === 0 ? (
                <p className="p-3 text-muted">No requests from your team.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>No.</th>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.employeeName}</td>
                          <td>{r.leaveType}</td>
                          <td>{r.startDate?.slice(0, 10)}</td>
                          <td>{r.endDate?.slice(0, 10)}</td>
                          <td>{r.reason}</td>
                          <td>{statusBadge(r.status)}</td>
                          <td>
                            {r.status === "Pending" &&
                              (confirmAction?.id === r.id ? (
                                <span className="text-muted small">
                                 
                                </span>
                              ) : (
                                <div className="d-flex gap-1">
                                  <button
                                    id={`approve-${r.id}`}
                                    className="btn btn-sm btn-success"
                                    onClick={() =>
                                      setConfirmAction({
                                        id: r.id,
                                        type: "approve",
                                      })
                                    }
                                    disabled={!!confirmAction}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    id={`reject-${r.id}`}
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                      setConfirmAction({
                                        id: r.id,
                                        type: "reject",
                                      })
                                    }
                                    disabled={!!confirmAction}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
