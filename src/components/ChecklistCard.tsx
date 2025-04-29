
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistType } from "@/types";
import { checklistTemplates } from "@/data/checklistTemplates";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";

interface ChecklistCardProps {
  type: ChecklistType;
  storeId: string;
  onSelect: (type: ChecklistType) => void;
}

export function ChecklistCard({ type, onSelect }: ChecklistCardProps) {
  const template = checklistTemplates.find(t => t.type === type);
  const navigate = useNavigate();
  
  if (!template) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {template.title}
        </CardTitle>
        <CardDescription>
          {template.items.length} itens para verificar
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Button 
          onClick={() => onSelect(type)}
          className="w-full"
        >
          Iniciar Checklist
        </Button>
      </CardContent>
    </Card>
  );
}
