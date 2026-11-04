import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <a href="#admin-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <aside className="admin-sidebar">
        <h2>TechStore Admin</h2>

        <p>Panel visual de demostración</p>

        <nav aria-label="Navegación del panel administrativo">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/productos">Productos</NavLink>
          <NavLink to="/admin/pedidos">Pedidos</NavLink>
          <NavLink to="/admin/reportes">Reportes</NavLink>
          <NavLink to="/">Volver a la tienda</NavLink>
        </nav>
      </aside>

      <main id="admin-content" className="admin-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}