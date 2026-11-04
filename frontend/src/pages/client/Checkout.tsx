import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { money } from "../../data/products";
import { createOrder, orderItemsFromCart } from "../../data/orders";
import { checkStock, deductStock } from "../../data/inventory";

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

type FieldErrors = Partial<Record<keyof ShippingData, string>>;

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
  Cusco: ["Cusco", "Wanchaq", "San Sebastián", "Otro distrito"],
};

const steps = ["Carrito", "Envío", "Pago", "Listo"];

function validateField(
  field: keyof ShippingData,
  value: string,
  delivery: DeliveryType
): string {
  switch (field) {
    case "name":
      return value.trim().length < 2
        ? "Ingresa tus nombres con al menos 2 letras."
        : "";
    case "lastName":
      return value.trim().length < 2
        ? "Ingresa tus apellidos con al menos 2 letras."
        : "";
    case "dni":
      return /^\d{8}$/.test(value)
        ? ""
        : "El DNI debe tener exactamente 8 números, por ejemplo 12345678.";
    case "phone":
      return /^9\d{8}$/.test(value)
        ? ""
        : "Ingresa un celular de 9 números que empiece con 9, por ejemplo 987654321.";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ""
        : "Ingresa un correo electrónico válido como usuario@dominio.com.";
    case "department":
      return value ? "" : "Selecciona un departamento de la lista.";
    case "district":
      return value ? "" : "Selecciona un distrito de la lista.";
    case "address":
      return delivery === "domicilio" && value.trim().length < 8
        ? "Ingresa la calle y el número, por ejemplo Av. Principal 123."
        : "";
    default:
      return "";
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, count, update, remove, clear } = useCart();

  const [step, setStep] = useState<Step>(1);
  const [delivery, setDelivery] = useState<DeliveryType>("domicilio");
  const [payment, setPayment] = useState<PaymentType>("entrega");

  const [shipping, setShipping] = useState<ShippingData>(() => ({
    ...initialShipping,
    name: user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }));

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [accept, setAccept] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<number | null>(null);

  const close = () => {
    navigate("/carrito");
  };

  /* Si el cliente sale de la página, se cancela el proceso pendiente */
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  /* El foco pasa al título al cambiar de paso */
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  /* Escape cierra el proceso, salvo al procesar o al terminar */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== 4 && !processing) {
        navigate("/carrito");
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, processing, navigate]);

  const change = (field: keyof ShippingData, value: string) => {
    setShipping((previous) => ({ ...previous, [field]: value }));
    setError("");

    /* Si el campo ya mostraba un error, se revalida al escribir */
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: validateField(field, value, delivery),
      }));
    }
  };

  const blurField = (field: keyof ShippingData) => {
    setFieldErrors((previous) => ({
      ...previous,
      [field]: validateField(field, shipping[field], delivery),
    }));
  };

  const previous = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1) as Step);
  };

  const nextShipping = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const fields: (keyof ShippingData)[] = [
      "name",
      "lastName",
      "dni",
      "phone",
      "email",
      "department",
      "district",
      "address",
    ];

    const errors: FieldErrors = {};
    for (const field of fields) {
      const message = validateField(field, shipping[field], delivery);
      if (message) errors[field] = message;
    }

    setFieldErrors(errors);

    const firstInvalid = fields.find((f) => errors[f]);

    if (firstInvalid) {
      setError(
        "Revisa los campos marcados: hay datos que debes corregir antes de continuar."
      );
      document.getElementById(`ship-${firstInvalid}`)?.focus();
      return;
    }

    setStep(3);
  };

  const confirmOrder = () => {
    if (processing) return;
    setError("");

    if (!items.length) {
      setError("Tu carrito está vacío. Agrega productos para continuar.");
      return;
    }

    /* Primera verificación: el carrito contra el stock actual */
    const soldOut = items.find((i) => i.qty < 1 || i.product.stock < 1);

    if (soldOut) {
      setError(
        `“${soldOut.product.name}” se agotó. Vuelve al carrito para quitarlo y continuar.`
      );
      return;
    }

    if (items.some((i) => i.qty > i.product.stock)) {
      setError(
        "Alguna cantidad supera el stock disponible. Vuelve al carrito para ajustarla."
      );
      return;
    }

    if (!accept) {
      setError(
        "Marca la casilla para confirmar que los datos del pedido son correctos."
      );
      return;
    }

    /* Se copian los datos antes de vaciar el carrito */
    const orderItems = orderItemsFromCart(items);
    const address =
      delivery === "domicilio"
        ? `${shipping.address.trim()}, ${shipping.district}, ${shipping.department}`
        : `Recojo en agencia: ${shipping.district}, ${shipping.department}`;
    const customerName = `${shipping.name.trim()} ${shipping.lastName.trim()}`;
    const customerEmail = user?.email ?? shipping.email.trim().toLowerCase();

    setProcessing(true);

    /* Simula el tiempo de respuesta del servidor */
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      /* Segunda verificación: el stock pudo cambiar mientras se llenaban los datos */
      const problem = checkStock(orderItems);

      if (problem) {
        setProcessing(false);
        setError(`${problem} Vuelve al carrito para ajustar las cantidades.`);
        return;
      }

      const order = createOrder({
        customerEmail,
        customerName,
        address,
        items: orderItems,
      });

      /* Resta las unidades vendidas y registra cada venta en el historial */
      deductStock(orderItems, order.number);

      setOrderNumber(order.number);
      clear();
      setProcessing(false);
      setStep(4);
    }, 1200);
  };

  const shippingInput = (
    field: keyof ShippingData,
    label: string,
    placeholder: string,
    options?: {
      maxLength?: number;
      inputMode?: "numeric" | "text" | "email" | "tel";
      required?: boolean;
      autoComplete?: string;
    }
  ) => {
    const id = `ship-${field}`;
    const message = fieldErrors[field];
    const required = options?.required ?? true;

    return (
      <div className="checkout-field">
        <label htmlFor={id}>
          {label}
          {required ? " (obligatorio)" : ""}
        </label>

        <input
          id={id}
          value={shipping[field]}
          placeholder={placeholder}
          maxLength={options?.maxLength}
          inputMode={options?.inputMode}
          autoComplete={options?.autoComplete}
          aria-required={required}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : undefined}
          onBlur={() => blurField(field)}
          onChange={(e) => {
            const value =
              options?.inputMode === "numeric" ||
              options?.inputMode === "tel"
                ? e.target.value.replace(/\D/g, "")
                : e.target.value;

            change(field, value);
          }}
        />

        {message && (
          <p id={`${id}-error`} className="field-error">
            {message}
          </p>
        )}
      </div>
    );
  };

  if (!items.length && step !== 4) {
    return (
      <section className="checkout-overlay">
        <div
          className="checkout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-empty-title"
        >
          <div className="checkout-modal-header">
            <h2 id="checkout-empty-title" ref={headingRef} tabIndex={-1}>
              Carrito vacío
            </h2>
            <button
              type="button"
              className="checkout-close"
              onClick={close}
              aria-label="Cerrar y volver al carrito"
            >
              ×
            </button>
          </div>

          <div className="checkout-modal-content">
            <p>Agrega productos para comenzar tu compra.</p>
            <button
              type="button"
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
          <h2 id="checkout-title" ref={headingRef} tabIndex={-1}>
            {step === 1 && "Resumen del carrito"}
            {step === 2 && "Datos de envío"}
            {step === 3 && "Método de pago"}
            {step === 4 && "Pedido confirmado"}
          </h2>

          {step !== 4 && (
            <button
              type="button"
              className="checkout-close"
              aria-label="Cerrar compra y volver al carrito"
              onClick={close}
              disabled={processing}
            >
              ×
            </button>
          )}
        </header>

        {/* INDICADOR DE PASOS */}

        <div
          className="checkout-steps"
          role="group"
          aria-label={`Paso ${step} de 4`}
        >
          {steps.map((name, index) => {
            const number = index + 1;
            const state =
              step === number
                ? "paso actual"
                : step > number
                ? "completado"
                : "pendiente";

            return (
              <div
                key={name}
                className={`checkout-step ${
                  step === number ? "is-current" : ""
                } ${step > number ? "is-complete" : ""}`}
                aria-current={step === number ? "step" : undefined}
              >
                <span className="checkout-step-circle" aria-hidden="true">
                  {step > number ? "✓" : number}
                </span>
                <small>
                  {name}
                  <span className="visually-hidden"> ({state})</span>
                </small>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="checkout-error" role="alert">
            {error}
          </div>
        )}

        <p className="visually-hidden" role="status" aria-live="polite">
          {processing ? "Procesando tu pedido, espera un momento." : ""}
        </p>

        {/* PASO 1: CARRITO */}

        {step === 1 && (
          <>
            <div className="checkout-modal-content">
              <p className="checkout-section-label">
                PRODUCTOS ({count} UNIDADES)
              </p>

              <div className="checkout-products">
                {items.map(({ product, qty }) => (
                  <article className="checkout-product" key={product.id}>
                    <div className="checkout-product-image">
                      <img
                        src={product.image}
                        alt={`Fotografía del producto ${product.name}`}
                      />
                    </div>

                    <div className="checkout-product-details">
                      <h3>{product.name}</h3>
                      <small>{product.brand}</small>

                      <strong>{money(product.price)} c/u</strong>

                      <div className="quantity-control">
                        <button
                          type="button"
                          disabled={qty <= 1}
                          aria-label={`Disminuir cantidad de ${product.name}`}
                          onClick={() => update(product.id, qty - 1)}
                        >
                          −
                        </button>

                        <output aria-live="polite">{qty}</output>

                        <button
                          type="button"
                          disabled={qty >= product.stock}
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          onClick={() => update(product.id, qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="checkout-product-end">
                      <button
                        type="button"
                        aria-label={`Eliminar ${product.name} del pedido`}
                        onClick={() => remove(product.id)}
                      >
                        ×
                      </button>

                      <strong>{money(product.price * qty)}</strong>
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
                  <span>Incluido en precios de demostración</span>
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
                Continuar a datos de envío
              </button>
            </footer>
          </>
        )}

        {/* PASO 2: ENVÍO */}

        {step === 2 && (
          <form onSubmit={nextShipping} noValidate>
            <div className="checkout-modal-content">
              <p className="checkout-section-label">TIPO DE ENTREGA</p>

              <div className="delivery-options">
                <button
                  type="button"
                  className={delivery === "domicilio" ? "is-selected" : ""}
                  onClick={() => setDelivery("domicilio")}
                  aria-pressed={delivery === "domicilio"}
                >
                  <strong>A domicilio</strong>
                  <small>Recibir en mi dirección</small>
                </button>

                <button
                  type="button"
                  className={delivery === "agencia" ? "is-selected" : ""}
                  onClick={() => setDelivery("agencia")}
                  aria-pressed={delivery === "agencia"}
                >
                  <strong>Recojo en agencia</strong>
                  <small>Punto de entrega</small>
                </button>
              </div>

              <p className="checkout-section-label">DATOS DEL DESTINATARIO</p>

              <div className="checkout-form-grid">
                {shippingInput("name", "Nombres", "Ingresa tus nombres", {
                  autoComplete: "given-name",
                })}

                {shippingInput("lastName", "Apellidos", "Ingresa tus apellidos", {
                  autoComplete: "family-name",
                })}

                {shippingInput("dni", "DNI", "8 dígitos", {
                  maxLength: 8,
                  inputMode: "numeric",
                })}

                {shippingInput("phone", "Teléfono", "9 dígitos", {
                  maxLength: 9,
                  inputMode: "tel",
                  autoComplete: "tel-national",
                })}

                <div className="checkout-wide">
                  {shippingInput(
                    "email",
                    "Correo electrónico",
                    "correo@ejemplo.com",
                    { inputMode: "email", autoComplete: "email" }
                  )}
                </div>
              </div>

              <p className="checkout-section-label">
                {delivery === "domicilio"
                  ? "DIRECCIÓN DE ENTREGA"
                  : "UBICACIÓN PARA RECOJO"}
              </p>

              <div className="checkout-form-grid">
                <div className="checkout-field">
                  <label htmlFor="ship-department">
                    Departamento (obligatorio)
                  </label>

                  <select
                    id="ship-department"
                    aria-required={true}
                    aria-invalid={fieldErrors.department ? true : undefined}
                    aria-describedby={
                      fieldErrors.department
                        ? "ship-department-error"
                        : undefined
                    }
                    value={shipping.department}
                    onBlur={() => blurField("department")}
                    onChange={(e) => {
                      const value = e.target.value;
                      setShipping((previous) => ({
                        ...previous,
                        department: value,
                        district: "",
                      }));
                      setError("");
                      setFieldErrors((previous) => ({
                        ...previous,
                        department: value
                          ? ""
                          : "Selecciona un departamento de la lista.",
                        district: "",
                      }));
                    }}
                  >
                    <option value="">Seleccionar departamento</option>

                    {Object.keys(districts).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.department && (
                    <p id="ship-department-error" className="field-error">
                      {fieldErrors.department}
                    </p>
                  )}
                </div>

                <div className="checkout-field">
                  <label htmlFor="ship-district">
                    Distrito (obligatorio)
                  </label>

                  <select
                    id="ship-district"
                    aria-required={true}
                    aria-invalid={fieldErrors.district ? true : undefined}
                    aria-describedby={
                      fieldErrors.district ? "ship-district-error" : undefined
                    }
                    value={shipping.district}
                    disabled={!shipping.department}
                    onBlur={() => blurField("district")}
                    onChange={(e) => change("district", e.target.value)}
                  >
                    <option value="">Seleccionar distrito</option>

                    {(districts[shipping.department] || []).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.district && (
                    <p id="ship-district-error" className="field-error">
                      {fieldErrors.district}
                    </p>
                  )}
                </div>

                {delivery === "domicilio" && (
                  <>
                    <div className="checkout-wide">
                      {shippingInput(
                        "address",
                        "Dirección exacta",
                        "Av. Principal 123, departamento 5",
                        { autoComplete: "street-address" }
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
                  Volver al carrito
                </button>

                <button type="submit" className="btn-primary">
                  Continuar a método de pago
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
                  className={payment === "entrega" ? "is-selected" : ""}
                  onClick={() => setPayment("entrega")}
                  aria-pressed={payment === "entrega"}
                >
                  <strong>Pago contra entrega</strong>
                  <small>Opción de demostración</small>
                </button>

                <button
                  type="button"
                  className={payment === "transferencia" ? "is-selected" : ""}
                  onClick={() => setPayment("transferencia")}
                  aria-pressed={payment === "transferencia"}
                >
                  <strong>Transferencia bancaria</strong>
                  <small>Simulación sin transferencia real</small>
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
                  onChange={(e) => {
                    setAccept(e.target.checked);
                    setError("");
                  }}
                />

                <span>
                  Confirmo que los datos de este pedido de demostración son
                  correctos.
                </span>
              </label>

              <p className="checkout-demo-note">
                No se realizará ningún cobro. El pedido se guardará solo en este
                navegador para que puedas ver su seguimiento en “Mis pedidos”.
              </p>
            </div>

            <footer className="checkout-modal-footer">
              <div className="checkout-footer-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={previous}
                  disabled={processing}
                >
                  Volver a datos de envío
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={confirmOrder}
                  disabled={processing}
                  aria-busy={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Procesando pedido...
                    </>
                  ) : (
                    "Confirmar pedido"
                  )}
                </button>
              </div>
            </footer>
          </>
        )}

        {/* PASO 4: CONFIRMACIÓN */}

        {step === 4 && (
          <div className="checkout-success">
            <div className="checkout-success-symbol" aria-hidden="true">
              ✓
            </div>

            <h2>Pedido de prueba confirmado</h2>

            <p>Has completado correctamente el flujo de compra de TechStore.</p>

            <div className="checkout-success-number">
              <span>Número de pedido</span>
              <strong>{orderNumber}</strong>
            </div>

            <p>
              No se procesó ningún pago real. Puedes seguir las fases de tu
              pedido en “Mis pedidos”.
            </p>

            <button
              type="button"
              className="btn-primary full"
              onClick={() => navigate("/mis-pedidos")}
            >
              Ver mis pedidos
            </button>

            <button
              type="button"
              className="btn-secondary full"
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