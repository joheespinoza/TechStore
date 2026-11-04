import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img
            src="/images/branding/logo.jpg"
            alt="TechStore - Inicio"
            className="brand-img"
          />
        </Link>

        <nav
          className="navigation"
          aria-label="Navegación principal"
        >
          <NavLink to="/" end>
            Inicio
          </NavLink>

          <NavLink to="/productos">
            Productos
          </NavLink>

          <NavLink to="/productos?categoria=Laptops">
            Laptops
          </NavLink>

          <NavLink to="/productos?categoria=Monitores">
            Monitores
          </NavLink>

          <NavLink to="/productos?categoria=Mouse">
            Periféricos
          </NavLink>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="welcome">
                Hola, {user.name}
              </span>

              {user.role === "ADMIN" ? (
                <Link
                  className="btn-secondary"
                  to="/admin/pedidos"
                >
                  Panel admin
                </Link>
              ) : (
                <Link
                  className="btn-secondary"
                  to="/mis-pedidos"
                >
                  Mis pedidos
                </Link>
              )}

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                className="btn-secondary"
                to="/login"
              >
                Iniciar sesión
              </Link>

              <Link
                className="btn-primary"
                to="/registro"
              >
                Registrarse
              </Link>
            </>
          )}

          <Link
            to="/carrito"
            className="btn-secondary"
          >
            Carrito ({count})
          </Link>

          <p
            className="visually-hidden"
            role="status"
            aria-live="polite"
          >
            {count === 1
              ? "1 producto en el carrito"
              : `${count} productos en el carrito`}
          </p>
        </div>
      </div>
    </header>
  );
}