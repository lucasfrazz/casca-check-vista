
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UnidadeType, mapDatabaseUserToAppUser } from "@/types";
import { authService } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, unidade: UnidadeType) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }
      
      const userData = await authService.login(email, password);
      
      if (!userData) {
        throw new Error("Usuário não encontrado ou senha incorreta");
      }
      
      // Set user in state
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, unidade: UnidadeType): Promise<boolean> => {
    try {
      if (!name || !email || !password || !unidade) {
        throw new Error("Nome, email, senha e unidade são obrigatórios");
      }
      
      const userData = await authService.register(name, email, password, unidade);
      
      if (!userData) {
        throw new Error("Falha ao registrar usuário");
      }
      
      // Set user in state - for demo only, in production should redirect to login
      const loginResult = await login(email, password);
      
      if (loginResult) {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao Casca Check Vista!",
        });
      }
      
      return loginResult;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
