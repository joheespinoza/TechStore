
import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    from?: string;
    message?: string;
  } | null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completa correo y contraseña.");
      return;
    }

    const issue = login(email, password);

    if (issue) {
      setError(issue);
      return;
    }

    navigate(state?.from || "/productos", {
      replace: true,
    });
  }

  return (
    <section className="auth-container">
      <form className="auth-card" onSubmit={submit}>
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

        <h1>Iniciar Sesión</h1>
        <p>Ingresa a tu cuenta de TechStore</p>

        {state?.message && (
          <p className="feedback" role="status">
            {state.message}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="email">
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@gmail.com"
        />

        <label htmlFor="password">
          Contraseña
        </label>

        <div className="password-field">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={
              show
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <button
          className="btn-primary full"
          type="submit"
        >
          Entrar a la tienda
        </button>

        <p>
          ¿No tienes cuenta?{" "}
          <Link to="/registro">
            Regístrate aquí
          </Link>
        </p>

        <small>
          Demo: registra una cuenta para iniciar sesión.
          No uses contraseñas reales.
        </small>
      </form>
    </section>
  );
}
