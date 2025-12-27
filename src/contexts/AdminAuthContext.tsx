import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useTelegram } from "../hooks/useTelegram";
import { adminApi } from "../services/adminApi";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useTelegram();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Проверяем, есть ли токены в localStorage
      const telegramId = localStorage.getItem("admin_telegram_id");
      const adminToken = localStorage.getItem("admin_token");

      if (!telegramId && !adminToken) {
        // Если токенов нет, сразу считаем неавторизованным
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      await adminApi.checkAuth();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      // Очищаем токены при ошибке
      localStorage.removeItem("admin_telegram_id");
      localStorage.removeItem("admin_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    try {
      const result = await adminApi.loginViaTelegram(userId);

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_telegram_id");
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
