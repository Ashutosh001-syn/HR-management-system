export default function PlaceholderPage({ title, message }) {
  return (
    <div className="admin-page">
      <section className="admin-page__hero">
        <div>
          <div className="admin-page__eyebrow">Coming Next</div>
          <h1 className="admin-page__title">{title}</h1>
          <p className="admin-page__text">{message}</p>
        </div>
      </section>

      <div className="admin-surface">
        <div className="admin-section-kicker">Preview</div>
        <h5 className="admin-section-title mb-2">{title}</h5>
        <div className="admin-empty-state">{message}</div>
      </div>
    </div>
  );
}
