import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ScrollToTop from "./components/layout/ScrollToTop";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccesoDenegadoPage from "./pages/AccesoDenegadoPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminObrasPage from "./pages/AdminObrasPage";
import AdminFuncionesPage from "./pages/AdminFuncionesPage";
import QuienesSomosPage from "./pages/QuienesSomosPage";
import FaqPage from "./pages/FaqPage";
import ContactoPage from "./pages/ContactoPage";
import NotFoundPage from "./pages/NotFoundPage";
import ObraDetallePage from "./pages/ObraDetallePage";
import PrivacidadPage from "./pages/PrivacidadPage";
import ComprasPage from "./pages/ComprasPage";
import CompraDetallePage from "./pages/CompraDetallePage";
import { ROLES } from "./context/auth-context";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="acceso-denegado" element={<AccesoDenegadoPage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/obras"
            element={
              <ProtectedRoute roles={[ROLES.SUPERADMIN]}>
                <AdminObrasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/funciones"
            element={
              <ProtectedRoute roles={[ROLES.SUPERADMIN, ROLES.DUENO]}>
                <AdminFuncionesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="compras"
            element={
              <ProtectedRoute>
                <ComprasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="compras/:compraId"
            element={
              <ProtectedRoute>
                <CompraDetallePage />
              </ProtectedRoute>
            }
          />
          <Route path="quienes-somos" element={<QuienesSomosPage />} />
          <Route path="preguntas-frecuentes" element={<FaqPage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="obras/:obraId" element={<ObraDetallePage />} />
          <Route path="privacidad" element={<PrivacidadPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
