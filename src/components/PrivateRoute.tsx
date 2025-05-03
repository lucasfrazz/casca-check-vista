
import { ReactNode, useEffect } from 'react';
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
  
  // Se ainda está carregando, mostra um spinner
  if (isLoading) {
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
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário tem a role necessária
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  // Se tudo estiver ok, renderiza o conteúdo protegido
  return <>{children}</>;
}
