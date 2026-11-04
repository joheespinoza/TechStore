import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Productos from "../pages/client/Productos";
import Carrito from "../pages/client/Carrito";
import Checkout from "../pages/client/Checkout";
import MisPedidos from "../pages/client/MisPedidos";

import Dashboard from "../pages/paneladmin/Dashboard";
import GestionProductos from "../pages/paneladmin/GestionProductos";
import GestionPedidos from "../pages/paneladmin/GestionPedidos";
import Reportes from "../pages/paneladmin/Reportes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/carrito" element={<Carrito />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute loginMessage="Inicia sesión para ver tus pedidos.">
              <MisPedidos />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            role="ADMIN"
            loginMessage="Inicia sesión como administrador."
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productos" element={<GestionProductos />} />
        <Route path="pedidos" element={<GestionPedidos />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}