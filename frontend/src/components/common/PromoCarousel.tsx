
import { useEffect, useState } from "react";

interface Promotion {
  id: number;
  image: string;
  alt: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    image: "/images/promociones/promo1.jpg",
    alt: "Primera promoción de TechStore",
  },
  {
    id: 2,
    image: "/images/promociones/promo2.jpg",
    alt: "Segunda promoción de TechStore",
  },
  {
    id: 3,
    image: "/images/promociones/promo3.jpg",
    alt: "Tercera promoción de TechStore",
  },
  {
    id: 4,
    image: "/images/promociones/promo4.jpg",
    alt: "Cuarta promoción de TechStore",
  },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const interval = window.setInterval(() => {
      setCurrent((previous) =>
        (previous + 1) % promotions.length
      );
    }, 3000);

    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  const nextSlide = () => {
    setCurrent((previous) =>
      (previous + 1) % promotions.length
    );
  };

  const prevSlide = () => {
    setCurrent((previous) =>
      (previous - 1 + promotions.length) %
      promotions.length
    );
  };

  return (
    <section
      className="promo-carousel"
      aria-label="Promociones e información de TechStore"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setPaused(false);
        }
      }}
    >
      <div className="promo-track">
        {promotions.map((promotion, index) => (
          <div
            key={promotion.id}
            className={`promo-slide ${
              index === current ? "active" : ""
            }`}
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
        &#10094;
      </button>

      <button
        type="button"
        className="promo-arrow promo-next"
        onClick={nextSlide}
        aria-label="Siguiente promoción"
      >
        &#10095;
      </button>

      <div className="promo-indicators">
        {promotions.map((promotion, index) => (
          <button
            key={promotion.id}
            type="button"
            className={`promo-dot ${
              current === index ? "active" : ""
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`Mostrar promoción ${index + 1}`}
            aria-current={current === index ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
