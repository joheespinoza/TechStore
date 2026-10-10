
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { money } from "../../data/products";

export default function Carrito() {
  const { items, total, update, remove } = useCart();
  const { user } = useAuth();

  const units = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <section className="cart-page">
      <div className="cart-page-heading">
        <div>
          <h1>Carrito de compras</h1>
          <p>
            Revisa los productos seleccionados antes
            de continuar con tu pedido.
          </p>
        </div>

        <Link to="/productos" className="btn-secondary">
          Seguir comprando
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>Tu carrito está vacío</h2>
          <p>
            Todavía no has agregado productos.
          </p>
          <Link
            to="/productos"
            className="btn-primary"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="cart-page-layout">
          <div className="cart-page-products">
            {items.map(({ product, qty }) => (
              <article
                className="cart-page-product"
                key={product.id}
              >
                <div className="cart-page-product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>

                <div className="cart-page-product-info">
                  <span>{product.brand}</span>
                  <h2>{product.name}</h2>
                  <p>{money(product.price)} por unidad</p>

                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Quitar una unidad de ${product.name}`}
                      disabled={qty <= 1}
                      onClick={() =>
                        update(product.id, qty - 1)
                      }
                    >
                      −
                    </button>

                    <output>{qty}</output>

                    <button
                      type="button"
                      aria-label={`Agregar una unidad de ${product.name}`}
                      disabled={qty >= product.stock}
                      onClick={() =>
                        update(product.id, qty + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-page-product-end">
                  <strong>
                    {money(product.price * qty)}
                  </strong>

                  <button
                    type="button"
                    className="remove-product"
                    onClick={() => remove(product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-page-summary">
            <h2>Resumen del pedido</h2>

            <div className="summary-line">
              <span>Productos</span>
              <span>{units} unidades</span>
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>

            <div className="summary-total">
              <span>Total referencial</span>
              <strong>{money(total)}</strong>
            </div>

            <Link
              to={user ? "/checkout" : "/login"}
              state={
                user
                  ? undefined
                  : {
                      from: "/checkout",
                      message:
                        "Inicia sesión para finalizar tu compra.",
                    }
              }
              className="btn-primary full"
            >
              {user
                ? "Continuar con la compra"
                : "Iniciar sesión para comprar"}
            </Link>

            <p className="cart-page-disclaimer">
              El pedido y los pagos son simulados
              durante esta etapa del proyecto.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
