import "./NotificationModal.css";

const TYPE_CLASSES = {
  success: "notification-modal__content--success",
  error: "notification-modal__content--error",
  info: "notification-modal__content--info",
  warning: "notification-modal__content--warning",
};

const TYPE_TITLES = {
  success: "Successful",
  error: "Error",
  info: "Info",
  warning: "Warning",
};

export default function NotificationModal({ show, onClose, message, type = "info" }) {
  if (!show) return null;

  const displayMessage = type === "success" ? "Successful" : message;

  return (
    <>
      <div className="modal-backdrop fade show notification-modal__backdrop" />
      <div className="modal fade show notification-modal" style={{ display: "block" }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered notification-modal__dialog">
          <div className={`modal-content notification-modal__content ${TYPE_CLASSES[type] || TYPE_CLASSES.info}`}>
            <div className="notification-modal__glow notification-modal__glow--top" />
            <div className="notification-modal__glow notification-modal__glow--bottom" />

            <div className="modal-header notification-modal__header">
              <div>
                <h5 className="modal-title notification-modal__title">{TYPE_TITLES[type] || TYPE_TITLES.info}</h5>
              </div>
              <button
                type="button"
                className="btn-close notification-modal__close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body notification-modal__body">
              <p className="mb-0 notification-modal__message">{displayMessage}</p>
            </div>
            <div className="modal-footer notification-modal__footer">
              <button type="button" className="btn notification-modal__button" onClick={onClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
