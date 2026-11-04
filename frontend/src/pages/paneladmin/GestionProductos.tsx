import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Modal from "../../components/common/Modal";
import KpiGrid, { type Kpi } from "../../components/common/KpiGrid";
import {
  CATEGORY_LIST,
  money,
  nextProductId,
  productCode,
  products,
  saveCatalog,
  type Category,
  type Product,
} from "../../data/products";

const PAGE_SIZE = 6;
const LOW_STOCK = 5;
const DEFAULT_IMAGE = "/images/products/sin-imagen.png";

type StockKey = "ok" | "low" | "out";

function stockState(stock: number): { key: StockKey; label: string } {
  if (stock <= 0) return { key: "out", label: "Agotado" };
  if (stock <= LOW_STOCK) return { key: "low", label: "Stock bajo" };
  return { key: "ok", label: "Disponible" };
}

type FormState = {
  name: string;
  brand: string;
  category: Category | "";
  price: string;
  originalPrice: string;
  stock: string;
  description: string;
  image: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; product: Product }
  | null;

const EMPTY: FormState = {
  name: "",
  brand: "",
  category: "",
  price: "",
  originalPrice: "",
  stock: "",
  description: "",
  image: "",
};

function validate(field: keyof FormState, form: FormState): string {
  const value = form[field].trim();

  switch (field) {
    case "name":
      return value.length < 3
        ? "Ingresa un nombre de al menos 3 caracteres, por ejemplo Logitech MX Keys."
        : "";
    case "brand":
      return value.length < 2
        ? "Ingresa la marca del producto, por ejemplo Logitech."
        : "";
    case "category":
      return value ? "" : "Selecciona una categoría de la lista.";
    case "price": {
      const n = Number(value);
      return value && n > 0
        ? ""
        : "Ingresa un precio mayor que 0, usando punto decimal, por ejemplo 1299.90.";
    }
    case "originalPrice": {
      if (!value) return "";
      const n = Number(value);
      if (!(n > 0)) {
        return "Ingresa un precio mayor que 0 o deja el campo vacío.";
      }
      const price = Number(form.price);
      return price > 0 && n < price
        ? "El precio original no puede ser menor que el precio de venta."
        : "";
    }
    case "stock":
      return /^\d+$/.test(value)
        ? ""
        : "Ingresa el stock como número entero desde 0, por ejemplo 15.";
    case "description":
      return value.length < 10
        ? "Escribe una descripción de al menos 10 caracteres."
        : "";
    case "image":
      return !value || value.startsWith("/") || /^https?:\/\//.test(value)
        ? ""
        : "Ingresa una ruta que empiece con / o una dirección que empiece con https://.";
    default:
      return "";
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function Field({
  id,
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "checkout-field checkout-wide" : "checkout-field"}>
      <label htmlFor={id}>
        {label}
        {required ? " (obligatorio)" : " (opcional)"}
      </label>

      {children}

      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function GestionProductos() {
  const [list, setList] = useState<Product[]>(() => [...products]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | StockKey>("ALL");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [summary, setSummary] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return list.filter(
      (p) =>
        (category === "ALL" || p.category === category) &&
        (stockFilter === "ALL" || stockState(p.stock).key === stockFilter) &&
        (!q ||
          `${p.name} ${p.brand} ${productCode(p)}`.toLowerCase().includes(q))
    );
  }, [list, query, category, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const units = list.reduce((sum, p) => sum + p.stock, 0);
  const value = list.reduce((sum, p) => sum + p.price * p.stock, 0);
  const low = list.filter((p) => stockState(p.stock).key === "low").length;
  const out = list.filter((p) => stockState(p.stock).key === "out").length;

  const kpis: Kpi[] = [
    {
      label: "Productos registrados",
      value: String(list.length),
      note: `${new Set(list.map((p) => p.category)).size} categorías`,
    },
    {
      label: "Unidades en inventario",
      value: String(units),
    },
    {
      label: "Valor del inventario",
      value: money(value),
      note: "Precio de venta por stock",
    },
    {
      label: "Stock bajo",
      value: String(low),
      note: low ? "Requieren reposición" : "Sin alertas",
      tone: low ? "warning" : undefined,
    },
    {
      label: "Agotados",
      value: String(out),
      note: out ? "No se pueden vender" : "Sin alertas",
      tone: out ? "danger" : undefined,
    },
  ];

  const codePreview =
    dialog?.mode === "edit"
      ? productCode(dialog.product)
      : form.category
      ? productCode({ id: nextProductId(), category: form.category } as Product)
      : "";

  function openCreate() {
    setForm(EMPTY);
    setErrors({});
    setSummary("");
    setDialog({ mode: "create" });
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      stock: String(product.stock),
      description: product.description,
      image: product.image,
    });
    setErrors({});
    setSummary("");
    setDialog({ mode: "edit", product });
  }

  function bind(field: keyof FormState, hasHint = false) {
    const describedBy = [
      hasHint ? `prod-${field}-hint` : "",
      errors[field] ? `prod-${field}-error` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id: `prod-${field}`,
      value: form[field],
      "aria-invalid": errors[field] ? (true as const) : undefined,
      "aria-describedby": describedBy || undefined,
      onBlur: () =>
        setErrors((prev) => ({ ...prev, [field]: validate(field, form) })),
      onChange: (
        e: ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => {
        const next = e.target.value;
        setForm((prev) => ({ ...prev, [field]: next }));

        if (errors[field]) {
          setErrors((prev) => ({
            ...prev,
            [field]: validate(field, { ...form, [field]: next }),
          }));
        }
      },
    };
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fields = Object.keys(EMPTY) as (keyof FormState)[];
    const found: FormErrors = {};

    for (const field of fields) {
      const issue = validate(field, form);
      if (issue) found[field] = issue;
    }

    setErrors(found);

    const first = fields.find((f) => found[f]);

    if (first) {
      setSummary(
        "Revisa los campos marcados: hay datos que debes corregir antes de guardar."
      );
      document.getElementById(`prod-${first}`)?.focus();
      return;
    }

    if (!dialog) return;

    const price = round2(Number(form.price));
    const data = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category as Category,
      price,
      originalPrice: form.originalPrice.trim()
        ? round2(Number(form.originalPrice))
        : price,
      stock: Number(form.stock),
      description: form.description.trim(),
      image: form.image.trim() || DEFAULT_IMAGE,
    };

    let nextList: Product[];
    let note: string;

    if (dialog.mode === "create") {
      const created: Product = {
        ...data,
        id: nextProductId(),
        rating: 0,
        reviews: 0,
      };
      nextList = [...list, created];
      note = `Producto “${created.name}” creado con el código ${productCode(
        created
      )}.`;
    } else {
      const id = dialog.product.id;
      nextList = list.map((p) =>
        p.id === id ? { ...p, ...data, category: p.category } : p
      );
      note = `Producto “${data.name}” actualizado.`;
    }

    saveCatalog(nextList);
    setList(nextList);
    setMessage(note);
    setDialog(null);
  }

  function confirmDelete() {
    if (!deleting) return;

    const nextList = list.filter((p) => p.id !== deleting.id);
    saveCatalog(nextList);
    setList(nextList);
    setMessage(`Producto “${deleting.name}” eliminado del catálogo.`);
    setDeleting(null);
  }

  return (
    <section aria-labelledby="admin-products-title">
      <div className="admin-page-heading">
        <div>
          <h1 id="admin-products-title">Gestión de productos</h1>
          <p>Registra, edita y controla el inventario de la tienda.</p>
        </div>

        <button type="button" className="btn-primary" onClick={openCreate}>
          Nuevo producto
        </button>
      </div>

      <KpiGrid items={kpis} label="Indicadores de inventario" />

      <p className="orders-live" role="status" aria-live="polite">
        {message}
      </p>

      <div className="admin-toolbar">
        <div className="admin-filter">
          <label htmlFor="product-search">Buscar por nombre, marca o código</label>
          <input
            id="product-search"
            type="search"
            placeholder="Ejemplo: Logitech o LAP-0001"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-filter">
          <label htmlFor="product-category">Categoría</label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as "ALL" | Category);
              setPage(1);
            }}
          >
            <option value="ALL">Todas las categorías</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filter">
          <label htmlFor="product-stock">Estado del stock</label>
          <select
            id="product-stock"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as "ALL" | StockKey);
              setPage(1);
            }}
          >
            <option value="ALL">Todos</option>
            <option value="ok">Disponible</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotado</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption>
            Lista de productos ({filtered.length}{" "}
            {filtered.length === 1 ? "resultado" : "resultados"})
          </caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col" className="num">
                Precio
              </th>
              <th scope="col" className="num">
                Stock
              </th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  No hay productos con estos filtros. Prueba otra búsqueda o
                  categoría.
                </td>
              </tr>
            ) : (
              visible.map((p) => {
                const state = stockState(p.stock);

                return (
                  <tr key={p.id}>
                    <th scope="row">{productCode(p)}</th>
                    <td>
                      <div className="product-cell">
                        <span className="product-thumb">
                          <img
                            src={p.image}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </span>
                        <span>
                          {p.name}
                          <small className="admin-table-sub">{p.brand}</small>
                        </span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="num">{money(p.price)}</td>
                    <td className="num">{p.stock}</td>
                    <td>
                      <span className={`stock-badge is-${state.key}`}>
                        {state.label}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          aria-label={`Editar ${p.name}`}
                          onClick={() => openEdit(p)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-danger-outline"
                          aria-label={`Eliminar ${p.name}`}
                          onClick={() => setDeleting(p)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <nav className="admin-pagination" aria-label="Paginación de productos">
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

      {dialog && (
        <Modal
          title={
            dialog.mode === "create"
              ? "Nuevo producto"
              : `Editar ${dialog.product.name}`
          }
          description="Los campos se validan al salir de cada uno. El código se genera automáticamente."
          onClose={() => setDialog(null)}
          footer={
            <div className="checkout-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDialog(null)}
              >
                Cancelar
              </button>
              <button type="submit" form="product-form" className="btn-primary">
                Guardar producto
              </button>
            </div>
          }
        >
          {summary && (
            <p className="form-error" role="alert">
              {summary}
            </p>
          )}

          <form id="product-form" noValidate onSubmit={submit}>
            <div className="checkout-form-grid">
              <div className="checkout-field checkout-wide">
                <label htmlFor="prod-code">Código del producto (automático)</label>
                <input
                  id="prod-code"
                  readOnly
                  value={codePreview || "Se genera al elegir la categoría"}
                />
              </div>

              <Field
                id="prod-name"
                label="Nombre"
                required
                error={errors.name}
                wide
              >
                <input
                  {...bind("name")}
                  type="text"
                  maxLength={80}
                  placeholder="Ejemplo: Logitech MX Keys Advanced"
                />
              </Field>

              <Field id="prod-brand" label="Marca" required error={errors.brand}>
                <input {...bind("brand")} type="text" maxLength={40} />
              </Field>

              <Field
                id="prod-category"
                label="Categoría"
                required
                error={errors.category}
                hint={
                  dialog.mode === "edit"
                    ? "No se puede cambiar: forma parte del código."
                    : undefined
                }
              >
                <select
                  {...bind("category", dialog.mode === "edit")}
                  disabled={dialog.mode === "edit"}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="prod-price"
                label="Precio de venta (S/)"
                required
                error={errors.price}
              >
                <input {...bind("price")} type="text" inputMode="decimal" />
              </Field>

              <Field
                id="prod-originalPrice"
                label="Precio original (S/)"
                hint="Si lo dejas vacío, se usa el precio de venta."
                error={errors.originalPrice}
              >
                <input
                  {...bind("originalPrice", true)}
                  type="text"
                  inputMode="decimal"
                />
              </Field>

              <Field id="prod-stock" label="Stock" required error={errors.stock}>
                <input {...bind("stock")} type="text" inputMode="numeric" />
              </Field>

              <Field
                id="prod-image"
                label="Ruta de la imagen"
                hint="Ejemplo: /images/products/teclado.jpg"
                error={errors.image}
              >
                <input {...bind("image", true)} type="text" />
              </Field>

              <Field
                id="prod-description"
                label="Descripción"
                required
                hint="Entre 10 y 160 caracteres."
                error={errors.description}
                wide
              >
                <textarea {...bind("description", true)} rows={3} maxLength={160} />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal
          title={`Eliminar ${deleting.name}`}
          description="El producto dejará de aparecer en el catálogo y en los carritos. Los pedidos ya realizados conservan su registro."
          onClose={() => setDeleting(null)}
          footer={
            <div className="checkout-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleting(null)}
              >
                Mantener producto
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Sí, eliminar producto
              </button>
            </div>
          }
        >
          <p>Código: {productCode(deleting)}</p>
        </Modal>
      )}
    </section>
  );
}