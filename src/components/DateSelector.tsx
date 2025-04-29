
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateSelectorProps {
  onSelectDate: (date: string) => void;
}

export function DateSelector({ onSelectDate }: DateSelectorProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Format date to YYYY-MM-DD for API consistency
      onSelectDate(format(selectedDate, 'yyyy-MM-dd'));
      setShowCalendar(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione uma Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione uma data"}
          </Button>
          
          {showCalendar && (
            <div className="rounded-md border p-2 mt-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="mx-auto"
              />
            </div>
          )}
          
          <Button 
            className="w-full" 
            onClick={() => onSelectDate(format(new Date(), 'yyyy-MM-dd'))}
          >
            Ver Checklists de Hoje
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
