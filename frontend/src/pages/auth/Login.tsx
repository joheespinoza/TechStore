import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Errors = { email?: string; password?: string };

function validateEmail(value: string): string {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? ""
    : "Ingresa un correo electrónico válido como usuario@dominio.com.";
}

function validatePassword(value: string): string {
  return value ? "" : "Escribe tu contraseña para continuar.";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState("");

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    from?: string;
    message?: string;
  } | null;

  useEffect(() => {
    if (!user) return;

    const from = state?.from;
    const isAdminPath = from?.startsWith("/admin");

    if (user.role === "ADMIN") {
      navigate(isAdminPath && from ? from : "/admin/pedidos", {
        replace: true,
      });
    } else {
      navigate(from && !isAdminPath ? from : "/productos", {
        replace: true,
      });
    }
  }, [user, state, navigate]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found: Errors = {};
    const emailIssue = validateEmail(email);
    const passwordIssue = validatePassword(password);

    if (emailIssue) found.email = emailIssue;
    if (passwordIssue) found.password = passwordIssue;

    setErrors(found);

    if (found.email || found.password) {
      setSummary(
        "Revisa los campos marcados: hay datos que debes corregir antes de entrar."
      );
      document
        .getElementById(found.email ? "email" : "password")
        ?.focus();
      return;
    }

    setSummary("");

    const issue = login(email, password);

    if (issue) {
      setSummary(
        `${issue} Revisa tus datos o crea una cuenta si aún no tienes una.`
      );
      document.getElementById("email")?.focus();
    }
  }

  return (
    <section className="auth-container">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Link className="back-link" to="/">
          ← Volver al inicio
        </Link>

        <div className="auth-logo-container">
          <img
            src="/images/branding/logo.jpg"
            alt="Logo TechStore"
            className="auth-logo-img"
          />
        </div>

        <h1>Iniciar sesión</h1>
        <p>Ingresa a tu cuenta de TechStore.</p>

        {state?.message && (
          <p className="feedback" role="status">
            {state.message}
          </p>
        )}

        {summary && (
          <p className="form-error" role="alert">
            {summary}
          </p>
        )}

        <div className="form-field">
          <label htmlFor="email">Correo electrónico (obligatorio)</label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@gmail.com"
            value={email}
            aria-required={true}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            onBlur={() =>
              setErrors((previous) => ({
                ...previous,
                email: validateEmail(email),
              }))
            }
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
              setSummary("");

              if (errors.email) {
                setErrors((previous) => ({
                  ...previous,
                  email: validateEmail(value),
                }));
              }
            }}
          />

          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Contraseña (obligatorio)</label>

          <div className="password-field">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              aria-required={true}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
              onBlur={() =>
                setErrors((previous) => ({
                  ...previous,
                  password: validatePassword(password),
                }))
              }
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                setSummary("");

                if (errors.password) {
                  setErrors((previous) => ({
                    ...previous,
                    password: validatePassword(value),
                  }));
                }
              }}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {errors.password && (
            <p id="password-error" className="field-error">
              {errors.password}
            </p>
          )}
        </div>

        <button className="btn-primary full" type="submit">
          Entrar a la tienda
        </button>

        <p>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>

        <small>
          Demo: registra una cuenta para iniciar sesión. No uses contraseñas
          reales.
        </small>
      </form>
    </section>
  );
}