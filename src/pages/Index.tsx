
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "@/services/supabase";
import { Spinner } from "@/components/ui/spinner";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if we can connect to Supabase
        const supabase = getSupabase();
        
        if (!supabase) {
          setError("Não foi possível conectar ao Supabase. Verifique as configurações.");
          return;
        }
        
        // Test connection by pinging the API
        const { error } = await supabase.from('checklists').select('count').limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error);
          setError("Erro ao conectar com o Supabase. Verifique as credenciais.");
          return;
        }
        
        // Connection successful, redirect to login
        navigate("/login");
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
        setError("Erro inesperado ao verificar conexão com o Supabase.");
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Erro de Conexão</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <p className="text-gray-500 text-sm">
            Verifique se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas corretamente.
          </p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Index;
