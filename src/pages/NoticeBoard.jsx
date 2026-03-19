import { useEffect, useState } from "react";

const STORAGE_KEY = "notice-board-records";

const INITIAL_FORM = {
  subject: "",
  title: "",
  message: "",
};

function formatCreatedAt(value) {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function NoticeBoard() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    try {
      const savedNotices = localStorage.getItem(STORAGE_KEY);
      if (!savedNotices) return;

      const parsedNotices = JSON.parse(savedNotices);
      if (Array.isArray(parsedNotices)) {
        setNotices(parsedNotices);
      }
    } catch {
      setNotices([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  }, [notices]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextFormData = {
      subject: formData.subject.trim(),
      title: formData.title.trim(),
      message: formData.message.trim(),
    };

    if (!nextFormData.subject || !nextFormData.title || !nextFormData.message) {
      setError("Subject, title, and message are required.");
      setSuccessMessage("");
      return;
    }

    const newNotice = {
      id: Date.now(),
      ...nextFormData,
      createdAt: new Date().toISOString(),
    };

    setNotices((current) => [newNotice, ...current]);
    setFormData(INITIAL_FORM);
    setError("");
    setSuccessMessage("Notice submitted successfully.");
  };

  return (
    <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Organization Broadcasts</div>
          <h1 className="admin-page__title">Publish notices in the same visual system</h1>
          <p className="admin-page__text">Create announcements and keep a visible archive of everything sent to the team.</p>
          <div className="admin-page__meta">
            <span>{notices.length} submitted notices</span>
          </div>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="admin-surface h-100">
            <h5 className="admin-section-title mb-1">Notice Board</h5>
            <p className="admin-section-text mb-4">Create and submit a notice for employees.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="notice-subject" className="form-label">
                  Subject
                </label>
                <input
                  id="notice-subject"
                  type="text"
                  name="subject"
                  className="form-control"
                  placeholder="Enter notice subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notice-title" className="form-label">
                  Title
                </label>
                <input
                  id="notice-title"
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="Enter notice title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notice-message" className="form-label">
                  Message
                </label>
                <textarea
                  id="notice-message"
                  name="message"
                  className="form-control"
                  rows="5"
                  placeholder="Write the notice message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}
              {!error && successMessage && <div className="alert alert-success py-2">{successMessage}</div>}

              <button type="submit" className="btn btn-success w-100">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="admin-surface h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="admin-section-title mb-1">Submitted Notices</h5>
                <p className="admin-section-text mb-0">Recently submitted notices appear here.</p>
              </div>
              <span className="admin-count-badge">{notices.length} Notices</span>
            </div>

            {notices.length === 0 ? (
              <div className="admin-empty-state">No notices submitted yet.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {notices.map((notice) => (
                  <div key={notice.id} className="admin-note-card">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                      <span className="badge bg-success-subtle text-success border">{notice.subject}</span>
                      <span className="small text-muted">{formatCreatedAt(notice.createdAt)}</span>
                    </div>
                    <h6 className="mb-2">{notice.title}</h6>
                    <p className="mb-0 text-muted">{notice.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
