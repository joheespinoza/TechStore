import { useEffect, useRef, useState } from "react";
import {
  createDemoOrders,
  formatPrice,
  getOrders,
  ORDER_FLOW,
  STATUS_LABEL,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../data/orders";

const PAGE_SIZE = 5;
const ALL_STATUSES: OrderStatus[] = [...ORDER_FLOW, "CANCELLED"];

export default function GestionPedidos() {
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<{
    order: Order;
    next: OrderStatus;
  } | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function closeDialog() {
    setPending(null);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!pending) return;
    keepRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPending(null);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending]);

  function applyStatus(order: Order, next: OrderStatus) {
    updateOrderStatus(order.id, next);
    setOrders(getOrders());
    setMessage(`El pedido ${order.number} cambió a: ${STATUS_LABEL[next]}.`);
  }

  function handleChange(
    order: Order,
    next: OrderStatus,
    element: HTMLSelectElement
  ) {
    if (next === order.status) return;

    if (next === "CANCELLED") {
      triggerRef.current = element;
      setPending({ order, next });
      return;
    }

    applyStatus(order, next);
  }

  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const first = keepRef.current;
    const last = confirmRef.current;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  function loadDemo() {
    createDemoOrders("cliente.demo@techstore.pe", "Cliente Demo");
    setOrders(getOrders());
  }

  return (
    <section aria-labelledby="admin-orders-title">
      <div className="admin-page-heading">
        <div>
          <h1 id="admin-orders-title">Gestión de pedidos</h1>
          <p>
            Actualiza la fase de cada pedido para que el cliente pueda
            seguirlo.
          </p>
        </div>

        <div className="admin-filter">
          <label htmlFor="order-filter">Filtrar por estado</label>
          <select
            id="order-filter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as "ALL" | OrderStatus);
              setPage(1);
            }}
          >
            <option value="ALL">Todos los estados</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="orders-live" role="status" aria-live="polite">
        {message}
      </p>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <p>No hay pedidos registrados.</p>
          <button type="button" className="btn-primary" onClick={loadDemo}>
            Cargar pedidos de demostración
          </button>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <caption>
                Lista de pedidos ({filtered.length}{" "}
                {filtered.length === 1 ? "resultado" : "resultados"})
              </caption>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Total</th>
                  <th scope="col">Estado actual</th>
                  <th scope="col">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No hay pedidos con este estado.</td>
                  </tr>
                ) : (
                  visible.map((order) => (
                    <tr key={order.id}>
                      <th scope="row">{order.number}</th>
                      <td>
                        {order.customerName}
                        <small className="admin-table-sub">
                          {order.customerEmail}
                        </small>
                      </td>
                      <td>
                        <ul className="admin-products">
                          {order.items.map((it) => (
                            <li key={it.productId}>
                              {it.quantity} x {it.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("es-PE")}
                      </td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`order-badge is-${order.status}`}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td>
                        <label
                          htmlFor={`status-${order.id}`}
                          className="visually-hidden"
                        >
                          Nuevo estado del pedido {order.number}
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(e) =>
                            handleChange(
                              order,
                              e.target.value as OrderStatus,
                              e.target
                            )
                          }
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <nav className="admin-pagination" aria-label="Paginación de pedidos">
            <button
              type="button"
              className="btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Página anterior
            </button>
            <span aria-live="polite">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Página siguiente
            </button>
          </nav>
        </>
      )}

      {pending && (
        <div className="checkout-overlay">
          <div
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            aria-describedby="cancel-desc"
            onKeyDown={trapFocus}
          >
            <div className="checkout-modal-header">
              <h2 id="cancel-title">Cancelar pedido {pending.order.number}</h2>
            </div>
            <div className="checkout-modal-content">
              <p id="cancel-desc">
                Esta acción cambia el pedido a “Cancelado” y el cliente lo verá
                en su seguimiento. ¿Deseas continuar?
              </p>
            </div>
            <div className="checkout-modal-footer">
              <div className="checkout-footer-actions">
                <button
                  ref={keepRef}
                  type="button"
                  className="btn-secondary"
                  onClick={closeDialog}
                >
                  Mantener el estado actual
                </button>
                <button
                  ref={confirmRef}
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    applyStatus(pending.order, pending.next);
                    closeDialog();
                  }}
                >
                  Sí, cancelar pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}