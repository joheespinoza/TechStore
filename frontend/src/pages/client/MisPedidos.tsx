import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrderTracker from "../../components/common/OrderTracker";
import { getProductById } from "../../data/products";
import {
  createDemoOrders,
  formatPrice,
  getOrdersByEmail,
  STATUS_HELP,
  STATUS_LABEL,
} from "../../data/orders";

export default function MisPedidos() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(() =>
    user ? getOrdersByEmail(user.email) : []
  );

  if (!user) return null;

  const loadDemo = () => {
    createDemoOrders(user.email, `${user.name} ${user.lastName}`);
    setOrders(getOrdersByEmail(user.email));
  };

  return (
    <section className="orders-page" aria-labelledby="orders-title">
      <div className="cart-page-heading">
        <div>
          <h1 id="orders-title">Mis pedidos</h1>
          <p>Sigue el recorrido de cada compra, fase por fase.</p>
        </div>
        <Link to="/productos" className="btn-secondary">
          Seguir comprando
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <p>Aún no tienes pedidos registrados.</p>
          <button type="button" className="btn-primary" onClick={loadDemo}>
            Cargar pedidos de demostración
          </button>
          <p className="cart-page-disclaimer">
            Los pedidos de demostración se guardan solo en este navegador.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article
              key={order.id}
              className="order-card"
              aria-labelledby={`order-title-${order.id}`}
            >
              <header className="order-card-header">
                <div>
                  <h2 id={`order-title-${order.id}`}>Pedido {order.number}</h2>
                  <p>
                    Realizado el{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`order-badge is-${order.status}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </header>

              <OrderTracker status={order.status} />

              <p
                className={
                  order.status === "NEARBY"
                    ? "order-help order-help-highlight"
                    : "order-help"
                }
              >
                {STATUS_HELP[order.status]}
              </p>

              <ul className="order-items">
                {order.items.map((item) => {
                  const product = getProductById(item.productId);

                  return (
                    <li key={item.productId}>
                      <span className="order-item-info">
                        {product && (
                          <span className="order-item-image">
                            <img
                              src={product.image}
                              alt={`Fotografía del producto ${item.name}`}
                              loading="lazy"
                            />
                          </span>
                        )}
                        <span>
                          {item.name}
                          <small className="order-item-sub">
                            Cantidad: {item.quantity} · {formatPrice(item.price)} por
                            unidad
                          </small>
                        </span>
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  );
                })}
              </ul>

              <footer className="order-card-footer">
                <span>Entrega en: {order.address}</span>
                <strong>Total: {formatPrice(order.total)}</strong>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}