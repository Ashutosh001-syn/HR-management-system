export default function Error({ message = "Something went wrong." }) {
  return (
    <div className="alert alert-danger mb-0" role="alert">
      {message}
    </div>
  );
}
