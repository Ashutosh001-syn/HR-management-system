import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import { formatDate, normalizeAttendanceStatus } from "@/utils/helpers";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function getStatusBadgeClass(status) {
  if (status === "Present") return "bg-success";
  if (status === "Late") return "bg-warning text-dark";
  if (status === "Half Day") return "bg-info text-dark";
  if (status === "Absent") return "bg-danger";
  if (String(status).toLowerCase().includes("leave")) return "bg-primary";
  return "bg-secondary";
}

function normalizeReportRecords(records = []) {
  return records.map((item, index) => ({
    id: item?.attendance_id ?? item?.id ?? `${item?.login_date || "record"}-${index}`,
    login_date: formatDate(item?.login_date),
    punch_in: item?.punch_in || "-",
    punch_out: item?.punch_out || "-",
    totalHours: item?.totalHours || item?.total_hours || "-",
    status: normalizeAttendanceStatus(item?.status),
  }));
}

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { userId: paramUserId } = useParams();

  const dateRangeError = useMemo(() => {
    if (fromDate && toDate && fromDate > toDate) {
      return "From date cannot be after To date.";
    }

    return "";
  }, [fromDate, toDate]);

  const records = useMemo(() => normalizeReportRecords(reportData?.data || []), [reportData]);

  const filteredRecords = useMemo(() => {
    if (dateRangeError) {
      return [];
    }

    return records.filter((item) => {
      if (!item.login_date || item.login_date === "-") {
        return false;
      }

      if (fromDate && item.login_date < fromDate) {
        return false;
      }

      if (toDate && item.login_date > toDate) {
        return false;
      }

      return true;
    });
  }, [dateRangeError, fromDate, records, toDate]);

  const summary = useMemo(() => {
    const hasDateFilter = Boolean(fromDate || toDate);

    if (!hasDateFilter) {
      return {
        totalDays: reportData?.summary?.total_days ?? records.length,
        totalPresent: reportData?.summary?.total_present ?? records.filter((item) => item.status === "Present").length,
        totalLeaves: reportData?.summary?.total_leaves ?? records.filter((item) => String(item.status).toLowerCase().includes("leave")).length,
      };
    }

    return {
      totalDays: filteredRecords.length,
      totalPresent: filteredRecords.filter((item) => item.status === "Present").length,
      totalLeaves: filteredRecords.filter((item) => String(item.status).toLowerCase().includes("leave")).length,
    };
  }, [filteredRecords, fromDate, records, reportData, toDate]);

  const fetchReport = async (nextUserId = userId) => {
    const normalizedUserId = String(nextUserId || "").trim();

    if (!normalizedUserId) {
      setError("Enter a user ID to generate the report.");
      setReportData(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "http://103.185.75.124:5009/api/admin/get_userAttendance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: normalizedUserId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setReportData(data);
      } else {
        setReportData(null);
        setError(data.message || "Failed to fetch report.");
      }
    } catch (err) {
      setReportData(null);
      setError(err.message || "Something went wrong while fetching the report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramUserId) {
      setUserId(paramUserId);
      fetchReport(paramUserId);
    }
  }, [paramUserId]);

  return (
    <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Reports</div>
          <h1 className="admin-page__title">Attendance Reports &amp; Analytics</h1>
          <p className="admin-page__text">
            View employee attendance insights, filter by date range, and review punch activity in one place.
          </p>
        </div>
      </section>

      <div className="admin-surface">
        <div className="admin-toolbar">
          <div>
            <div className="admin-section-kicker">Attendance</div>
            <h5 className="admin-section-title">Generate Report</h5>
          </div>

          <div className="admin-toolbar__group" style={{ flexWrap: "wrap" }}>
            <input
              type="number"
              placeholder="Enter User ID"
              className="form-control admin-search"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={() => fetchReport()}
              disabled={loading}
              type="button"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              disabled={!fromDate && !toDate}
              type="button"
            >
              Clear Dates
            </button>
          </div>
        </div>

        {dateRangeError && <Error message={dateRangeError} />}
        {!dateRangeError && error && <Error message={error} />}
        {loading && <Loader label="Loading report..." />}

        {!loading && !error && !reportData && (
          <div className="admin-empty-state">Select a user to view the attendance report.</div>
        )}

        {!loading && reportData && (
          <>
            <div className="row g-3 mb-4">
              {reportData.user && (
                <>
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                      <div className="card-body">
                        <h6>User ID</h6>
                        <h4>{reportData.user.user_id}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                      <div className="card-body">
                        <h6>User Name</h6>
                        <h4>{reportData.user.name}</h4>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="col-md-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h6>Total Days</h6>
                    <h3>{summary.totalDays}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h6>Present Days</h6>
                    <h3>{summary.totalPresent}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h6>Total Leaves</h6>
                    <h3>{summary.totalLeaves}</h3>
                  </div>
                </div>
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="admin-empty-state">
                No attendance records found for the selected calendar range.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((item) => (
                      <tr key={item.id}>
                        <td>{item.login_date}</td>
                        <td>{item.punch_in}</td>
                        <td>{item.punch_out}</td>
                        <td>{item.totalHours}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
