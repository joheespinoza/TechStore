
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { money } from "../../data/products";

type Step = 1 | 2 | 3 | 4;
type DeliveryType = "domicilio" | "agencia";
type PaymentType = "entrega" | "transferencia";

interface ShippingData {
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  department: string;
  district: string;
  address: string;
  reference: string;
}

const initialShipping: ShippingData = {
  name: "",
  lastName: "",
  dni: "",
  phone: "",
  email: "",
  department: "",
  district: "",
  address: "",
  reference: "",
};

const districts: Record<string, string[]> = {
  Lima: [
    "Miraflores",
    "San Isidro",
    "Surco",
    "San Miguel",
    "Los Olivos",
    "Cercado de Lima",
    "La Molina",
    "Otro distrito",
  ],
  Arequipa: [
    "Cercado",
    "Cayma",
    "Cerro Colorado",
    "Yanahuara",
    "Otro distrito",
  ],
  "La Libertad": [
    "Trujillo",
    "Víctor Larco Herrera",
    "El Porvenir",
    "Otro distrito",
  ],
  Cusco: [
    "Cusco",
    "Wanchaq",
    "San Sebastián",
    "Otro distrito",
  ],
};

const steps = ["Carrito", "Envío", "Pago", "Listo"];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    total,
    count,
    update,
    remove,
    clear,
  } = useCart();

  const [step, setStep] = useState<Step>(1);
  const [delivery, setDelivery] =
    useState<DeliveryType>("domicilio");

  const [payment, setPayment] =
    useState<PaymentType>("entrega");

  const [shipping, setShipping] =
    useState<ShippingData>(() => ({
      ...initialShipping,
      name: user?.name || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }));

  const [error, setError] = useState("");
  const [accept, setAccept] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const change = (
    field: keyof ShippingData,
    value: string
  ) => {
    setShipping((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  const close = () => {
    navigate("/carrito");
  };

  const previous = () => {
    setError("");
    setStep((current) =>
      Math.max(1, current - 1) as Step
    );
  };

  const nextShipping = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (
      shipping.name.trim().length < 2 ||
      shipping.lastName.trim().length < 2
    ) {
      setError("Ingresa nombres y apellidos válidos.");
      return;
    }

    if (!/^\d{8}$/.test(shipping.dni)) {
      setError("El DNI debe contener 8 dígitos.");
      return;
    }

    if (!/^9\d{8}$/.test(shipping.phone)) {
      setError(
        "Ingresa un teléfono peruano de 9 dígitos."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        shipping.email
      )
    ) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (
      !shipping.department ||
      !shipping.district
    ) {
      setError(
        "Selecciona el departamento y el distrito."
      );
      return;
    }

    if (
      delivery === "domicilio" &&
      shipping.address.trim().length < 8
    ) {
      setError(
        "Ingresa una dirección de al menos 8 caracteres."
      );
      return;
    }

    setStep(3);
  };

  const confirmOrder = () => {
    setError("");

    if (!items.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.qty < 1 ||
          item.qty > item.product.stock
      )
    ) {
      setError(
        "Revisa las cantidades disponibles."
      );
      return;
    }

    if (!accept) {
      setError(
        "Debes confirmar que los datos del pedido son correctos."
      );
      return;
    }

    const number = `TS-${Date.now().toString().slice(-8)}`;

    setOrderNumber(number);
    clear();
    setStep(4);
  };

  const shippingInput = (
    field: keyof ShippingData,
    label: string,
    placeholder: string,
    options?: {
      maxLength?: number;
      inputMode?: "numeric" | "text" | "email" | "tel";
      required?: boolean;
    }
  ) => (
    <label className="checkout-field">
      <span>{label}</span>

      <input
        value={shipping[field]}
        placeholder={placeholder}
        maxLength={options?.maxLength}
        inputMode={options?.inputMode}
        required={options?.required ?? true}
        onChange={(e) => {
          const value =
            options?.inputMode === "numeric" ||
            options?.inputMode === "tel"
              ? e.target.value.replace(/\D/g, "")
              : e.target.value;

          change(field, value);
        }}
      />
    </label>
  );

  if (!items.length && step !== 4) {
    return (
      <section className="checkout-overlay">
        <div className="checkout-modal">
          <div className="checkout-modal-header">
            <h2>Carrito vacío</h2>
            <button onClick={close} aria-label="Cerrar">
              ×
            </button>
          </div>

          <div className="checkout-modal-content">
            <p>
              Agrega productos para comenzar tu compra.
            </p>
            <button
              className="btn-primary full"
              onClick={() => navigate("/productos")}
            >
              Explorar productos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-overlay">
      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {/* ENCABEZADO */}

        <header className="checkout-modal-header">
          <h2 id="checkout-title">
            {step === 1 && "Resumen del carrito"}
            {step === 2 && "Datos de envío"}
            {step === 3 && "Método de pago"}
            {step === 4 && "Pedido confirmado"}
          </h2>

          {step !== 4 && (
            <button
              type="button"
              className="checkout-close"
              aria-label="Cerrar compra"
              onClick={close}
            >
              ×
            </button>
          )}
        </header>

        {/* INDICADOR DE PASOS */}

        <div className="checkout-steps">
          {steps.map((name, index) => {
            const number = index + 1;

            return (
              <div
                key={name}
                className={`checkout-step ${
                  step === number ? "is-current" : ""
                } ${
                  step > number ? "is-complete" : ""
                }`}
                aria-current={
                  step === number ? "step" : undefined
                }
              >
                <span className="checkout-step-circle">
                  {step > number ? "✓" : number}
                </span>
                <small>{name}</small>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="checkout-error" role="alert">
            {error}
          </div>
        )}

        {/* PASO 1: CARRITO */}

        {step === 1 && (
          <>
            <div className="checkout-modal-content">
              <p className="checkout-section-label">
                PRODUCTOS ({count} UNIDADES)
              </p>

              <div className="checkout-products">
                {items.map(({ product, qty }) => (
                  <article
                    className="checkout-product"
                    key={product.id}
                  >
                    <div className="checkout-product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    </div>

                    <div className="checkout-product-details">
                      <h3>{product.name}</h3>
                      <small>{product.brand}</small>

                      <strong>
                        {money(product.price)} c/u
                      </strong>

                      <div className="quantity-control">
                        <button
                          type="button"
                          disabled={qty <= 1}
                          aria-label={`Disminuir ${product.name}`}
                          onClick={() =>
                            update(product.id, qty - 1)
                          }
                        >
                          −
                        </button>

                        <output>{qty}</output>

                        <button
                          type="button"
                          disabled={qty >= product.stock}
                          aria-label={`Aumentar ${product.name}`}
                          onClick={() =>
                            update(product.id, qty + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="checkout-product-end">
                      <button
                        type="button"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => remove(product.id)}
                      >
                        ×
                      </button>

                      <strong>
                        {money(product.price * qty)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <footer className="checkout-modal-footer">
              <div className="checkout-totals">
                <div>
                  <span>Subtotal</span>
                  <span>{money(total)}</span>
                </div>

                <div>
                  <span>IGV</span>
                  <span>
                    Incluido en precios de demostración
                  </span>
                </div>

                <div className="checkout-grand-total">
                  <strong>Total referencial</strong>
                  <strong>{money(total)}</strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary full"
                onClick={() => setStep(2)}
              >
                Continuar con el envío →
              </button>
            </footer>
          </>
        )}

        {/* PASO 2: ENVÍO */}

        {step === 2 && (
          <form onSubmit={nextShipping}>
            <div className="checkout-modal-content">
              <p className="checkout-section-label">
                TIPO DE ENTREGA
              </p>

              <div className="delivery-options">
                <button
                  type="button"
                  className={
                    delivery === "domicilio"
                      ? "is-selected"
                      : ""
                  }
                  onClick={() => setDelivery("domicilio")}
                  aria-pressed={delivery === "domicilio"}
                >
                  <strong>A domicilio</strong>
                  <small>Recibir en mi dirección</small>
                </button>

                <button
                  type="button"
                  className={
                    delivery === "agencia"
                      ? "is-selected"
                      : ""
                  }
                  onClick={() => setDelivery("agencia")}
                  aria-pressed={delivery === "agencia"}
                >
                  <strong>Recojo en agencia</strong>
                  <small>Punto de entrega</small>
                </button>
              </div>

              <p className="checkout-section-label">
                DATOS DEL DESTINATARIO
              </p>

              <div className="checkout-form-grid">
                {shippingInput(
                  "name",
                  "Nombres",
                  "Ingresa tus nombres"
                )}

                {shippingInput(
                  "lastName",
                  "Apellidos",
                  "Ingresa tus apellidos"
                )}

                {shippingInput(
                  "dni",
                  "DNI",
                  "8 dígitos",
                  {
                    maxLength: 8,
                    inputMode: "numeric",
                  }
                )}

                {shippingInput(
                  "phone",
                  "Teléfono",
                  "9 dígitos",
                  {
                    maxLength: 9,
                    inputMode: "tel",
                  }
                )}

                <div className="checkout-wide">
                  {shippingInput(
                    "email",
                    "Correo electrónico",
                    "correo@ejemplo.com",
                    { inputMode: "email" }
                  )}
                </div>
              </div>

              <p className="checkout-section-label">
                {delivery === "domicilio"
                  ? "DIRECCIÓN DE ENTREGA"
                  : "UBICACIÓN PARA RECOJO"}
              </p>

              <div className="checkout-form-grid">
                <label className="checkout-field">
                  <span>Departamento</span>

                  <select
                    required
                    value={shipping.department}
                    onChange={(e) =>
                      setShipping((previous) => ({
                        ...previous,
                        department: e.target.value,
                        district: "",
                      }))
                    }
                  >
                    <option value="">
                      Seleccionar departamento
                    </option>

                    {Object.keys(districts).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="checkout-field">
                  <span>Distrito</span>

                  <select
                    required
                    value={shipping.district}
                    disabled={!shipping.department}
                    onChange={(e) =>
                      change("district", e.target.value)
                    }
                  >
                    <option value="">
                      Seleccionar distrito
                    </option>

                    {(
                      districts[shipping.department] || []
                    ).map((district) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    ))}
                  </select>
                </label>

                {delivery === "domicilio" && (
                  <>
                    <div className="checkout-wide">
                      {shippingInput(
                        "address",
                        "Dirección exacta",
                        "Av. Principal 123, departamento 5"
                      )}
                    </div>

                    <div className="checkout-wide">
                      {shippingInput(
                        "reference",
                        "Referencia (opcional)",
                        "Frente al parque",
                        { required: false }
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="delivery-information">
                {delivery === "domicilio"
                  ? "Entrega a domicilio: plazo y costo pendientes de confirmar."
                  : "Recojo en agencia: la ubicación se confirmará cuando esté disponible este servicio."}
              </div>
            </div>

            <footer className="checkout-modal-footer">
              <div className="checkout-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={previous}
                >
                  ← Volver
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Continuar con el pago →
                </button>
              </div>
            </footer>
          </form>
        )}

        {/* PASO 3: PAGO */}

        {step === 3 && (
          <>
            <div className="checkout-modal-content">
              <p className="checkout-section-label">
                SELECCIONA UN MÉTODO DE PAGO
              </p>

              <div className="payment-options">
                <button
                  type="button"
                  className={
                    payment === "entrega"
                      ? "is-selected"
                      : ""
                  }
                  onClick={() => setPayment("entrega")}
                  aria-pressed={payment === "entrega"}
                >
                  <strong>Pago contra entrega</strong>
                  <small>
                    Opción de demostración
                  </small>
                </button>

                <button
                  type="button"
                  className={
                    payment === "transferencia"
                      ? "is-selected"
                      : ""
                  }
                  onClick={() =>
                    setPayment("transferencia")
                  }
                  aria-pressed={
                    payment === "transferencia"
                  }
                >
                  <strong>Transferencia bancaria</strong>
                  <small>
                    Simulación sin transferencia real
                  </small>
                </button>
              </div>

              <div className="checkout-order-review">
                <h3>Resumen de la compra</h3>

                <div>
                  <span>Artículos</span>
                  <span>{count}</span>
                </div>

                <div>
                  <span>Entrega</span>
                  <span>
                    {delivery === "domicilio"
                      ? "A domicilio"
                      : "Recojo en agencia"}
                  </span>
                </div>

                <div>
                  <span>Método de pago</span>
                  <span>
                    {payment === "entrega"
                      ? "Contra entrega"
                      : "Transferencia simulada"}
                  </span>
                </div>

                <div>
                  <strong>Total referencial</strong>
                  <strong>{money(total)}</strong>
                </div>
              </div>

              <label className="checkout-confirmation">
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) =>
                    setAccept(e.target.checked)
                  }
                />

                <span>
                  Confirmo que los datos de este pedido
                  de demostración son correctos.
                </span>
              </label>

              <p className="checkout-demo-note">
                No se realizará ningún cobro ni se
                almacenará un pedido en un servidor.
              </p>
            </div>

            <footer className="checkout-modal-footer">
              <div className="checkout-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={previous}
                >
                  ← Volver
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={confirmOrder}
                >
                  Confirmar pedido →
                </button>
              </div>
            </footer>
          </>
        )}

        {/* PASO 4: CONFIRMACIÓN */}

        {step === 4 && (
          <div className="checkout-success">
            <div className="checkout-success-symbol">
              ✓
            </div>

            <h2>Pedido de prueba confirmado</h2>

            <p>
              Has completado correctamente el flujo
              de compra de TechStore.
            </p>

            <div className="checkout-success-number">
              <span>Referencia de demostración</span>
              <strong>{orderNumber}</strong>
            </div>

            <p>
              No se ha registrado una compra real
              ni se ha procesado ningún pago.
            </p>

            <button
              className="btn-primary full"
              onClick={() => navigate("/productos")}
            >
              Volver al catálogo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
