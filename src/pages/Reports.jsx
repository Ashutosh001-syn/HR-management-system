import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  const { userId: paramUserId } = useParams();

  useEffect(() => {
    if (paramUserId) {
      setUserId(paramUserId);
      fetchReport(paramUserId);
    }
  }, [paramUserId]);

  const fetchReport = async (nextUserId = userId) => {
    if (!nextUserId) return;

    try {
      setLoading(true);

      const res = await fetch(
        "http://103.185.75.124:5009/api/admin/get_userAttendance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: nextUserId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setReportData(data);
      } else {
        alert("Failed to fetch report");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* HERO SECTION (Same as Employees) */}
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Reports</div>
          <h1 className="admin-page__title">
            Attendance Reports &amp; Analytics
          </h1>
          <p className="admin-page__text">
            View employee attendance insights, track performance, and analyze
            work patterns in one place.
          </p>
        </div>
      </section>

      <div className="admin-surface">
        {/* SEARCH BAR */}
        {/* <div className="admin-toolbar">
          <div>
            <div className="admin-section-kicker">Attendance</div>
            <h5 className="admin-section-title">Generate Report</h5>
          </div>

          <div className="admin-toolbar__group">
            <input
              type="number"
              placeholder="Enter User ID"
              className="form-control admin-search"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={fetchReport}
              disabled={loading}
            >
              {loading ? "Loading..." : "Get Report"}
            </button>
          </div>
        </div> */}

        {/* CARDS SECTION (IMPORTANT 🔥) */}
        {reportData && (
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
                  <h3>{reportData.summary?.total_days}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6>Present Days</h6>
                  <h3>{reportData.summary?.total_present}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6>Total Leaves</h6>
                  <h3>{reportData.summary?.total_leaves}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        {reportData && (
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
                {reportData.data?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.login_date}</td>
                    <td>{item.punch_in || "-"}</td>
                    <td>{item.punch_out || "-"}</td>
                    <td>{item.totalHours}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "Absent"
                            ? "bg-danger"
                            : item.status === "Present"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {item.status}
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
  );
}
