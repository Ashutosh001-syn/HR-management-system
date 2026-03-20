import { addNetwork, getNetworks } from "@/api/adminApi";
import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import { normalizeWifiRecord } from "@/utils/helpers";
import { useEffect, useState } from "react";

const INITIAL_FORM = {
  name: "",
  status: "active",
};

function getBadgeClass(status) {
  return status === "Active" ? "bg-success" : "bg-secondary";
}

function getNetworkList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.networks)) return payload.networks;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

export default function WifiSystem() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await getNetworks();
        const normalizedRecords = getNetworkList(response).map((record, index) => normalizeWifiRecord(record, index));
        setRecords(normalizedRecords);
      } catch (err) {
        setFetchError(err.message || "Failed to fetch wifi records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, [refreshSeed]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError("Name is required.");
      setMessage("");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setMessage("");

    try {
      const response = await addNetwork({
        name: trimmedName,
        status: formData.status,
      });

      setFormData(INITIAL_FORM);
      setMessage(response?.message || `Wifi record for "${trimmedName}" was added.`);
      setRefreshSeed((current) => current + 1);
    } catch (err) {
      setFormError(err.message || "Failed to add wifi record.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="admin-page__actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setRefreshSeed((current) => current + 1)}
            disabled={loading}
          >
            Refresh
          </button>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              {!formError && message && <div className="alert alert-success py-2">{message}</div>}

              <button type="submit" className="btn btn-success w-100" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
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

            {loading && <Loader label="Loading wifi records..." />}
            {!loading && fetchError && <Error message={fetchError} />}

            {!loading && !fetchError && records.length === 0 ? (
              <div className="admin-empty-state">No wifi data submitted yet.</div>
            ) : null}

            {!loading && !fetchError && records.length > 0 ? (
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
                      <tr key={`${record.network_id}-${index}`}>
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
