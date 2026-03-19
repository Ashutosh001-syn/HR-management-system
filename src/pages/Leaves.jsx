import { getLeaveRequests, updateLeaveStatus } from "@/api/adminApi";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import NotificationModal from "@/components/common/NotificationModal";
import { formatDate, normalizeLeaveRecord } from "@/utils/helpers";
import { useEffect, useMemo, useRef, useState } from "react";

function dedupeLeaves(records) {
  const uniqueRecords = new Map();

  records.forEach((record) => {
    const key = `${record.leave_id}-${record.user_id || "unknown"}`;
    uniqueRecords.set(key, record);
  });

  return Array.from(uniqueRecords.values());
}

export default function Leaves() {
  const hasFetchedRef = useRef(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveSearch, setLeaveSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [confirmation, setConfirmation] = useState({ show: false, message: "", onConfirm: null });

  const fetchLeaves = async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const data = await getLeaveRequests(params);
      const list = Array.isArray(data) ? data : data?.data || [];
      const normalizedLeaves = list.map((record, index) => normalizeLeaveRecord(record, index));
      setLeaveRequests(dedupeLeaves(normalizedLeaves));
    } catch (err) {
      setError(err.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    const query = leaveSearch.trim().toLowerCase();
    if (!query) return leaveRequests;

    return leaveRequests.filter((leave) =>
      String(leave.leave_id).toLowerCase().includes(query)
      || String(leave.user_id).toLowerCase().includes(query)
      || String([leave.first_name, leave.last_name].filter(Boolean).join(" ")).toLowerCase().includes(query)
      || String(leave.leavetype).toLowerCase().includes(query)
      || String(leave.request_status).toLowerCase().includes(query)
    );
  }, [leaveRequests, leaveSearch]);

  const summary = useMemo(() => ({
    total: filteredLeaves.length,
    accepted: filteredLeaves.filter((leave) => leave.request_status === "Approved").length,
    rejected: filteredLeaves.filter((leave) => leave.request_status === "Rejected").length,
    pending: filteredLeaves.filter((leave) => leave.request_status === "Pending").length,
  }), [filteredLeaves]);

  const handleLeaveAction = (leave, action) => {
    if (!leave?.leave_id || !leave?.user_id) {
      return;
    }

    const newStatus = action === "approved" ? "Approved" : "Rejected";

    setConfirmation({
      show: true,
      message: `${newStatus} leave ${leave.leave_id} for user ${leave.user_id}?`,
      onConfirm: async () => {
        try {
          await updateLeaveStatus({
            leave_id: leave.leave_id,
            user_id: leave.user_id,
            action,
          });

          setLeaveRequests((current) =>
            current.map((item) => (item.leave_id === leave.leave_id ? { ...item, request_status: newStatus } : item))
          );

          setSelectedLeave((current) =>
            current && current.leave_id === leave.leave_id
              ? { ...current, request_status: newStatus }
              : current
          );

          setNotification({
            show: true,
            message: `Leave ${newStatus.toLowerCase()} successfully.`,
            type: "success",
          });
        } catch (err) {
          setNotification({ show: true, message: err.message || "Failed to update leave status.", type: "error" });
        }
      },
    });
  };

  return (
    <>
      <div className="admin-page">
        <section className="admin-page__hero">
          <div>
            <div className="admin-page__eyebrow">Leave Control</div>
            <h1 className="admin-page__title">Review leave requests with a clearer workflow</h1>
            <p className="admin-page__text">Search pending requests, inspect details, and approve or reject from one cleaner dashboard-style surface.</p>
            <div className="admin-page__meta">
              <span>{leaveRequests.length} leave requests</span>
              <span>{filteredLeaves.length} visible</span>
            </div>
          </div>
        </section>

        <div className="admin-surface">
          <div className="admin-section-head">
            <div>
              <div className="admin-section-kicker">Approval Desk</div>
              <h5 className="admin-section-title">Leaves Approval</h5>
            </div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-tile">
              <div className="admin-stat-tile__label">Visible Requests</div>
              <div className="admin-stat-tile__value">{summary.total}</div>
            </div>
            <div className="admin-stat-tile admin-stat-tile--green">
              <div className="admin-stat-tile__label">Accepted</div>
              <div className="admin-stat-tile__value">{summary.accepted}</div>
            </div>
            <div className="admin-stat-tile admin-stat-tile--rose">
              <div className="admin-stat-tile__label">Rejected</div>
              <div className="admin-stat-tile__value">{summary.rejected}</div>
            </div>
            <div className="admin-stat-tile admin-stat-tile--amber">
              <div className="admin-stat-tile__label">Pending</div>
              <div className="admin-stat-tile__value">{summary.pending}</div>
            </div>
          </div>

          {!selectedLeave && (
            <div className="admin-toolbar">
              <div className="admin-toolbar__group">
                <input
                  type="text"
                  className="form-control admin-search"
                  style={{ minWidth: 260 }}
                  placeholder="Search by employee, user ID, type, status"
                  value={leaveSearch}
                  onChange={(event) => setLeaveSearch(event.target.value)}
                />
                <button className="btn btn-outline-success" type="button" onClick={() => fetchLeaves()} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          )}

          {error && <Error message={error} />}
          {loading && <Loader label="Loading leave requests..." />}

          {!selectedLeave && !loading && !error && filteredLeaves.length === 0 && (
            <div className="admin-empty-state">No leave requests found.</div>
          )}

          {!selectedLeave && !loading && !error && filteredLeaves.length > 0 && (
            <div className="table-responsive">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>User ID</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th style={{ width: 140 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.leave_id}>
                      <td>{[leave.first_name, leave.last_name].filter(Boolean).join(" ") || "-"}</td>
                      <td>{leave.user_id || "-"}</td>
                      <td>{leave.leavetype}</td>
                      <td>{formatDate(leave.fromdate)}</td>
                      <td>{formatDate(leave.todate)}</td>
                      <td>{leave.totalleavedays}</td>
                      <td>
                        <span
                          className={`badge ${
                            leave.request_status === "Approved"
                              ? "bg-success"
                              : leave.request_status === "Rejected"
                                ? "bg-danger"
                                : "bg-secondary"
                          }`}
                        >
                          {leave.request_status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-success" onClick={() => setSelectedLeave(leave)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedLeave && (
            <div className="admin-surface admin-surface--soft admin-surface--inner">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0">Leave Details</h6>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Employee</div>
                  <div className="fw-semibold">
                    {[selectedLeave.first_name, selectedLeave.last_name].filter(Boolean).join(" ") || "-"}
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Type</div>
                  <div className="fw-semibold">{selectedLeave.leavetype}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">User ID</div>
                  <div className="fw-semibold">{selectedLeave.user_id || "-"}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">From</div>
                  <div className="fw-semibold">{formatDate(selectedLeave.fromdate)}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">To</div>
                  <div className="fw-semibold">{formatDate(selectedLeave.todate)}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Days</div>
                  <div className="fw-semibold">{selectedLeave.totalleavedays}</div>
                </div>
                <div className="col-12">
                  <div className="small text-muted">Reason</div>
                  <div className="fw-semibold">{selectedLeave.reasonforleave || "-"}</div>
                </div>
                <div className="col-12">
                  <div className="small text-muted">Status</div>
                  <span
                    className={`badge ${
                      selectedLeave.request_status === "Approved"
                        ? "bg-success"
                        : selectedLeave.request_status === "Rejected"
                          ? "bg-danger"
                          : "bg-secondary"
                    }`}
                  >
                    {selectedLeave.request_status}
                  </span>
                </div>
              </div>
              <div className="admin-form-actions mt-3">
                <button
                  className="btn btn-success"
                  onClick={() => handleLeaveAction(selectedLeave, "approved")}
                  disabled={selectedLeave.request_status !== "Pending"}
                >
                  Approve
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleLeaveAction(selectedLeave, "rejected")}
                  disabled={selectedLeave.request_status !== "Pending"}
                >
                  Reject
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setSelectedLeave(null)}>
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        show={notification.show}
        onClose={() => setNotification((current) => ({ ...current, show: false }))}
        message={notification.message}
        type={notification.type}
      />

      <ConfirmationModal
        show={confirmation.show}
        onClose={() => setConfirmation((current) => ({ ...current, show: false }))}
        onConfirm={confirmation.onConfirm}
        message={confirmation.message}
      />
    </>
  );
}
