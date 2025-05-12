
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Digite um email válido"),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onToggleForm: () => void;
}

export const ForgotPasswordForm = ({ onToggleForm }: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Using Supabase's password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success message
      setResetSent(true);
      toast({
        title: "Email enviado",
        description: "Enviamos um link para recuperar sua senha no email informado.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro ao enviar o email de recuperação de senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        <p className="text-sm text-gray-500">
          Digite seu email e enviaremos instruções para redefinir sua senha
        </p>
      </div>

      {resetSent ? (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Email enviado! Por favor, verifique sua caixa de entrada e siga as instruções para recuperar sua senha.
            </AlertDescription>
          </Alert>
          <Button className="w-full" onClick={onToggleForm}>
            Voltar ao login
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10"
                        placeholder="seu@email.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar instruções"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleForm}
                className="text-sm text-blue-600 hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
