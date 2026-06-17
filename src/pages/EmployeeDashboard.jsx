import { useEffect, useState } from "react";
import { getMyLeaves, applyLeave, cancelLeave } from "../api/api";
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

export default function EmployeeDashboard() {
  const [data, setData] = useState({ requests: [], leaveBalances: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leaveTypeId: 1,
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [applying, setApplying] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaves();
      setData(res.data);
    } catch (err) {
      setError(
        "Failed to load your leave data: " +
          (err.response?.data || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data ||
          "Failed to apply leave. Check your dates or balance.",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleCancelConfirmed = async () => {
    if (!confirmCancelId) return;
    setCancelling(true);
    setError("");
    try {
      await cancelLeave(confirmCancelId);
      setMsg("Leave cancelled successfully.");
      await fetchData();
    } catch (err) {
      setError(
        "Failed to cancel leave: " + (err.response?.data || err.message),
      );
    } finally {
      setCancelling(false);
      setConfirmCancelId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h4 className="mb-3">Employee Dashboard</h4>

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
        {confirmCancelId && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between">
            <span>
              Are you sure you want to <strong>cancel</strong> leave request #
              {confirmCancelId}?
            </span>
            <div className="d-flex gap-2 ms-3">
              <button
                id={`confirm-cancel-yes-${confirmCancelId}`}
                className="btn btn-sm btn-danger"
                onClick={handleCancelConfirmed}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, cancel it"}
              </button>
              <button
                id="confirm-cancel-no"
                className="btn btn-sm btn-secondary"
                onClick={() => setConfirmCancelId(null)}
                disabled={cancelling}
              >
                No, keep it
              </button>
            </div>
          </div>
        )}

        {}
        <div className="card mb-4">
          <div className="card-header">
            <strong>My Leave Balances</strong>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : data.leaveBalances.length === 0 ? (
              <p className="text-muted">No balances found.</p>
            ) : (
              <div className="row g-3">
                {data.leaveBalances.map((b, i) => (
                  <div key={i} className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <div className="fw-semibold">{b.leaveType}</div>
                      <div className="fs-4 text-primary">{b.balanceDays}</div>
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

        {}
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
                      id="startDate"
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
                      id="endDate"
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
                      id="reason"
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
                      id="submit-leave-btn"
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

        {}
        <div className="card">
          <div className="card-header">
            <strong>My Leave Requests</strong>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <p className="p-3">Loading...</p>
            ) : data.requests.length === 0 ? (
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
                    {data.requests.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.leaveType}</td>
                        <td>{r.startDate?.slice(0, 10)}</td>
                        <td>{r.endDate?.slice(0, 10)}</td>
                        <td>{r.reason}</td>
                        <td>{statusBadge(r.status)}</td>
                        <td>
                          {r.status === "Pending" &&
                            (confirmCancelId === r.id ? (
                              <span className="text-muted small">
                              
                              </span>
                            ) : (
                              <button
                                id={`cancel-${r.id}`}
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setConfirmCancelId(r.id)}
                                disabled={confirmCancelId !== null}
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
      </div>
    </>
  );
}
