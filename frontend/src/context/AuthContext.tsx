import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Role = "CLIENT" | "ADMIN";

export type User = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: Role;
};

type StoredUser = User & {
  password: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => string | null;
  register: (
    data: Omit<StoredUser, "id" | "role">
  ) => string | null;
  logout: () => void;
};

const KEY = "techstore-demo-users-v1";
const SESSION = "techstore-demo-session-v1";

/* Cuenta de demostración. Se reemplazará por autenticación real en el backend. */
const DEMO_ADMIN: StoredUser = {
  id: "admin-demo",
  name: "Administrador",
  lastName: "TechStore",
  email: "admin@techstore.pe",
  phone: "",
  company: "TechStore",
  role: "ADMIN",
  password: "Admin123!",
};

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUsers(): StoredUser[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getUsers(): StoredUser[] {
  return [DEMO_ADMIN, ...getStoredUsers()];
}

function getSession(): User | null {
  try {
    return JSON.parse(
      sessionStorage.getItem(SESSION) || "null"
    ) as User | null;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(getSession);

  function login(email: string, password: string) {
    const found = getUsers().find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!found) {
      return "Correo o contraseña incorrectos.";
    }

    const { password: _password, ...safe } = found;
    void _password;

    setUser(safe);
    sessionStorage.setItem(SESSION, JSON.stringify(safe));

    return null;
  }

  function register(data: Omit<StoredUser, "id" | "role">) {
    if (
      getUsers().some(
        (u) =>
          u.email.toLowerCase() ===
          data.email.trim().toLowerCase()
      )
    ) {
      return "Este correo ya está registrado.";
    }

    const created: StoredUser = {
      ...data,
      email: data.email.trim().toLowerCase(),
      id: String(Date.now()),
      role: "CLIENT",
    };

    localStorage.setItem(
      KEY,
      JSON.stringify([...getStoredUsers(), created])
    );

    const { password: _password, ...safe } = created;
    void _password;

    setUser(safe);
    sessionStorage.setItem(SESSION, JSON.stringify(safe));

    return null;
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem(SESSION);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider faltante");
  }

  return context;
}