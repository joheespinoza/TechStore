import { ORDER_FLOW, STATUS_LABEL, type OrderStatus } from "../../data/orders";

export default function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return <p className="order-cancelled">Este pedido fue cancelado.</p>;
  }

  const current = ORDER_FLOW.indexOf(status);

  return (
    <ol className="order-tracker" aria-label="Fases del pedido">
      {ORDER_FLOW.map((step, index) => {
        const state =
          index < current ? "complete" : index === current ? "current" : "pending";

        return (
          <li
            key={step}
            className={`order-tracker-step is-${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="order-tracker-circle" aria-hidden="true">
              {state === "complete" ? "✓" : index + 1}
            </span>
            <span className="order-tracker-label">
              {STATUS_LABEL[step]}
              <span className="visually-hidden">
                {state === "complete"
                  ? " (completado)"
                  : state === "current"
                  ? " (fase actual)"
                  : " (pendiente)"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}