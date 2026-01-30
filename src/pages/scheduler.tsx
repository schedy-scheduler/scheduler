import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/hooks/useToast";
import { storeService, type Store } from "@/services/storeService";
import { schedulingService } from "@/services/schedulingService";
import { formatPhone } from "@/utils/formatPhone";
import { FormSteps } from "@/components/FormSteps";
import { FormProvider, useForm } from "react-hook-form";
import { Step1 } from "@/components/Scheduler/steps/Step1";
import { Step2 } from "@/components/Scheduler/steps/Step2";
import * as Yup from "yup";
import { Step3 } from "@/components/Scheduler/steps/Step3";
import { Step4 } from "@/components/Scheduler/steps/Step4";

export interface SchedulerFormContext {
  professional: string;
  services: string[];
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export function Scheduler() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SchedulerFormContext>({
    defaultValues: {
      professional: "",
      services: [] as string[],
      date: "",
      time: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!slug) return;

    setSubmitting(true);
    try {
      // Busca o ID da loja pelo slug
      const storeId = await storeService.getStoreIdBySlug(slug);
      if (!storeId) {
        addToast("Loja não encontrada", "error");
        return;
      }

      // Cria o agendamento
      const result = await schedulingService.createAppointment({
        store_id: storeId,
        employee_id: data.professional,
        service_ids: data.services,
        scheduled_date: data.date,
        scheduled_time: data.time,
        customer: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      });

      if (result.success) {
        addToast("Agendamento realizado com sucesso!", "success");
        // Reseta o formulário
        form.reset();
        // Redireciona para a página de sucesso
        navigate(`/${slug}/success`);
      } else {
        addToast(result.error || "Erro ao realizar agendamento", "error");
      }
    } catch (err) {
      console.error("Erro ao realizar agendamento:", err);
      addToast("Erro ao realizar agendamento", "error");
    } finally {
      setSubmitting(false);
    }
  });

  useEffect(() => {
    const fetchStore = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const data = await storeService.getStoreBySlug(slug);

        if (!data) {
          addToast("Loja não encontrada", "error");
          setStore(null);
        } else {
          setStore(data);
        }
      } catch (err) {
        addToast("Erro ao carregar loja", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug, addToast]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-zinc-700 rounded-bl-3xl rounded-br-3xl h-25" />
      <div className="-mt-9">
        <Avatar name={store?.name ?? ""} isLoading={loading} />
      </div>
      <strong className="text-lg font-semibold text-zinc-700">
        {store?.name ?? ""}
      </strong>
      {store && (
        <div className="mt-2 text-center text-sm text-zinc-600">
          <p>{store.email}</p>
          <p>{formatPhone(store.phone)}</p>
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="w-full">
          <FormSteps
            steps={[
              {
                label: "Serviço e profissional",
                component: <Step1 />,
                fields: ["professional", "services"],
                schema: Yup.object({
                  professional: Yup.string().required(
                    "Selecione um profissional",
                  ),
                  services: Yup.array()
                    .of(Yup.string())
                    .min(1, "Selecione ao menos um serviço"),
                }),
              },
              {
                label: "Data e horário",
                component: <Step2 />,
                fields: ["date", "time"],
                schema: Yup.object({
                  date: Yup.string().required("Selecione a data"),
                  time: Yup.string().required("Selecione o horário"),
                }),
              },
              {
                label: "Seus dados",
                component: <Step3 />,
                fields: ["name", "email", "phone"],
                schema: Yup.object({
                  name: Yup.string().required("Digite seu nome"),
                  email: Yup.string()
                    .email("Email inválido")
                    .required("Digite seu email"),
                  phone: Yup.string().required("Digite seu telefone"),
                }),
              },
              {
                label: "Confirmação",
                component: <Step4 />,
              },
            ]}
            onComplete={handleSubmit}
            isSubmitting={submitting}
          />
        </form>
      </FormProvider>
    </div>
  );
}
