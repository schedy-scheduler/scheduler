import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "./routes";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <div className="max-w-195 w-full">
          <Routes />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
);
