import { Input, InputWithPrefix } from "@/components/form";
import { PageHeader } from "@/components/PageHeader";
import { StoreHourItem } from "@/components/store/StoreHourItem";
import { Button } from "@/components/ui/button";
import { STORE_WEEK_DAYS } from "@/constants/store";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { storeService } from "@/services/storeService";
import { storeHoursService } from "@/services/storeHoursService";
import { useToast } from "@/hooks/useToast";

interface StoreFormData {
  name: string;
  email: string;
  phone: string;
  slug: string;
  hours: Record<string, { active: boolean; start: string; end: string }>;
}

export const Store: React.FC = () => {
  const toast = useToast();
  const [storeId, setStoreId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<StoreFormData>({
    values: {
      name: "",
      email: "",
      phone: "",
      slug: "",
      hours: {
        sunday: { active: false, start: "00:00", end: "00:00" },
        monday: { active: true, start: "09:00", end: "18:00" },
        tuesday: { active: true, start: "09:00", end: "18:00" },
        wednesday: { active: true, start: "09:00", end: "18:00" },
        thursday: { active: true, start: "09:00", end: "18:00" },
        friday: { active: true, start: "09:00", end: "18:00" },
        saturday: { active: false, start: "00:00", end: "00:00" },
      },
    },
  });

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    const userResult = await authService.getCurrentUser();
    if (userResult.data?.id) {
      const storeResult = await storeService.getByOwnerId(userResult.data.id);
      if (storeResult.data) {
        setStoreId(storeResult.data.id);

        // Load store data
        form.reset({
          name: storeResult.data.name,
          email: storeResult.data.email,
          phone: storeResult.data.phone,
          slug: storeResult.data.slug,
          hours: form.getValues().hours,
        });

        // Load store hours
        const hoursResult = await storeHoursService.getAll(storeResult.data.id);
        if (hoursResult.data) {
          const hoursMap: Record<
            string,
            { active: boolean; start: string; end: string }
          > = {
            sunday: { active: false, start: "00:00", end: "00:00" },
            monday: { active: false, start: "00:00", end: "00:00" },
            tuesday: { active: false, start: "00:00", end: "00:00" },
            wednesday: { active: false, start: "00:00", end: "00:00" },
            thursday: { active: false, start: "00:00", end: "00:00" },
            friday: { active: false, start: "00:00", end: "00:00" },
            saturday: { active: false, start: "00:00", end: "00:00" },
          };

          const dayNames = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ];
          hoursResult.data.forEach((hour) => {
            const dayName = dayNames[hour.day_of_week];
            if (dayName) {
              hoursMap[dayName] = {
                active: hour.is_active || false,
                start: hour.start_time || "00:00",
                end: hour.end_time || "00:00",
              };
            }
          });

          form.reset({
            name: storeResult.data.name,
            email: storeResult.data.email,
            phone: storeResult.data.phone,
            slug: storeResult.data.slug,
            hours: hoursMap,
          });
        }
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSaving(true);

    try {
      // Update store data
      await storeService.update(storeId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        slug: data.slug,
      });

      // Update store hours
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      for (let i = 0; i < dayNames.length; i++) {
        const dayName = dayNames[i];
        const hourData = data.hours[dayName];
        await storeHoursService.upsertDay(storeId, i, {
          store_id: storeId,
          day_of_week: i,
          is_active: hourData.active,
          start_time: hourData.active ? hourData.start : null,
          end_time: hourData.active ? hourData.end : null,
        });
      }

      toast.addToast("Estabelecimento atualizado com sucesso!", "success");
    } catch (error) {
      toast.addToast("Erro ao atualizar estabelecimento", "error");
    } finally {
      setIsSaving(false);
    }
  });

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        Carregando...
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        className="w-full flex flex-col gap-4 sm:gap-5"
        onSubmit={handleSubmit}
      >
        <PageHeader
          title="Meu estabelecimento"
          subtitle="Gerêncie seu estabelecimento."
        />

        <div className="w-full border p-3 sm:p-4 rounded-lg flex flex-col gap-3 sm:gap-4">
          <strong className="font-semibold text-xs sm:text-sm text-zinc-600">
            Dados do estabelecimento
          </strong>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 w-full">
            <div className="flex-1">
              <Input
                name="name"
                label="Nome"
                placeholder="Nome do estabelecimento"
              />
            </div>
            <div className="flex-1">
              <Input
                name="email"
                label="E-mail"
                placeholder="E-mail do estabelecimento"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 w-full">
            <div className="flex-1">
              <Input
                name="phone"
                label="Telefone"
                placeholder="Telefone do estabelecimento"
              />
            </div>
            <div className="flex-1">
              <InputWithPrefix
                name="slug"
                label="Prefixo"
                placeholder="Link para seu calendário"
                prefix="https://calendario.com/"
              />
            </div>
          </div>
        </div>

        <div className="w-full border p-3 sm:p-4 rounded-lg flex flex-col gap-3 sm:gap-4">
          <strong className="font-semibold text-xs sm:text-sm text-zinc-600">
            Horário de funcionamento
          </strong>

          <div className="flex flex-col gap-2">
            {STORE_WEEK_DAYS?.map((day) => (
              <StoreHourItem
                key={day.value}
                name={`hours.${day.value}`}
                label={day.label}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
