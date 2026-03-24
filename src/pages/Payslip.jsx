import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from '@/components/common/Topbar';
import Loader from "@/components/common/Loader";
import Error from "@/components/common/Error";
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

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} payslip request #${id}?`)) return;

    try {
      setUpdatingId(id);
      const response = await updatePaySlipStatus({ id, request_status: status });
      if (response.success) {
        // No alert needed - table refreshes instantly
        fetchPayslips(); // Refetch updated list
      } else {
        alert('Update failed: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + (err.message || 'Update failed'));
    } finally {
      setUpdatingId(null);
    }
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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
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
                  <th style={{width: 80}}>#</th>
                  <th>User ID</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{width: 160}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayslips.map((payslip, index) => (
                  <tr key={payslip.id}>
                    <td>{index + 1}</td>
                    <td>{payslip.user_id}</td>
                    <td>{formatDate(payslip.from_date)} - {formatDate(payslip.to_date)}</td>
                    <td>
                      <span className={`badge ${
                        payslip.request_status === 'pending' ? 'bg-warning text-dark' :
                        payslip.request_status === 'approved' ? 'bg-success' :
                        'bg-danger'
                      }`}>
                        {payslip.request_status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>{formatDate(payslip.created_at)}</td>
                    <td>
                      {payslip.request_status === 'pending' ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleStatusUpdate(payslip.id, 'approved')}
                            disabled={updatingId === payslip.id}
                          >
                            {updatingId === payslip.id ? 'Updating...' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(payslip.id, 'rejected')}
                            disabled={updatingId === payslip.id}
                          >
                            {updatingId === payslip.id ? 'Updating...' : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {/* Mobile cards fallback if needed */}
            <div className="grid gap-4 md:hidden">
              {filteredPayslips.map((payslip, index) => (
                <div key={payslip.id} className="bg-white shadow rounded-lg p-4 space-y-3">
                  <div className="flex justify-between"><span>ID #{index + 1}</span></div>
                  <div>User: {payslip.user_id}</div>
                  <div>Period: {formatDate(payslip.from_date)} - {formatDate(payslip.to_date)}</div>
                  <div>Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    payslip.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payslip.request_status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payslip.request_status?.toUpperCase()}
                  </span></div>
                  <div>Created: {formatDate(payslip.created_at)}</div>
                  {payslip.request_status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-500 text-white py-1 px-2 text-sm rounded" onClick={() => handleStatusUpdate(payslip.id, 'approved')}>
                        Approve
                      </button>
                      <button className="flex-1 bg-red-500 text-white py-1 px-2 text-sm rounded" onClick={() => handleStatusUpdate(payslip.id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {count > 0 && (
              <div className="text-sm text-gray-500 text-center mt-4">
                Showing {filteredPayslips.length} of {count} payslip requests
              </div>
            )}
          </>)} 

        
        </div>
      </div>
    // </div>
  );
};

export default Payslip;

