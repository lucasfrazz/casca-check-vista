
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui/spinner';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [waitTime, setWaitTime] = useState(0);
  
  // Timer para evitar loading infinito
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        setWaitTime(prev => {
          // Se esperar mais de 5 segundos, consideramos um problema e redirecionamos para login
          if (prev >= 5) {
            console.warn("Tempo limite de carregamento atingido. Redirecionando para login.");
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);
  
  // Caso o tempo de carregamento ultrapasse 5 segundos sem resolver, redireciona para login
  if (waitTime >= 5 && isLoading) {
    console.log("Tempo limite atingido, redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se ainda está carregando, mostra um spinner
  if (isLoading && waitTime < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário tem a role necessária
  if (roles && user && !roles.includes(user.role)) {
    console.log(`Usuário não tem permissão. Role necessária: ${roles.join(', ')}, Role do usuário: ${user.role}`);
    return <Navigate to="/not-authorized" replace />;
  }

  // Se tudo estiver ok, renderiza o conteúdo protegido
  console.log("Autenticação bem-sucedida. Renderizando rota privada.");
  return <>{children}</>;
}
