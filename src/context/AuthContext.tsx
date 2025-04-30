
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, UnidadeType } from "@/types";
import { users } from "@/data/mockData";
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
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Simple login function (mock)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }
      
      // Simple validation for demo purposes
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error("Usuário não encontrado");
      }
      
      if (password !== "123456") { // Mock password check
        throw new Error("Senha incorreta");
      }
      
      // Set user in state and localStorage
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(foundUser));
      
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

  // Simple register function (mock)
  const register = async (name: string, email: string, password: string, unidade: UnidadeType): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      if (!name || !email || !password || !unidade) {
        throw new Error("Nome, email, senha e unidade são obrigatórios");
      }
      
      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        throw new Error("Este email já está registrado");
      }
      
      // Create new user (in a real app this would save to database)
      const newUser: User = {
        id: String(users.length + 1),
        name,
        email,
        role: "collaborator",
        unidade,
      };
      
      // Add to users array (in memory only - for demo)
      users.push(newUser);
      
      // Set user in state and localStorage
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo ao Casca Check Vista!",
      });
      
      return true;
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

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
