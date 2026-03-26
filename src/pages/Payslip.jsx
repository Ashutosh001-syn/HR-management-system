import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Loader from "@/components/common/Loader";
import Error from "@/components/common/Error";
import NotificationModal from "@/components/common/NotificationModal";
import { getAllPaySlips, updatePaySlipStatus } from '@/api/adminApi';

const Payslip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedStatus = ["All", "Pending", "Approved", "Rejected"].includes(searchParams.get("status")) 
    ? searchParams.get("status") 
    : "All";

  const [payslips, setPayslips] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [confirmation, setConfirmation] = useState({ show: false, message: "", onConfirm: null });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const summary = useMemo(() => {
    const total = payslips.length;
    const pending = payslips.filter(p => p.request_status?.toLowerCase() === 'pending').length;
    const approved = payslips.filter(p => p.request_status?.toLowerCase() === 'approved').length;
    const rejected = payslips.filter(p => p.request_status?.toLowerCase() === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [payslips]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllPaySlips();
      if (response.success) {
        setPayslips(response.data || []);
        setCount(response.count || 0);
      } else {
        setError('Failed to fetch payslips');
        setPayslips([]);
        setCount(0);
      }
    } catch (err) {
      setError('Error fetching payslips: ' + (err.message || 'Unknown error'));
      setPayslips([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (payslip, status) => {
    setConfirmation({
      show: true,
      message: `Are you sure you want to ${status} payslip request ${payslip.user_id}?`,
      onConfirm: async () => {
        try {
          setUpdatingId(payslip.id);
          const response = await updatePaySlipStatus({
            id: payslip.id,
            user_id: payslip.user_id,
            from_date: payslip.from_date?.split('T')[0] || payslip.from_date,
            to_date: payslip.to_date?.split('T')[0] || payslip.to_date,
            request_status: status
          });

          if (response.success) {
            await fetchPayslips();
            setNotification({
              show: true,
              message: `Payslip request ${status} successfully.`,
              type: "success",
            });
          } else {
            setNotification({
              show: true,
              message: response.message || "Update failed.",
              type: "error",
            });
          }
        } catch (err) {
          setNotification({
            show: true,
            message: err.message || "Update failed.",
            type: "error",
          });
        } finally {
          setUpdatingId(null);
        }
      },
    });
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const statusFilteredPayslips = useMemo(() => {
    if (selectedStatus === "All") return payslips;
    return payslips.filter(p => p.request_status?.toLowerCase() === selectedStatus.toLowerCase());
  }, [payslips, selectedStatus]);

  const filteredPayslips = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return statusFilteredPayslips;
    return statusFilteredPayslips.filter(p =>
      String(p.id).toLowerCase().includes(query) ||
      String(p.user_id).toLowerCase().includes(query) ||
      String(p.request_status).toLowerCase().includes(query)
    );
  }, [statusFilteredPayslips, searchText]);

  const handleStatusChange = (status) => {
    if (status === "All") {
      navigate("/dashboard/payslip");
    } else {
      navigate(`/dashboard/payslip?status=${encodeURIComponent(status)}`);
    }
  };

  return (
    <>
      <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Payslip Management</div>
          <h1 className="admin-page__title">Manage employee payslip requests efficiently</h1>
          <p className="admin-page__text">Review pending payslips, check periods, and approve or reject directly from this dashboard.</p>
          <div className="admin-page__meta">
            <span>{summary.total} total requests</span>
            <span>{summary.pending} pending</span>
            <span>{selectedStatus} filter</span>
          </div>
        </div>
        <div className="admin-page__actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={fetchPayslips}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <div className="admin-surface">
        <div className="admin-section-head">
          <div>
            <div className="admin-section-kicker">Approval Desk</div>
            <h5 className="admin-section-title">Payslip Requests</h5>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-tile">
            <div className="admin-stat-tile__label">Total Requests</div>
            <div className="admin-stat-tile__value">{summary.total}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--amber">
            <div className="admin-stat-tile__label">Pending</div>
            <div className="admin-stat-tile__value">{summary.pending}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--green">
            <div className="admin-stat-tile__label">Approved</div>
            <div className="admin-stat-tile__value">{summary.approved}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--rose">
            <div className="admin-stat-tile__label">Rejected</div>
            <div className="admin-stat-tile__value">{summary.rejected}</div>
          </div>
        </div>

        <div className="admin-pill-row">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn ${selectedStatus === status ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <input
              type="text"
              className="form-control admin-search"
              placeholder="Search by ID, user ID, or status"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {error && <Error message={error} />}

        {loading && <Loader label="Loading payslip requests..." />}

        {!loading && !error && filteredPayslips.length === 0 && (
          <div className="admin-empty-state">
            No payslip requests match the current filters/search.
          </div>
        )}

        {!loading && !error && filteredPayslips.length > 0 && (
          <>
  <div className="table-responsive">
    <table className="table admin-table align-middle mb-0">
      <thead>
        <tr>
          <th style={{ width: 80 }}>#</th>
          <th>User ID</th>
          <th>Period</th>
          <th>Status</th>
          <th>Created</th>
          <th style={{ width: 160 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredPayslips.map((payslip, index) => (
          <tr key={payslip.id}>
            <td>{index + 1}</td>
            <td>{payslip.user_id}</td>

            <td>
              {formatDate(payslip.from_date)} -{" "}
              {formatDate(payslip.to_date)}
            </td>

            <td>
              <span
                className={`badge ${
                  payslip.request_status === "pending"
                    ? "bg-warning text-dark"
                    : payslip.request_status === "approved"
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {payslip.request_status?.toUpperCase() || "UNKNOWN"}
              </span>
            </td>

            <td>{formatDate(payslip.created_at)}</td>

            <td>
              <button
                className={`btn btn-sm btn-success me-1 ${
                  payslip.request_status !== "pending"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  handleStatusUpdate(payslip, "approved")
                }
                disabled={
                  updatingId === payslip.id ||
                  payslip.request_status !== "pending"
                }
              >
                {updatingId === payslip.id
                  ? "Updating..."
                  : "Approve"}
              </button>

              <button
                className={`btn btn-sm btn-danger ${
                  payslip.request_status !== "pending"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  handleStatusUpdate(payslip, "rejected")
                }
                disabled={
                  updatingId === payslip.id ||
                  payslip.request_status !== "pending"
                }
              >
                {updatingId === payslip.id
                  ? "Updating..."
                  : "Reject"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>


 
</>
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
};

export default Payslip;

