import Wanchai from "./Wanchai";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <Wanchai />
      </ToastProvider>
    </LanguageProvider>
  );
}
