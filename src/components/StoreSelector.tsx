
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";

interface StoreSelectorProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
}

export function StoreSelector({ stores, onSelectStore }: StoreSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione uma Loja</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stores.map((store) => (
          <Card key={store.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  <span>{store.name}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onSelectStore(store.id)}
                >
                  Selecionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
