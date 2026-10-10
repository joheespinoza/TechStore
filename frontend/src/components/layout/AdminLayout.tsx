
import {
  NavLink,
  Outlet,
} from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>TechStore Admin</h2>

        <p>Panel visual de demostración</p>

        <nav>
          <NavLink to="/admin/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/admin/productos">
            Productos
          </NavLink>

          <NavLink to="/admin/pedidos">
            Pedidos
          </NavLink>

          <NavLink to="/admin/reportes">
            Reportes
          </NavLink>

          <NavLink to="/">
            Volver a la tienda
          </NavLink>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
