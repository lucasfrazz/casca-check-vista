
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChecklists } from "@/context/ChecklistContext";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const { getPendingActionPlans } = useChecklists();
  const navigate = useNavigate();
  const [pendingPlans, setPendingPlans] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const plans = getPendingActionPlans();
    setPendingPlans(plans.length);
  }, [getPendingActionPlans]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-primary cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Casca Check Vista
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            
            {user?.role === "admin" && (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => navigate("/manage-users")}
                >
                  Colaboradores
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => navigate("/lessons")}
                >
                  Lições Aprendidas
                </Button>
              </>
            )}
            
            {pendingPlans > 0 && (
              <Button 
                variant="outline" 
                className="relative"
                onClick={() => navigate("/action-plans")}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingPlans}
                </span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-1" />
              Sair
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                
                {user?.role === "admin" && (
                  <>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        navigate("/manage-users");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Colaboradores
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        navigate("/lessons");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Lições Aprendidas
                    </Button>
                  </>
                )}
                
                {pendingPlans > 0 && (
                  <Button 
                    variant="outline" 
                    className="relative justify-start"
                    onClick={() => {
                      navigate("/action-plans");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Pendências
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingPlans}
                    </span>
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
