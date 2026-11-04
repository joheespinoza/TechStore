import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth, type Role } from "../../context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({
  children,
  role,
  loginMessage = "Inicia sesión para finalizar tu compra.",
}: {
  children: ReactNode;
  role?: Role;
  loginMessage?: string;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: loginMessage,
        }}
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          accessDenied:
            "No tienes permisos de administrador para acceder a esta sección.",
        }}
      />
    );
  }

  return <>{children}</>;
}