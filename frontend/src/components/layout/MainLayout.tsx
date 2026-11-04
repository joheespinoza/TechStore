import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FlashMessage from "../common/FlashMessage";

export default function MainLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      <main id="main-content" tabIndex={-1}>
        <FlashMessage />
        <Outlet />
      </main>

      <Footer />
    </>
  );
}