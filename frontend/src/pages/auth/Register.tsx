import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type FormState = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirm: string;
};

type FieldKey = keyof FormState;
type Errors = Partial<Record<FieldKey | "accept", string>>;

type FieldConfig = {
  key: FieldKey;
  title: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "password";
  wide?: boolean;
  optional?: boolean;
  autoComplete?: string;
  maxLength?: number;
  hint?: string;
};

const FIELDS: FieldConfig[] = [
  {
    key: "name",
    title: "Nombre",
    placeholder: "Juan",
    autoComplete: "given-name",
  },
  {
    key: "lastName",
    title: "Apellido",
    placeholder: "Pérez",
    autoComplete: "family-name",
  },
  {
    key: "email",
    title: "Correo electrónico",
    placeholder: "juan@ejemplo.com",
    type: "email",
    wide: true,
    autoComplete: "email",
  },
  {
    key: "company",
    title: "Empresa u organización",
    placeholder: "Empresa S.A.",
    optional: true,
    autoComplete: "organization",
  },
  {
    key: "phone",
    title: "Teléfono",
    placeholder: "999123456",
    type: "tel",
    autoComplete: "tel-national",
    maxLength: 9,
    hint: "9 números, empezando con 9.",
  },
  {
    key: "password",
    title: "Contraseña",
    placeholder: "Crea una contraseña",
    type: "password",
    autoComplete: "new-password",
    hint: "Mínimo 8 caracteres, con una mayúscula, una minúscula y un número.",
  },
  {
    key: "confirm",
    title: "Confirmar contraseña",
    placeholder: "Repite la contraseña",
    type: "password",
    autoComplete: "new-password",
  },
];

const EMPTY: FormState = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  password: "",
  confirm: "",
};

function validate(key: FieldKey, form: FormState): string {
  const value = form[key];

  switch (key) {
    case "name":
      return value.trim().length < 2
        ? "Ingresa tu nombre con al menos 2 letras, por ejemplo Juan."
        : "";
    case "lastName":
      return value.trim().length < 2
        ? "Ingresa tu apellido con al menos 2 letras, por ejemplo Pérez."
        : "";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ""
        : "Ingresa un correo electrónico válido como usuario@dominio.com.";
    case "phone":
      return /^9\d{8}$/.test(value)
        ? ""
        : "Ingresa un celular de 9 números que empiece con 9, por ejemplo 987654321.";
    case "password":
      if (value.length < 8) {
        return "La contraseña necesita al menos 8 caracteres.";
      }
      if (!/[a-z]/.test(value)) {
        return "Agrega al menos una letra minúscula a la contraseña.";
      }
      if (!/[A-Z]/.test(value)) {
        return "Agrega al menos una letra mayúscula a la contraseña.";
      }
      if (!/\d/.test(value)) {
        return "Agrega al menos un número a la contraseña.";
      }
      return "";
    case "confirm":
      if (!value) return "Repite la contraseña para confirmarla.";
      return value === form.password
        ? ""
        : "Las contraseñas no coinciden. Escríbela otra vez igual que arriba.";
    default:
      return "";
  }
}

const ACCEPT_MESSAGE =
  "Marca la casilla para aceptar los términos y continuar.";

