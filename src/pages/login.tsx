import { Input } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

const formSchema = yup.object({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
});

export const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(formSchema),
    values: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);

    const result = await authService.login({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.addToast(result.error, "error");
      setIsLoading(false);
      return;
    }

    toast.addToast("Login realizado com sucesso!", "success");
    setIsLoading(false);
    navigate("/admin");
  });

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Faça login com suas credênciais
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Entre com seu e-mail e senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <FormProvider {...form}>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <Input
                name="email"
                label="E-mail"
                placeholder="Digite seu e-mail"
              />
              <Input
                name="password"
                label="Senha"
                placeholder="Digite sua senha"
                type="password"
              />

              <Button disabled={isLoading} className="w-full">
                {isLoading ? "Carregando..." : "Fazer login"}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-full h-0.5 bg-zinc-200" />
                <span className="text-[10px] font-semibold text-zinc-400 whitespace-nowrap">
                  OU
                </span>
                <div className="w-full h-0.5 bg-zinc-200" />
              </div>
              <Link className="w-full" to="/register">
                <Button className="w-full" variant="secondary">
                  Criar minha conta
                </Button>
              </Link>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
