
import { ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [waitTime, setWaitTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [forceAuthentication, setForceAuthentication] = useState(false);
  
  // Timer to avoid infinite loading - using useRef for a single instance
  useEffect(() => {
    // Clear any existing interval before creating a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isLoading && !forceAuthentication) {
      intervalRef.current = setInterval(() => {
        setWaitTime(prev => {
          // If waiting for more than 5 seconds, consider it a problem
          if (prev >= 5) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Reset wait time when loading ends
      setWaitTime(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading, forceAuthentication]);
  
  // If loading time exceeds 5 seconds without resolving, offer option to continue or redirect
  if ((waitTime >= 5 && isLoading) || forceAuthentication) {
    console.log("Time limit reached, offering options to user");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Verificação de autenticação demorada</h2>
          <p className="mb-6">Estamos tendo dificuldades em verificar seu login. O que deseja fazer?</p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={() => setForceAuthentication(true)} className="w-full">
              Continuar mesmo assim
            </Button>
            
            <Button onClick={() => window.location.href = "/login"} variant="outline" className="w-full">
              Voltar para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If still loading, show a spinner
  if (isLoading && waitTime < 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500">Verificando autenticação...</p>
          <p className="text-sm text-gray-400">Aguarde {5 - waitTime} segundos...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated && !forceAuthentication) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (roles && user && !roles.includes(user.role) && !forceAuthentication) {
    console.log(`User does not have permission. Required role: ${roles.join(', ')}, User role: ${user.role}`);
    return <Navigate to="/not-authorized" replace />;
  }

  // If everything is ok, render the protected content
  console.log("Authentication successful. Rendering private route.");
  return <>{children}</>;
}