export default function Register() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [accept, setAccept] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  function change(key: FieldKey, rawValue: string) {
    const value = key === "phone" ? rawValue.replace(/\D/g, "") : rawValue;
    const next = { ...form, [key]: value };

    setForm(next);
    setSummary("");

    setErrors((previous) => {
      const updated = { ...previous };

      /* Si el campo ya mostraba un error, se revalida al escribir */
      if (previous[key]) {
        updated[key] = validate(key, next);
      }

      /* Al cambiar la contraseña se revisa de nuevo la confirmación */
      if (key === "password" && next.confirm) {
        updated.confirm = validate("confirm", next);
      }

      return updated;
    });
  }

  function blur(key: FieldKey) {
    if (key === "company") return;
    setErrors((previous) => ({ ...previous, [key]: validate(key, form) }));
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found: Errors = {};

    for (const field of FIELDS) {
      if (field.optional) continue;
      const issue = validate(field.key, form);
      if (issue) found[field.key] = issue;
    }

    if (!accept) found.accept = ACCEPT_MESSAGE;

    setErrors(found);

    const order: (FieldKey | "accept")[] = [
      ...FIELDS.filter((f) => !f.optional).map((f) => f.key),
      "accept",
    ];
    const first = order.find((k) => found[k]);

    if (first) {
      setSummary(
        "Revisa los campos marcados: hay datos que debes corregir antes de crear tu cuenta."
      );
      document.getElementById(`reg-${first}`)?.focus();
      return;
    }

    const issue = register({
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone,
      company: form.company.trim(),
      password: form.password,
    });

    if (issue) {
      /* Error del sistema, por ejemplo correo ya registrado */
      setErrors({ email: issue });
      setSummary(issue);
      document.getElementById("reg-email")?.focus();
      return;
    }

    navigate("/productos", { replace: true });
  }

  return (
    <section className="auth-container">
      <form
        className="auth-card register-card"
        onSubmit={submit}
        noValidate
      >
        <Link className="back-link" to="/">
          ← Volver al inicio
        </Link>

        <h1>Crear cuenta</h1>
        <p>Crea tu cuenta para comprar en TechStore.</p>
        <p className="form-note">
          Los campos marcados como “obligatorio” deben completarse.
        </p>

        {summary && (
          <p className="form-error" role="alert">
            {summary}
          </p>
        )}

        <div className="form-grid">
          {FIELDS.map((field) => {
            const id = `reg-${field.key}`;
            const message = errors[field.key];
            const isPassword = field.type === "password";
            const describedBy = [
              field.hint ? `${id}-hint` : "",
              message ? `${id}-error` : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={field.key}
                className={field.wide ? "form-field wide" : "form-field"}
              >
                <label htmlFor={id}>
                  {field.title}
                  {field.optional ? " (opcional)" : " (obligatorio)"}
                </label>

                <input
                  id={id}
                  name={field.key}
                  type={isPassword && showPasswords ? "text" : field.type || "text"}
                  inputMode={field.type === "tel" ? "numeric" : undefined}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  aria-required={!field.optional}
                  aria-invalid={message ? true : undefined}
                  aria-describedby={describedBy || undefined}
                  onBlur={() => blur(field.key)}
                  onChange={(e) => change(field.key, e.target.value)}
                />

                {field.hint && (
                  <p id={`${id}-hint`} className="field-hint">
                    {field.hint}
                  </p>
                )}

                {message && (
                  <p id={`${id}-error`} className="field-error">
                    {message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <label className="checkbox-label" htmlFor="show-passwords">
          <input
            id="show-passwords"
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
          />
          Mostrar contraseñas
        </label>

        <div className="form-field">
          <label className="checkbox-label" htmlFor="reg-accept">
            <input
              id="reg-accept"
              type="checkbox"
              checked={accept}
              aria-required={true}
              aria-invalid={errors.accept ? true : undefined}
              aria-describedby={errors.accept ? "reg-accept-error" : undefined}
              onChange={(e) => {
                setAccept(e.target.checked);
                setSummary("");
                setErrors((previous) => ({
                  ...previous,
                  accept: e.target.checked ? "" : ACCEPT_MESSAGE,
                }));
              }}
            />
            Acepto los términos y la política de privacidad (obligatorio, es una
            demostración)
          </label>

          {errors.accept && (
            <p id="reg-accept-error" className="field-error">
              {errors.accept}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary full">
          Crear cuenta
        </button>

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>

        <small>
          Solo para evaluación académica: los datos se guardan localmente en
          este navegador. No uses datos sensibles reales.
        </small>
      </form>
    </section>
  );
}