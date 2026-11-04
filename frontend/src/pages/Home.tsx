import { Link } from "react-router-dom";
import { products } from "../data/products";

const categories = [
  {
    code: "LD",
    title: "Laptops & Desktops",
    description:
      "Ultrabooks, laptops gamer y equipos de alto rendimiento para estudio, trabajo y entretenimiento.",
    category: "Laptops",
  },
  {
    code: "CG",
    title: "Componentes & GPUs",
    description:
      "Procesadores, memorias y componentes para potenciar al máximo tu setup.",
    category: "Desktops",
  },
  {
    code: "MA",
    title: "Monitores & Audio",
    description:
      "Pantallas gaming, monitores profesionales y soluciones multimedia.",
    category: "Monitores",
  },
  {
    code: "AP",
    title: "Accesorios & Periféricos",
    description:
      "Mouse, teclados y accesorios tecnológicos para completar tu espacio.",
    category: "Mouse",
  },
];

export default function Home() {
  return (
    <div className="home">
      {/* HERO PRINCIPAL */}
      <section className="hero-split" aria-labelledby="hero-title">
        <div className="hero-wrapper">
          <div className="hero-copy">
            <span className="hero-badge">
              <span aria-hidden="true">● </span>
              TIENDA ONLINE DE TECNOLOGÍA Y HARDWARE
            </span>

            <h1 id="hero-title" className="hero-title">
              Equipa tu setup con <span>tecnología</span> de alto rendimiento
            </h1>

            <p className="hero-description">
              Laptops gamer, componentes de PC, monitores y periféricos con
              garantía, promociones exclusivas y envíos a todo el Perú.
            </p>

            <div className="hero-highlight-box">
              <div className="hero-highlight-item">
                <strong>Ofertas exclusivas</strong>
                <span>Descuentos en productos seleccionados</span>
              </div>

              <div className="hero-highlight-item">
                <strong>Compra clara</strong>
                <span>Navega, elige y compra paso a paso</span>
              </div>
            </div>

            <div className="hero-buttons">
              <Link className="btn-primary" to="/productos">
                Explorar catálogo
              </Link>

              <Link className="btn-secondary" to="/productos">
                Ver ofertas
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="/images/banners/hero-techstore.png"
                alt="Promociones tecnológicas de TechStore"
                className="hero-image"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="stats" aria-label="Beneficios de TechStore">
        <div>
          <p className="stat-value">{products.length}</p>
          <p className="stat-label">Productos en catálogo</p>
        </div>

        <div>
          <p className="stat-value">S/ 500</p>
          <p className="stat-label">Envío gratis desde este monto</p>
        </div>

        <div>
          <p className="stat-value">Todo el Perú</p>
          <p className="stat-label">Cobertura de envío</p>
        </div>

        <div>
          <p className="stat-value">4 pasos</p>
          <p className="stat-label">Compra simple y guiada</p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="categories" aria-labelledby="categories-title">
        <h2 id="categories-title">Todo para tu setup</h2>
        <p>
          Explora nuestras categorías y encuentra el equipo ideal para tus
          necesidades.
        </p>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              className="category-card"
              to={`/productos?categoria=${encodeURIComponent(
                category.category
              )}`}
              aria-label={`Explorar ${category.title}`}
              key={category.title}
            >
              <span className="category-icon" aria-hidden="true">
                {category.code}
              </span>

              <h3>{category.title}</h3>

              <p>{category.description}</p>

              <span className="category-link" aria-hidden="true">
                Explorar productos →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}