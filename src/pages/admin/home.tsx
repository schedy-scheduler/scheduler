import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Calendar } from "@/components/schedullers/Calendar";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { schedulesService } from "@/services/schedulesService";
import { storeService } from "@/services/storeService";

export const Home = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get store
      const { data: storeData, error: storeError } =
        await storeService.getByOwnerId(user?.id || "");

      if (storeError || !storeData) {
        toast.addToast("Erro ao carregar loja", "error");
        return;
      }

      setStoreId(storeData.id);

      // Verificar se precisa fazer o onboarding
      if (!storeData.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      toast.addToast("Erro ao carregar dados", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = async (formData: {
    professional: number | string;
    date: string;
    time: string;
    customer: number | string;
    services: string[];
    total?: number;
    duration?: string;
  }) => {
    if (!storeId) {
      toast.addToast("Loja não encontrada", "error");
      return;
    }

    if (!formData.services || formData.services.length === 0) {
      toast.addToast("Selecione pelo menos um serviço", "error");
      return;
    }

    try {
      const scheduleData = {
        store_id: storeId,
        customer_id: String(formData.customer),
        employee_id: String(formData.professional),
        service_id: String(formData.services[0]),
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        total: formData.total || 0,
        duration: formData.duration || "00:00",
      };

      const { error } = await schedulesService.create(scheduleData as any);

      if (error) {
        toast.addToast(error, "error");
        return;
      }

      toast.addToast("Agendamento criado com sucesso!", "success");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.addToast("Erro ao criar agendamento", "error");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 sm:gap-4 h-full w-full overflow-x-hidden">
      <PageHeader
        title="Meus agendamentos"
        subtitle="Gerêncie seus agendamentos aqui."
      />

      <div className="flex-1 overflow-hidden">
        <Calendar
          key={refreshKey}
          storeId={storeId}
          onScheduleCreate={handleCreateSchedule}
          refreshTrigger={refreshKey}
        />
      </div>

      {storeId && (
        <OnboardingModal
          isOpen={showOnboarding}
          storeId={storeId}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};
