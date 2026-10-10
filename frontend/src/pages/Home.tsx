import { Link } from "react-router-dom";

export default function Home() {
  const categories = [
    {
      icon: "💻",
      title: "Laptops & Desktops",
      description:
        "Ultrabooks, laptops gamer y equipos de alto rendimiento para estudio, trabajo y entretenimiento.",
      category: "Laptops",
    },
    {
      icon: "⚡",
      title: "Componentes & GPUs",
      description:
        "Procesadores, memorias y componentes para potenciar al máximo tu setup.",
      category: "Desktops",
    },
    {
      icon: "🖥️",
      title: "Monitores & Audio",
      description:
        "Pantallas gaming, monitores profesionales y soluciones multimedia.",
      category: "Monitores",
    },
    {
      icon: "🖱️",
      title: "Accesorios & Periféricos",
      description:
        "Mouse, teclados y accesorios tecnológicos para completar tu espacio.",
      category: "Mouse",
    },
  ];

  return (
    <div className="home">
      {/* HERO PRINCIPAL */}
      <section className="hero hero-split">
        <div className="hero-wrapper">
          {/* COLUMNA IZQUIERDA */}
          <div className="hero-copy">
            <span className="hero-badge">
              ● TIENDA ONLINE DE TECNOLOGÍA & HARDWARE
            </span>

            <h1 className="hero-title">
              Equipa tu setup con{" "}
              <span>tecnología</span>
              <br />
              de alto rendimiento
            </h1>

            <p className="hero-description">
              Laptops gamer, componentes de PC, monitores y
              periféricos con garantía, promociones exclusivas
              y envíos a todo el Perú.
            </p>

            <div className="hero-highlight-box">
              <div className="hero-highlight-item">
                <strong>Ofertas exclusivas</strong>
                <span>
                  Descuentos en productos seleccionados
                </span>
              </div>

              <div className="hero-highlight-item">
                <strong>Compra segura</strong>
                <span>
                  Navega, elige y compra con claridad
                </span>
              </div>
            </div>

            <div className="hero-buttons">
              <Link
                className="btn-primary"
                to="/productos"
              >
                Explorar catálogo
              </Link>

              <Link
                className="btn-secondary"
                to="/productos"
              >
                Ver ofertas
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
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
      <section
        className="stats"
        aria-label="Beneficios de TechStore"
      >
        <div>
          <h2>+1,500</h2>
          <p>Productos en catálogo</p>
        </div>

        <div>
          <h2>100%</h2>
          <p>Garantía referencial</p>
        </div>

        <div>
          <h2>24–48h</h2>
          <p>Envíos a nivel nacional</p>
        </div>

        <div>
          <h2>Pago seguro</h2>
          <p>Proceso de compra simple</p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="categories">
        <h2>Todo para tu setup</h2>
        <p>
          Explora nuestras categorías y encuentra
          el equipo ideal para tus necesidades.
        </p>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              className="category-card"
              to={`/productos?categoria=${encodeURIComponent(
                category.category
              )}`}
              key={category.title}
            >
              <span aria-hidden="true">
                {category.icon}
              </span>

              <h3>{category.title}</h3>

              <p>{category.description}</p>

              <span className="category-link">
                Explorar productos →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}