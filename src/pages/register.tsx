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
  name: yup.string().required("Nome é obrigatório."),
  storeName: yup.string().required("Nome do estabelecimento é obrigatório."),
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem.")
    .required("Confirmação de senha é obrigatória."),
});

export const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(formSchema),
    values: {
      name: "",
      storeName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);

    const result = await authService.register({
      name: data.name,
      storeName: data.storeName,
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.addToast(result.error, "error");
      setIsLoading(false);
      return;
    }

    toast.addToast("Cadastro realizado com sucesso!", "success");
    setIsLoading(false);
    navigate("/admin");
  });

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Crie sua conta grátis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Preencha as informações e comece seus agendamentos agora mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <FormProvider {...form}>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <Input
                name="name"
                label="Seu nome"
                placeholder="Digite seu nome"
              />
              <Input
                name="storeName"
                label="Nome do estabelecimento"
                placeholder="Digite o nome do seu estabelecimento"
              />
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
              <Input
                name="confirmPassword"
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                type="password"
              />

              <Button disabled={isLoading} className="w-full">
                {isLoading ? "Carregando..." : "Criar minha conta"}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-full h-0.5 bg-zinc-200" />
                <span className="text-[10px] font-semibold text-zinc-400 whitespace-nowrap">
                  OU
                </span>
                <div className="w-full h-0.5 bg-zinc-200" />
              </div>
              <Link className="w-full" to="/">
                <Button className="w-full" variant="secondary">
                  Fazer login
                </Button>
              </Link>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
