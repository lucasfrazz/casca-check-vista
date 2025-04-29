
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página. Por favor, entre em contato com o administrador do sistema.
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
