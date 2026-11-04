import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img
              src="/images/branding/logo.jpg"
              alt="TechStore - Inicio"
              className="footer-logo-img"
            />
          </Link>

          <p>
            Tienda de tecnología y hardware: laptops, monitores, componentes y
            periféricos para tu estudio, trabajo y entretenimiento.
          </p>
        </div>

        <nav className="footer-column" aria-labelledby="footer-shop">
          <h2 id="footer-shop">Tienda</h2>
          <ul>
            <li>
              <Link to="/productos">Todos los productos</Link>
            </li>
            <li>
              <Link to="/productos?categoria=Laptops">Laptops</Link>
            </li>
            <li>
              <Link to="/productos?categoria=Monitores">Monitores</Link>
            </li>
            <li>
              <Link to="/productos?categoria=Mouse">Periféricos</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-column" aria-labelledby="footer-account">
          <h2 id="footer-account">Mi cuenta</h2>
          <ul>
            <li>
              <Link to="/carrito">Carrito de compras</Link>
            </li>

            {user ? (
              <li>
                <Link to={user.role === "ADMIN" ? "/admin/pedidos" : "/mis-pedidos"}>
                  {user.role === "ADMIN" ? "Panel administrativo" : "Mis pedidos"}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Iniciar sesión</Link>
                </li>
                <li>
                  <Link to="/registro">Crear cuenta</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="footer-column">
          <h2 id="footer-help">Atención al cliente</h2>
          <ul aria-labelledby="footer-help">
            {/* Datos de ejemplo: reemplázalos por los reales */}
            <li>
              <span className="footer-label">Correo</span>
              <a href="mailto:contacto@techstore.pe">contacto@techstore.pe</a>
            </li>
            <li>
              <span className="footer-label">Horario</span>
              <span>Lunes a viernes, 9:00 a 18:00</span>
            </li>
            <li>
              <span className="footer-label">Cobertura</span>
              <span>Envíos a todo el Perú</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 TechStore. Prototipo académico.</p>
        <p>
          Productos, precios y pagos de demostración. Este sitio busca cumplir
          las pautas WCAG 2.2 nivel AA.
        </p>
      </div>
    </footer>
  );
}