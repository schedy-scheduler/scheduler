import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { Input, Select } from "@/components/form";
import { useToast } from "@/hooks/useToast";
import { schedulingService } from "@/services/schedulingService";
import { storeService } from "@/services/storeService";
import dayjs from "dayjs";
import type { SchedulerFormContext } from "@/pages/scheduler";

export const Step2: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToast();
  const { watch, setValue } = useFormContext<SchedulerFormContext>();
  const [availableTimes, setAvailableTimes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const professional = watch("professional");
  const services = watch("services");
  const date = watch("date");

  // Data mínima para agendamento (hoje)
  const minDate = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  // Buscar store ID ao montar
  useEffect(() => {
    const getStoreId = async () => {
      if (!slug) return;
      const id = await storeService.getStoreIdBySlug(slug);
      setStoreId(id);
    };
    getStoreId();
  }, [slug]);

  // Limpar horário quando a data mudar
  useEffect(() => {
    setValue("time", "");
  }, [date, setValue]);

  // Buscar horários disponíveis quando data, profissional ou serviços mudarem
  useEffect(() => {
    const loadAvailableTimes = async () => {
      // Validações
      if (!professional) {
        setAvailableTimes([]);
        setStatusMessage("Selecione um profissional");
        return;
      }

      if (!services || services.length === 0) {
        setAvailableTimes([]);
        setStatusMessage("Selecione pelo menos um serviço");
        return;
      }

      if (!date) {
        setAvailableTimes([]);
        setStatusMessage("Selecione uma data");
        return;
      }

      if (!storeId) {
        return;
      }

      setStatusMessage("");
      setLoadingTimes(true);
      try {
        const response = await schedulingService.getAvailableTimes({
          employee_id: professional,
          service_ids: services,
          date: date,
          store_id: storeId,
        });

        if (response.success) {
          // Converte TimeSlot para formato do Select (id, name)
          const formattedTimes = response.availableTimes.map((slot) => ({
            id: slot.value,
            name: slot.label,
          }));
          setAvailableTimes(formattedTimes);
          if (formattedTimes.length === 0) {
            if (response.storeHours === null) {
              setStatusMessage("Estabelecimento fechado neste dia");
            } else {
              setStatusMessage("Nenhum horário disponível para esta data");
            }
          } else {
            setStatusMessage(
              `${formattedTimes.length} horário${formattedTimes.length > 1 ? "s" : ""} disponível${formattedTimes.length > 1 ? "is" : ""}`,
            );
          }
        } else {
          addToast(response.error || "Erro ao buscar horários", "error");
          setAvailableTimes([]);
          setStatusMessage(response.error || "Erro ao buscar horários");
        }
      } catch (err) {
        console.error("Error loading available times:", err);
        addToast("Erro ao buscar horários disponíveis", "error");
        setAvailableTimes([]);
        setStatusMessage("Erro ao buscar horários");
      } finally {
        setLoadingTimes(false);
      }
    };

    loadAvailableTimes();
  }, [professional, services, date, storeId, addToast]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        name="date"
        type="date"
        label="Data"
        placeholder="Selecione a data"
        min={minDate}
      />
      <div className="flex flex-col gap-1">
        <Select
          name="time"
          placeholder={
            loadingTimes ? "Carregando horários..." : "Selecione o horário"
          }
          label="Horário"
          options={availableTimes}
          disabled={loadingTimes || availableTimes.length === 0}
        />
        {statusMessage && !loadingTimes && (
          <p
            className={`text-xs ${availableTimes.length > 0 ? "text-green-600" : "text-gray-500"}`}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
