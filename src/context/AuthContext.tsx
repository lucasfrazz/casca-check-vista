
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UnidadeType } from "@/types";
import { authService } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, unidade: UnidadeType) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const userData = await authService.getCurrentUser();
        if (userData) {
          console.log("Sessão recuperada para:", userData.name);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log("Nenhuma sessão encontrada");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // Garantir que isLoading sempre seja definido como false, mesmo em caso de erro
        setIsLoading(false);
      }
    };
    
    // Definir um timeout para garantir que isLoading não ficará preso como true
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Timeout de verificação de sessão atingido");
        setIsLoading(false);
      }
    }, 3000);
    
    checkSession();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }
      
      console.log("Tentando fazer login com:", { email });
      setIsLoading(true);
      
      const userData = await authService.login(email, password);
      
      if (!userData) {
        throw new Error("Usuário não encontrado ou senha incorreta");
      }
      
      // Set user in state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      await authService.saveCurrentUser(userData);
      
      console.log("Login bem-sucedido:", userData);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro no login:", error.message);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, unidade: UnidadeType): Promise<boolean> => {
    try {
      if (!name || !email || !password || !unidade) {
        throw new Error("Nome, email, senha e unidade são obrigatórios");
      }
      
      console.log("Tentando registrar:", { name, email, unidade });
      setIsLoading(true);
      
      const userData = await authService.register(name, email, password, unidade);
      
      if (!userData) {
        throw new Error("Falha ao registrar usuário");
      }
      
      console.log("Registro bem-sucedido, tentando fazer login");
      
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
        console.error("Erro no registro:", error.message);
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Remove user from localStorage
      localStorage.removeItem('currentUser');
      
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      
      console.log("Usuário desconectado");
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível desconectar corretamente",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
