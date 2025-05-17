
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from "@/hooks/toast-context"
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>
);
