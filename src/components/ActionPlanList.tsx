
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PendingActionPlan } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface ActionPlanListProps {
  plans: PendingActionPlan[];
  onReviewPlan: (planId: string, checklistId: string, itemId: string, status: "approved" | "rejected", comment?: string) => void;
  isAdmin: boolean;
}

export function ActionPlanList({ plans, onReviewPlan, isAdmin }: ActionPlanListProps) {
  const [selectedPlan, setSelectedPlan] = useState<PendingActionPlan | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected" | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const handleReviewClick = (plan: PendingActionPlan, status: "approved" | "rejected") => {
    if (!isAdmin) return;
    
    setSelectedPlan(plan);
    setReviewStatus(status);
    setReviewComment("");
  };

  const handleSubmitReview = () => {
    if (!selectedPlan || !reviewStatus) return;
    
    // In a real app, you would have the checklistId and itemId available
    // For this mock, we'll just use the plan ID for both
    onReviewPlan(
      selectedPlan.id, 
      "mock-checklist-id", 
      "mock-item-id", 
      reviewStatus, 
      reviewComment
    );
    
    setSelectedPlan(null);
    setReviewStatus(null);
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Não há planos de ação pendentes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Planos de Ação Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-yellow-50/50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{plan.itemDescription}</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Pendente
                      </span>
                    </div>
                    
                    <p className="text-sm">{plan.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>{plan.storeName}</div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente há {plan.daysPending} dia(s)
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 hover:bg-green-100 border-green-200"
                          onClick={() => handleReviewClick(plan, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 hover:bg-red-100 border-red-200"
                          onClick={() => handleReviewClick(plan, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Review Dialog */}
      <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewStatus === "approved" ? "Aprovar Plano de Ação" : "Recusar Plano de Ação"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-1">
              {selectedPlan?.itemDescription}
            </h3>
            <p className="text-sm mb-4">
              Plano: {selectedPlan?.description}
            </p>
            
            <p className="mb-2 font-medium">Comentário (opcional):</p>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Adicione uma observação ou comentário..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button 
              variant={reviewStatus === "approved" ? "default" : "destructive"} 
              onClick={handleSubmitReview}
            >
              {reviewStatus === "approved" ? "Confirmar Aprovação" : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
