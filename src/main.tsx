
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme/theme-provider"
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from "@/hooks/toast-context"
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="videoguard-theme">
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </ThemeProvider>
);
