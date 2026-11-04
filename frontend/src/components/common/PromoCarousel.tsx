import { useEffect, useState, type KeyboardEvent } from "react";

interface Promotion {
  id: number;
  image: string;
  alt: string;
}

/* IMPORTANTE: reemplaza cada alt por el texto real que aparece en el banner */
const promotions: Promotion[] = [
  {
    id: 1,
    image: "/images/promociones/promo1.jpg",
    alt: "Envío gratis en compras mayores a S/ 500. Despacho rápido y seguro a todo el Perú.",
  },
  {
    id: 2,
    image: "/images/promociones/promo2.jpg",
    alt: "Garantía oficial: 100% productos originales con respaldo directo de fábrica y soporte técnico autorizado.",
  },
  {
    id: 3,
    image: "/images/promociones/promo3.jpg",
    alt: "Tercera promoción de TechStore. Describe aquí el texto del banner.",
  },
  {
    id: 4,
    image: "/images/promociones/promo4.jpg",
    alt: "Cuarta promoción de TechStore. Describe aquí el texto del banner.",
  },
];

const INTERVAL_MS = 6000;

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const total = promotions.length;
  const autoplay = !userPaused && !hoverPaused && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!autoplay) return;

    const interval = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % total);
    }, INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [autoplay, total]);

  const nextSlide = () => setCurrent((previous) => (previous + 1) % total);

  const prevSlide = () =>
    setCurrent((previous) => (previous - 1 + total) % total);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    }
  };

  return (
    <section
      className="promo-carousel-wrap"
      aria-label="Promociones e información de TechStore"
      aria-roledescription="carrusel"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHoverPaused(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <div className="promo-carousel">
        <div
          className="promo-track"
          aria-live={autoplay ? "off" : "polite"}
          aria-atomic="false"
        >
          {promotions.map((promotion, index) => (
            <div
              key={promotion.id}
              className={`promo-slide ${index === current ? "active" : ""}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${total}`}
              aria-hidden={index !== current}
            >
              <img
                src={promotion.image}
                alt={promotion.alt}
                className="promo-image"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="promo-arrow promo-prev"
          onClick={prevSlide}
          aria-label="Promoción anterior"
        >
          <span aria-hidden="true">&#10094;</span>
        </button>

        <button
          type="button"
          className="promo-arrow promo-next"
          onClick={nextSlide}
          aria-label="Siguiente promoción"
        >
          <span aria-hidden="true">&#10095;</span>
        </button>
      </div>

      <div className="promo-controls">
        {!reducedMotion && (
          <button
            type="button"
            className="btn-secondary promo-toggle"
            onClick={() => setUserPaused((value) => !value)}
            aria-pressed={userPaused}
          >
            {userPaused ? "Reproducir animación" : "Pausar animación"}
          </button>
        )}

        <div className="promo-dots" role="group" aria-label="Elegir promoción">
          {promotions.map((promotion, index) => (
            <button
              key={promotion.id}
              type="button"
              className={`promo-dot ${current === index ? "active" : ""}`}
              onClick={() => setCurrent(index)}
              aria-label={`Ir a la promoción ${index + 1} de ${total}`}
              aria-current={current === index ? "true" : undefined}
            />
          ))}
        </div>

        <span className="promo-counter">
          Promoción {current + 1} de {total}
        </span>
      </div>
    </section>
  );
}