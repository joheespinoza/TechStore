
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirm: "",
  });

  const [accept, setAccept] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const change = (
    key: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (
      form.name.trim().length < 2 ||
      form.lastName.trim().length < 2
    ) {
      setError("Ingresa un nombre y apellido válidos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Ingresa un correo válido.");
      return;
    }

    if (!/^9\d{8}$/.test(form.phone)) {
      setError(
        "El teléfono peruano debe tener 9 dígitos y comenzar con 9."
      );
      return;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
        form.password
      )
    ) {
      setError(
        "La contraseña necesita 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return;
    }

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!accept) {
      setError("Acepta los términos para continuar.");
      return;
    }

    const issue = register({
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email,
      phone: form.phone,
      company: form.company,
      password: form.password,
    });

    if (issue) {
      setError(issue);
      return;
    }

    navigate("/productos", { replace: true });
  }

  return (
    <section className="auth-container">
      <form
        className="auth-card register-card"
        onSubmit={submit}
      >
        <Link className="back-link" to="/">
          ← Volver al inicio
        </Link>

        <h1>Crear Cuenta</h1>
        <p>Crea tu cuenta para comprar en TechStore</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-grid">
          {(
            [
              {
                key: "name",
                title: "Nombre",
                hint: "Juan",
              },
              {
                key: "lastName",
                title: "Apellido",
                hint: "Pérez",
              },
              {
                key: "email",
                title: "Correo electrónico",
                hint: "juan@ejemplo.com",
                type: "email",
                wide: true,
              },
              {
                key: "company",
                title: "Empresa / organización (opcional)",
                hint: "Empresa S.A.",
              },
              {
                key: "phone",
                title: "Teléfono",
                hint: "999123456",
                type: "tel",
              },
              {
                key: "password",
                title: "Contraseña",
                hint: "Contraseña segura",
                type: "password",
              },
              {
                key: "confirm",
                title: "Confirmar contraseña",
                hint: "Repetir contraseña",
                type: "password",
              },
            ] as {
              key: keyof typeof form;
              title: string;
              hint: string;
              type?: string;
              wide?: boolean;
            }[]
          ).map((field) => (
            <label
              key={field.key}
              className={field.wide ? "wide" : ""}
            >
              {field.title}

              <input
                type={field.type || "text"}
                required={field.key !== "company"}
                autoComplete={
                  field.key === "email"
                    ? "email"
                    : undefined
                }
                value={form[field.key]}
                placeholder={field.hint}
                onChange={(e) =>
                  change(field.key, e.target.value)
                }
              />
            </label>
          ))}
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) =>
              setAccept(e.target.checked)
            }
          />
          Acepto los términos y la política de privacidad
          (demostración)
        </label>

        <button className="btn-primary full">
          Crear Cuenta
        </button>

        <p>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">
            Inicia sesión
          </Link>
        </p>

        <small>
          Solo para evaluación académica: los datos se
          guardan localmente en este navegador.
          No uses datos sensibles reales.
        </small>
      </form>
    </section>
  );
}
