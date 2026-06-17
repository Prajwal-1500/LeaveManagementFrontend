import { useEffect, useState } from "react";
import { getEmployees, getMonthlySummary } from "../api/api";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("employees");

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const fetchEmployees = async () => {
    try {
      setEmpLoading(true);
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      setEmpError("Failed to load employees.");
    } finally {
      setEmpLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await getMonthlySummary(month, year);
      setSummary(res.data);
    } catch {
      setSummaryError("Failed to load summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h4 className="mb-3">Admin Dashboard</h4>

        {}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              id="tab-employees"
              className={`nav-link ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              Employees
            </button>
          </li>
          <li className="nav-item">
            <button
              id="tab-reports"
              className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              Monthly Reports
            </button>
          </li>
        </ul>

        {}
        {activeTab === "employees" && (
          <div className="card">
            <div className="card-header">
              <strong>All Employees</strong>
            </div>
            <div className="card-body p-0">
              {empLoading ? (
                <p className="p-3">Loading...</p>
              ) : empError ? (
                <div className="alert alert-danger m-3">{empError}</div>
              ) : employees.length === 0 ? (
                <p className="p-3 text-muted">No employees found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Manager</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((e) => (
                        <tr key={e.id}>
                          <td>{e.id}</td>
                          <td>{e.fullName}</td>
                          <td>{e.email}</td>
                          <td>
                            {e.managerName || (
                              <span className="text-muted">—</span>
                            )}
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

        {}
        {activeTab === "reports" && (
          <div className="card">
            <div className="card-header">
              <strong>Monthly Leave Summary</strong>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3 align-items-end">
                <div className="col-auto">
                  <label className="form-label">Month</label>
                  <select
                    id="report-month"
                    className="form-select"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-auto">
                  <label className="form-label">Year</label>
                  <input
                    id="report-year"
                    type="number"
                    className="form-control"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min="2020"
                    max="2099"
                    style={{ width: "100px" }}
                  />
                </div>
                <div className="col-auto">
                  <button
                    id="fetch-report-btn"
                    className="btn btn-primary"
                    onClick={fetchSummary}
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? "Loading..." : "Get Report"}
                  </button>
                </div>
              </div>

              {summaryError && (
                <div className="alert alert-danger">{summaryError}</div>
              )}

              {!summaryLoading && summary.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Total</th>
                        <th>Pending</th>
                        <th>Approved</th>
                        <th>Rejected</th>
                        <th>Cancelled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((s, i) => (
                        <tr key={i}>
                          <td>{s.employeeName}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {s.totalRequests}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark">
                              {s.pendingLeaves}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {s.approvedLeaves}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-danger">
                              {s.rejectedLeaves}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {s.cancelledLeaves}
                            </span>
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
