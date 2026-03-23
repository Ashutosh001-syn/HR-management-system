import { getAttendanceByStatus } from "@/api/adminApi";
import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import { formatDate, normalizeAttendanceRecord } from "@/utils/helpers";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const STATUS_OPTIONS = ["All", "Present", "Late", "Half Day", "Absent"];

function getStatusBadgeClass(status) {
  if (status === "Present") return "bg-success";
  if (status === "Late") return "bg-warning text-dark";
  if (status === "Half Day") return "bg-info text-dark";
  if (status === "Absent") return "bg-danger";
  return "bg-secondary";
}

function getAttendanceList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.attendance)) return payload.attendance;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

export default function Attendance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedStatus = STATUS_OPTIONS.includes(searchParams.get("status")) ? searchParams.get("status") : "All";

  const [records, setRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAttendanceByStatus({
          status: selectedStatus,
        });
        const normalizedRecords = getAttendanceList(response).map((record, index) => normalizeAttendanceRecord(record, index));
        setRecords(normalizedRecords);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [refreshSeed, selectedStatus]);

  const statusFilteredRecords = useMemo(() => {
    if (selectedStatus === "All") {
      return records;
    }

    return records.filter((record) => record.status === selectedStatus);
  }, [records, selectedStatus]);

  const filteredRecords = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return statusFilteredRecords;

    return statusFilteredRecords.filter((record) => {
      const employeeName = [record.first_name, record.last_name].filter(Boolean).join(" ").toLowerCase();
      return employeeName.includes(query)
        || String(record.user_id || "").toLowerCase().includes(query)
        || String(record.status || "").toLowerCase().includes(query);
    });
  }, [statusFilteredRecords, searchText]);

  const summary = useMemo(() => {
    const totalHoursMinutes = statusFilteredRecords.reduce((sum, item) => {
      if (!item.total_hours) return sum;
      const match = item.total_hours.match(/(\d+):(\d{2})/);
      if (match) {
        return sum + (parseInt(match[1], 10) * 60 + parseInt(match[2], 10));
      }
      return sum;
    }, 0);

    const totalHours = Math.floor(totalHoursMinutes / 60);
    const totalMinutes = totalHoursMinutes % 60;

    return {
      total: statusFilteredRecords.length,
      present: statusFilteredRecords.filter((item) => item.status === "Present").length,
      late: statusFilteredRecords.filter((item) => item.status === "Late").length,
      halfDay: statusFilteredRecords.filter((item) => item.status === "Half Day").length,
      absent: statusFilteredRecords.filter((item) => item.status === "Absent").length,
      totalHours: `${totalHours}:${totalMinutes.toString().padStart(2, "0")}`,
    };
  }, [statusFilteredRecords]);

  const handleStatusChange = (status) => {
    if (status === "All") {
      navigate("/dashboard/attendance");
      return;
    }

    navigate(`/dashboard/attendance?status=${encodeURIComponent(status)}`);
  };

  return (
    <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Attendance Tracking</div>
          <h1 className="admin-page__title">Monitor attendance records with live filtering</h1>
          <p className="admin-page__text">Filter statuses, scan punch times, and review the attendance board from a cleaner dashboard-style page.</p>
          <div className="admin-page__meta">
            <span>{summary.total} records in view</span>
            <span>{selectedStatus} filter</span>
          </div>
        </div>
        <div className="admin-page__actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setRefreshSeed((current) => current + 1)}
          >
            Refresh
          </button>
        </div>
      </section>

      <div className="admin-surface">
        <div className="admin-section-head">
          <div>
            <div className="admin-section-kicker">Records Desk</div>
            <h5 className="admin-section-title">Attendance Records</h5>
            <p className="admin-section-text"></p>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-tile">
<div className="admin-stat-tile__label">Total Present</div>
<div className="admin-stat-tile__value">{summary.present + summary.late + summary.halfDay}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--green">
            <div className="admin-stat-tile__label">ON Time</div>
            <div className="admin-stat-tile__value">{summary.present}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--amber">
            <div className="admin-stat-tile__label">Late</div>
            <div className="admin-stat-tile__value">{summary.late}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--blue">
            <div className="admin-stat-tile__label">Half Day</div>
            <div className="admin-stat-tile__value">{summary.halfDay}</div>
          </div>
          <div className="admin-stat-tile admin-stat-tile--rose">
            <div className="admin-stat-tile__label">Absent</div>
            <div className="admin-stat-tile__value">{summary.absent}</div>
          </div>
          
        </div>

        <div className="admin-pill-row">
          {STATUS_OPTIONS.map((status) => (
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
              placeholder="Search by employee, user ID, or status"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>

        {error && <Error message={error} />}
        {loading && <Loader label="Loading attendance records..." />}

        {!loading && !error && filteredRecords.length === 0 && (
          <div className="admin-empty-state">No attendance records found.</div>
        )}

        {!loading && !error && filteredRecords.length > 0 && (
          <div className="table-responsive">
            <table className="table admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>#</th>
                  <th>Employee</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={`${record.attendance_id}-${record.user_id || index}`}>
                    <td>{index + 1}</td>
                    <td>{[record.first_name, record.last_name].filter(Boolean).join(" ") || "-"}</td>
                    <td>{record.user_id || "-"}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(record.status)}`}>{record.status}</span>
                    </td>
                    <td>{formatDate(record.login_date)}</td>
                    <td>{record.punch_in || "-"}</td>
                    <td>{record.punch_out || "-"}</td>
                    <td>{record.total_hours || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
