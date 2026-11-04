import { useLocation } from "react-router-dom";

export default function FlashMessage() {
  const location = useLocation();
  const message = (location.state as { accessDenied?: string } | null)
    ?.accessDenied;

  if (!message) return null;

  return (
    <p className="flash-message" role="alert">
      {message}
    </p>
  );
}