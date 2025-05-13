
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme/theme-provider"
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vision-hub-theme">
    <App />
  </ThemeProvider>
);
