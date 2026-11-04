import { useMemo, useState } from "react";
import KpiGrid, { type Kpi } from "../../components/common/KpiGrid";
import StatBar from "../../components/common/StatBar";
import {
  formatPrice,
  getOrders,
  STATUS_LABEL,
  type Order,
} from "../../data/orders";
import { getProductById, money, products } from "../../data/products";

type Period = "ALL" | "7" | "30";

const DAY = 86400000;

function exportCsv(rows: Order[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  const header = [
    "Pedido",
    "Fecha",
    "Cliente",
    "Correo",
    "Estado",
    "Productos",
    "Total (S/)",
  ];

  const body = rows.map((o) =>
    [
      o.number,
      new Date(o.createdAt).toLocaleDateString("es-PE"),
      o.customerName,
      o.customerEmail,
      STATUS_LABEL[o.status],
      o.items.map((i) => `${i.quantity} x ${i.name}`).join(" | "),
      o.total.toFixed(2),
    ]
      .map(esc)
      .join(",")
  );

  const csv = "\uFEFF" + [header.map(esc).join(","), ...body].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = "pedidos-techstore.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const [period, setPeriod] = useState<Period>("ALL");
  const [now] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const allOrders = useMemo(() => getOrders(), []);

  const inRange = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          period === "ALL" ||
          new Date(o.createdAt).getTime() >= now - Number(period) * DAY
      ),
    [allOrders, period, now]
  );

  const sales = inRange.filter((o) => o.status !== "CANCELLED");
  const revenue = sales.reduce((sum, o) => sum + o.total, 0);
  const units = sales.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const kpis: Kpi[] = [
    { label: "Ingresos", value: formatPrice(revenue), note: "Sin pedidos cancelados" },
    { label: "Pedidos", value: String(sales.length) },
    { label: "Unidades vendidas", value: String(units) },
    {
      label: "Ticket promedio",
      value: formatPrice(sales.length ? revenue / sales.length : 0),
      note: "Ingreso por pedido",
    },
  ];

  const byProduct = new Map<number, { name: string; units: number; revenue: number }>();
  const byCategory = new Map<string, { units: number; revenue: number }>();

  for (const order of sales) {
    for (const item of order.items) {
      const line = byProduct.get(item.productId) ?? {
        name: item.name,
        units: 0,
        revenue: 0,
      };
      line.units += item.quantity;
      line.revenue += item.price * item.quantity;
      byProduct.set(item.productId, line);

      const category = getProductById(item.productId)?.category ?? "Producto retirado";
      const cat = byCategory.get(category) ?? { units: 0, revenue: 0 };
      cat.units += item.quantity;
      cat.revenue += item.price * item.quantity;
      byCategory.set(category, cat);
    }
  }

  const topProducts = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
  const categories = [...byCategory.entries()].sort(
    (a, b) => b[1].revenue - a[1].revenue
  );

  const inventory = new Map<string, { units: number; value: number }>();
  for (const p of products) {
    const row = inventory.get(p.category) ?? { units: 0, value: 0 };
    row.units += p.stock;
    row.value += p.price * p.stock;
    inventory.set(p.category, row);
  }
  const inventoryRows = [...inventory.entries()].sort((a, b) => b[1].value - a[1].value);
  const inventoryTotal = inventoryRows.reduce((s, [, r]) => s + r.value, 0);

  const percentOf = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;

  function handleExport() {
    exportCsv(inRange);
    setMessage(
      `Se descargó el archivo pedidos-techstore.csv con ${inRange.length} pedidos.`
    );
  }

  return (
    <section aria-labelledby="reports-title">
      <div className="admin-page-heading">
        <div>
          <h1 id="reports-title">Reportes</h1>
          <p>Ventas, productos más vendidos e inventario.</p>
        </div>

        <div className="admin-toolbar-inline">
          <div className="admin-filter">
            <label htmlFor="report-period">Periodo</label>
            <select
              id="report-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <option value="ALL">Todo el historial</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
            disabled={inRange.length === 0}
          >
            Exportar pedidos (CSV)
          </button>
        </div>
      </div>

      <p className="orders-live" role="status" aria-live="polite">
        {message}
      </p>

      <KpiGrid items={kpis} label="Indicadores del periodo" />

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Productos más vendidos</h2>
          <table className="admin-table admin-table-compact">
            <caption className="visually-hidden">
              Ranking de productos por ingresos
            </caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col" className="num">
                  Unidades
                </th>
                <th scope="col" className="num">
                  Ingresos
                </th>
                <th scope="col">Participación</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4}>No hay ventas en este periodo.</td>
                </tr>
              ) : (
                topProducts.slice(0, 8).map((line) => {
                  const percent = percentOf(line.revenue, revenue);
                  return (
                    <tr key={line.name}>
                      <th scope="row">{line.name}</th>
                      <td className="num">{line.units}</td>
                      <td className="num">{formatPrice(line.revenue)}</td>
                      <td>
                        <span className="bar-cell">
                          <StatBar percent={percent} />
                          <span>{percent} %</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-panel">
          <h2>Ventas por categoría</h2>
          <table className="admin-table admin-table-compact">
            <caption className="visually-hidden">Ingresos por categoría</caption>
            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col" className="num">
                  Unidades
                </th>
                <th scope="col" className="num">
                  Ingresos
                </th>
                <th scope="col">Participación</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4}>No hay ventas en este periodo.</td>
                </tr>
              ) : (
                categories.map(([name, row]) => {
                  const percent = percentOf(row.revenue, revenue);
                  return (
                    <tr key={name}>
                      <th scope="row">{name}</th>
                      <td className="num">{row.units}</td>
                      <td className="num">{formatPrice(row.revenue)}</td>
                      <td>
                        <span className="bar-cell">
                          <StatBar percent={percent} />
                          <span>{percent} %</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Inventario por categoría</h2>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table-compact">
            <caption className="visually-hidden">
              Unidades y valor del inventario por categoría
            </caption>
            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col" className="num">
                  Unidades
                </th>
                <th scope="col" className="num">
                  Valor
                </th>
                <th scope="col">Participación</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map(([name, row]) => {
                const percent = percentOf(row.value, inventoryTotal);
                return (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td className="num">{row.units}</td>
                    <td className="num">{money(row.value)}</td>
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
      </div>
    </section>
  );
}