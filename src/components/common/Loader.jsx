export default function Loader({ label = "Loading..." }) {
  return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border text-success mb-3" role="status" aria-hidden="true" />
      <div>{label}</div>
    </div>
  );
}
