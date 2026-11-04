import { useMemo, useState } from "react";
import {
  useSearchParams,
  Link,
} from "react-router-dom";

import {
  getDiscountPercentage,
  money,
  products,
} from "../../data/products";
import PromoCarousel from "../../components/common/PromoCarousel";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const categories = [
  "Todas",
  "Laptops",
  "Desktops",
  "Monitores",
  "Teclados",
  "Mouse",
  "Auriculares",
  "Almacenamiento",
  "Redes",
  "Impresoras",
  "Accesorios",
];

export default function Productos() {
  const [params, setParams] = useSearchParams();

  const category = params.get("categoria") || "Todas";

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevancia");
  const [brand, setBrand] = useState("Todas");
  const [priceMax, setPriceMax] = useState("");
  const [onlyStock, setOnlyStock] = useState(false);
  const [notice, setNotice] = useState("");

  const { add, items } = useCart();
  const { user } = useAuth();

  const brands = [
    "Todas",
    ...new Set(products.map((p) => p.brand)),
  ];

  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === "Todas" ||
              p.category === category) &&
            (brand === "Todas" ||
              p.brand === brand) &&
            `${p.name} ${p.description} ${p.brand}`
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (!priceMax ||
              p.price <= Number(priceMax)) &&
            (!onlyStock || p.stock > 0)
        )
        .sort((a, b) => {
          if (sort === "menor")
            return a.price - b.price;

          if (sort === "mayor")
            return b.price - a.price;

          if (sort === "nombre")
            return a.name.localeCompare(b.name);

          return a.id - b.id;
        }),
    [
      query,
      category,
      brand,
      priceMax,
      onlyStock,
      sort,
    ]
  );

  function reset() {
    setQuery("");
    setBrand("Todas");
    setPriceMax("");
    setOnlyStock(false);
    setSort("relevancia");
    setParams({});
    setNotice("Filtros limpiados.");
  }

  return (
    <section className="products-page">
      <PromoCarousel />

      <div className="product-toolbar">
        <input
          aria-label="Buscar productos"
          type="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          aria-label="Ordenar productos"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="relevancia">Relevancia</option>
          <option value="menor">
            Precio: menor a mayor
          </option>
          <option value="mayor">
            Precio: mayor a menor
          </option>
          <option value="nombre">
            Nombre A-Z
          </option>
        </select>

        <small role="status" aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1 ? "producto" : "productos"}
        </small>
      </div>

      <div className="catalog-layout">
        <aside className="filters" aria-label="Filtros de productos">
          <h2>CATEGORÍAS</h2>

          {categories.map((c) => (
            <button
              type="button"
              key={c}
              className={
                c === category ? "active" : ""
              }
              aria-pressed={c === category}
              onClick={() =>
                setParams(
                  c === "Todas"
                    ? {}
                    : { categoria: c }
                )
              }
            >
              {c}

              <span>
                {c === "Todas"
                  ? products.length
                  : products.filter(
                      (p) => p.category === c
                    ).length}
              </span>
            </button>
          ))}

          <div className="advanced-filters">
            <label htmlFor="filter-brand">
              Marca
            </label>
            <select
              id="filter-brand"
              value={brand}
              onChange={(e) =>
                setBrand(e.target.value)
              }
            >
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <label htmlFor="filter-price">
              Precio máximo (S/)
            </label>
            <input
              id="filter-price"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="Sin límite"
              value={priceMax}
              onChange={(e) =>
                setPriceMax(e.target.value)
              }
            />

            <label
              className="checkbox-label"
              htmlFor="filter-stock"
            >
              <input
                id="filter-stock"
                type="checkbox"
                checked={onlyStock}
                onChange={(e) =>
                  setOnlyStock(e.target.checked)
                }
              />
              Solo disponibles
            </label>

            <button
              type="button"
              className="btn-secondary"
              onClick={reset}
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        <div>
          <p className="feedback" role="status" aria-live="polite">
            {notice ||
              "Selecciona un producto y agrégalo al carrito."}
          </p>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <h2>No encontramos productos</h2>

              <p>
                Prueba otra marca, categoría o rango
                de precio.
              </p>

              <button
                type="button"
                className="btn-primary"
                onClick={reset}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((p) => {
                const qty =
                  items.find(
                    (x) => x.product.id === p.id
                  )?.qty || 0;

                const discount = getDiscountPercentage(p);
                const soldOut = p.stock <= 0;
                const lowStock = !soldOut && p.stock <= 5;
                const maxReached = !soldOut && qty >= p.stock;

                return (
                  <article
                    className="product-card"
                    key={p.id}
                  >
                    <div className="product-image">
                      <img
                        src={p.image}
                        alt={`Fotografía del producto ${p.name}`}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";

                          img.parentElement?.classList.add("image-missing");
                        }}
                      />

                      <div className="image-placeholder">
                        <small>Imagen no disponible</small>
                      </div>

                      {discount > 0 && (
                        <span className="discount">
                          -{discount}%
                          <span className="visually-hidden">
                            {" "}de descuento
                          </span>
                        </span>
                      )}

                      {lowStock && (
                        <span className="limited">
                          Últimas unidades
                        </span>
                      )}
                    </div>

                    <div className="product-info">
                      <small>
                        {p.brand} · {p.category}
                      </small>

                      <h3>{p.name}</h3>
                      <p>{p.description}</p>

                      <div className="rating">
                        {p.reviews > 0 ? (
                          <>
                            <span aria-hidden="true">
                              {"★".repeat(Math.round(p.rating))}
                              {"☆".repeat(5 - Math.round(p.rating))}
                            </span>{" "}
                            <span className="visually-hidden">
                              Calificación {p.rating} de 5.
                            </span>
                            <small>({p.reviews} reseñas)</small>
                          </>
                        ) : (
                          <small>Sin reseñas</small>
                        )}
                      </div>

                      <div className="price">
                        <strong>
                          {money(p.price)}
                        </strong>

                        {p.originalPrice > p.price && (
                          <del>
                            <span className="visually-hidden">
                              Precio anterior:{" "}
                            </span>
                            {money(p.originalPrice)}
                          </del>
                        )}
                      </div>

                      <div
                        className={
                          soldOut || lowStock
                            ? "stock low"
                            : "stock"
                        }
                      >
                        {soldOut
                          ? "Agotado"
                          : lowStock
                          ? `Stock limitado (${p.stock})`
                          : `En stock (${p.stock})`}
                      </div>

                      <button
                        className="btn-primary full"
                        type="button"
                        disabled={soldOut || maxReached}
                        aria-label={
                          soldOut
                            ? `${p.name}: producto agotado`
                            : maxReached
                            ? `${p.name}: ya agregaste el máximo disponible`
                            : `Agregar ${p.name} al carrito`
                        }
                        onClick={() => {
                          add(p);
                          setNotice(
                            `${p.name} agregado al carrito.`
                          );
                        }}
                      >
                        {soldOut
                          ? "Producto agotado"
                          : maxReached
                          ? "Máximo disponible"
                          : "Agregar al carrito"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!user && (
            <p className="login-hint">
              Puedes explorar y agregar productos sin
              iniciar sesión. Para finalizar tu compra,{" "}
              <Link to="/login">
                inicia sesión
              </Link>.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}