import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { StoreSelector } from "@/components/StoreSelector";
import { ChecklistCard } from "@/components/ChecklistCard";
import { stores } from "@/data/stores";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useAuth } from "@/context/AuthContext";
import { useChecklists } from "@/context/checklist";
import { useNavigate } from "react-router-dom";
import { ChecklistType } from "@/types";
import { PendingNotification } from "@/components/PendingNotification";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { createChecklist, loading: checklistLoading } = useChecklists();
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Definir um timeout para evitar loading infinito com useCallback para estabilizar
  const setupLoadingTimeout = useCallback(() => {
    if ((authLoading || !isInitialized) && !loadTimeout) {
      const timeout = setTimeout(() => {
        console.log("Loading timeout reached, forcing initialization");
        setIsInitialized(true);
      }, 5000);
      setLoadTimeout(timeout);
      return timeout;
    }
    return null;
  }, [authLoading, isInitialized, loadTimeout]);

  useEffect(() => {
    const timeout = setupLoadingTimeout();
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [setupLoadingTimeout]);

  // Para colaboradores, pré-seleciona a loja deles - com useEffect estabilizado
  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      console.log("User carregado no dashboard:", user);
      if (user.role === "collaborator" && user.storeId) {
        console.log(`Pré-selecionando a loja do colaborador: ${user.storeId}`);
        setSelectedStore(user.storeId);
      }
      setIsInitialized(true);
      
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        setLoadTimeout(null);
      }
    }
  }, [user, authLoading, loadTimeout, isInitialized]);

  // Obter lojas disponíveis com base no papel do usuário
  const availableStores = user?.role === "admin" 
    ? stores 
    : stores.filter(store => store.id === user?.storeId);

  const handleStoreSelect = (storeId: string) => {
    console.log(`Store selecionada: ${storeId}`);
    setSelectedStore(storeId);
    // Reset error state when store is selected
    setLoadError(null);
  };

  const handleChecklistSelect = async (type: ChecklistType) => {
    if (!selectedStore) return;
    
    try {
      setIsCreating(true);
      setLoadError(null);
      console.log(`Criando checklist ${type} para loja ${selectedStore}`);
      const newChecklist = await createChecklist(type, selectedStore);
      if (newChecklist) {
        console.log(`Checklist criado com sucesso: ${newChecklist.id}`);
        navigate(`/checklist/${newChecklist.id}`);
      }
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
      setLoadError("Não foi possível criar o checklist. Tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível criar o checklist. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setLoadError(null);
    setIsInitialized(false);
    
    // Force re-initialization after a short delay
    setTimeout(() => {
      setIsInitialized(true);
    }, 500);
  };

  // Enquanto o auth está carregando, mostra um spinner com timeout
  if ((authLoading || !isInitialized) && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <div className="flex justify-center items-center" style={{height: "50vh"}}>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-500">Carregando informações...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PendingNotification />
      
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex flex-col items-center">
            <p className="mb-3">{loadError}</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}
        
        {(checklistLoading || isCreating) ? (
          <div className="flex justify-center items-center" style={{height: "50vh"}}>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-500">{isCreating ? 'Criando checklist...' : 'Carregando...'}</p>
            </div>
          </div>
        ) : (
          <>
            {(!selectedStore && availableStores.length > 0) && (
              <div className="mb-6">
                <StoreSelector 
                  stores={availableStores} 
                  onSelectStore={handleStoreSelect}
                />
              </div>
            )}
            
            {selectedStore && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Checklists Disponíveis</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {checklistTemplates.map((template) => (
                      <ChecklistCard 
                        key={template.type}
                        type={template.type}
                        storeId={selectedStore}
                        onSelect={handleChecklistSelect}
                      />
                    ))}
                  </div>
                </div>
                
                {user?.role === "admin" && (
                  <div className="mt-8">
                    <button 
                      className="text-blue-600 hover:underline"
                      onClick={() => setSelectedStore(null)}
                    >
                      ← Voltar para a seleção de lojas
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
