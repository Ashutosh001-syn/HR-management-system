import { useEffect, useState } from "react";

const STORAGE_KEY = "wifi-system-records";
const LEGACY_STORAGE_KEY = "attendance-system-records";

const INITIAL_FORM = {
  name: "",
  status: "Active",
};

function getBadgeClass(status) {
  return status === "Active" ? "bg-success" : "bg-secondary";
}

export default function WifiSystem() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);
      const legacyRecords = localStorage.getItem(LEGACY_STORAGE_KEY);
      const sourceRecords = savedRecords || legacyRecords;
      if (!sourceRecords) return;

      const parsedRecords = JSON.parse(sourceRecords);
      if (Array.isArray(parsedRecords)) {
        setRecords(parsedRecords);
      }
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      setMessage("");
      return;
    }

    const normalizedName = trimmedName.toLowerCase();
    const existingRecord = records.find((record) => record.name.trim().toLowerCase() === normalizedName);

    if (existingRecord) {
      if (existingRecord.status !== formData.status) {
        setRecords((current) => current.map((record) => {
          if (record.name.trim().toLowerCase() !== normalizedName) {
            return record;
          }

          return {
            ...record,
            status: formData.status,
          };
        }));
        setFormData(INITIAL_FORM);
        setError("");
        setMessage(`Wifi status for "${trimmedName}" was updated to ${formData.status}.`);
        return;
      }

      setRecords((current) => current.filter((record) => record.name.trim().toLowerCase() !== normalizedName));
      setFormData(INITIAL_FORM);
      setError("");
      setMessage(`Matching wifi record for "${trimmedName}" was removed.`);
      return;
    }

    const newRecord = {
      id: Date.now(),
      name: trimmedName,
      status: formData.status,
    };

    setRecords((current) => [newRecord, ...current]);
    setFormData(INITIAL_FORM);
    setError("");
    setMessage(`Wifi record for "${trimmedName}" was added.`);
  };

  return (
    <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Connectivity Records</div>
          <h1 className="admin-page__title">Manage wifi data on its own page</h1>
          <p className="admin-page__text">Keep wifi status management separate from attendance while using the same dashboard-inspired interface.</p>
          <div className="admin-page__meta">
            <span>{records.length} wifi records</span>
          </div>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="admin-surface h-100">
            <h5 className="admin-section-title mb-1">Wifi System</h5>
            <p className="admin-section-text mb-4">Add and manage wifi status records here.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="wifi-name" className="form-label">
                  Name
                </label>
                <input
                  id="wifi-name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="wifi-status" className="form-label">
                  Status
                </label>
                <select
                  id="wifi-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}
              {!error && message && <div className="alert alert-success py-2">{message}</div>}

              <button type="submit" className="btn btn-success w-100">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="admin-surface h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="admin-section-title mb-1">Submitted Wifi Data</h5>
                <p className="admin-section-text mb-0">All submitted wifi records appear here.</p>
              </div>
              <span className="admin-count-badge">{records.length} Records</span>
            </div>

            {records.length === 0 ? (
              <div className="admin-empty-state">No wifi data submitted yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>#</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record.id}>
                        <td>{index + 1}</td>
                        <td>{record.name}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(record.status)}`}>{record.status}</span>
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
    </div>
  );
}
