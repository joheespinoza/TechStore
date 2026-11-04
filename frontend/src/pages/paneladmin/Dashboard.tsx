import { useMemo } from "react";
import { Link } from "react-router-dom";
import KpiGrid, { type Kpi } from "../../components/common/KpiGrid";
import StatBar from "../../components/common/StatBar";
import {
  formatPrice,
  getOrders,
  ORDER_FLOW,
  STATUS_LABEL,
  type OrderStatus,
} from "../../data/orders";
import { productCode, products } from "../../data/products";

const ALL_STATUSES: OrderStatus[] = [...ORDER_FLOW, "CANCELLED"];
const PENDING: OrderStatus[] = ["RECEIVED", "PAID", "PREPARING"];

export default function Dashboard() {
  const orders = useMemo(() => getOrders(), []);

  const sales = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const pending = orders.filter((o) => PENDING.includes(o.status)).length;
  const lowStock = products
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock);
  const outOfStock = lowStock.filter((p) => p.stock === 0).length;

  const kpis: Kpi[] = [
    {
      label: "Ventas acumuladas",
      value: formatPrice(sales),
      note: "No incluye pedidos cancelados",
    },
    {
      label: "Pedidos registrados",
      value: String(orders.length),
    },
    {
      label: "Pedidos por atender",
      value: String(pending),
      note: pending ? "Recibidos, pagados o en preparación" : "Sin pendientes",
      tone: pending ? "warning" : undefined,
    },
    {
      label: "Productos con stock bajo",
      value: String(lowStock.length),
      note: outOfStock
        ? `${outOfStock} agotado${outOfStock === 1 ? "" : "s"}`
        : "Ninguno agotado",
      tone: lowStock.length ? "warning" : undefined,
    },
  ];

  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <section aria-labelledby="dashboard-title">
      <div className="admin-page-heading">
        <div>
          <h1 id="dashboard-title">Dashboard</h1>
          <p>Resumen de ventas, pedidos e inventario.</p>
        </div>
      </div>

      <KpiGrid items={kpis} label="Indicadores generales" />

      {orders.length === 0 && (
        <p className="admin-empty">
          Aún no hay pedidos. Ve a <Link to="/admin/pedidos">Pedidos</Link> para
          cargar pedidos de demostración.
        </p>
      )}

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Pedidos por estado</h2>
          <table className="admin-table admin-table-compact">
            <caption className="visually-hidden">
              Cantidad de pedidos por estado
            </caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col" className="num">
                  Pedidos
                </th>
                <th scope="col">Proporción</th>
              </tr>
            </thead>
            <tbody>
              {ALL_STATUSES.map((status) => {
                const count = orders.filter((o) => o.status === status).length;
                const percent = orders.length
                  ? Math.round((count / orders.length) * 100)
                  : 0;

                return (
                  <tr key={status}>
                    <th scope="row">{STATUS_LABEL[status]}</th>
                    <td className="num">{count}</td>
                    <td>
                      <span className="bar-cell">
                        <StatBar percent={percent} />
                        <span>{percent} %</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-panel">
          <h2>Alertas de inventario</h2>

          {lowStock.length === 0 ? (
            <p className="admin-empty">Todos los productos tienen stock suficiente.</p>
          ) : (
            <ul className="alert-list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <span>
                    {p.name}
                    <small className="admin-table-sub">{productCode(p)}</small>
                  </span>
                  <span className={`stock-badge ${p.stock === 0 ? "is-out" : "is-low"}`}>
                    {p.stock === 0 ? "Agotado" : `Quedan ${p.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link to="/admin/productos" className="btn-secondary">
            Gestionar inventario
          </Link>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Últimos pedidos</h2>

        <div className="admin-table-wrap">
          <table className="admin-table admin-table-compact">
            <caption className="visually-hidden">Últimos cinco pedidos</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Fecha</th>
                <th scope="col" className="num">
                  Total
                </th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay pedidos para mostrar.</td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.id}>
                    <th scope="row">{o.number}</th>
                    <td>{o.customerName}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString("es-PE")}</td>
                    <td className="num">{formatPrice(o.total)}</td>
                    <td>
                      <span className={`order-badge is-${o.status}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Link to="/admin/pedidos" className="btn-secondary">
          Ver todos los pedidos
        </Link>
      </div>
    </section>
  );
}