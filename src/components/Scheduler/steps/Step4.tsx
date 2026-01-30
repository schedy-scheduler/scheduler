import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import {
  storeService,
  type Employee,
  type Service,
} from "@/services/storeService";
import type { SchedulerFormContext } from "@/pages/scheduler";
import { formatPhone } from "@/utils/formatPhone";
import dayjs from "dayjs";

export const Step4: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { watch } = useFormContext<SchedulerFormContext>();
  const [professionals, setProfessionals] = useState<Employee[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const formValues = watch();

  // Buscar dados da loja
  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const storeId = await storeService.getStoreIdBySlug(slug);
        if (!storeId) {
          setLoading(false);
          return;
        }

        const [employees, services] = await Promise.all([
          storeService.getEmployeesByStoreId(storeId),
          storeService.getServicesByStoreId(storeId),
        ]);

        setProfessionals(employees);
        setServicesData(services);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Calcula duração e valor total
  const { totalDuration, totalValue, selectedServicesNames } = useMemo(() => {
    if (!formValues.services || formValues.services.length === 0) {
      return {
        totalDuration: "00:00",
        totalValue: 0,
        selectedServicesNames: [],
      };
    }

    let totalMinutes = 0;
    let value = 0;
    const names: string[] = [];

    for (const serviceId of formValues.services) {
      const service = servicesData.find((s) => s.id === serviceId);
      if (service) {
        const [hours, minutes] = service.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
        value += Number(service.value);
        names.push(service.name);
      }
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    return {
      totalDuration: duration,
      totalValue: value,
      selectedServicesNames: names,
    };
  }, [formValues.services, servicesData]);

  // Busca nome do profissional
  const professionalName = useMemo(() => {
    const professional = professionals.find(
      (p) => p.id === formValues.professional,
    );
    return professional?.name || "Não selecionado";
  }, [formValues.professional, professionals]);

  // Formata a data
  const formattedDate = useMemo(() => {
    if (!formValues.date) return "Não selecionada";
    return dayjs(formValues.date).format("DD/MM/YYYY");
  }, [formValues.date]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Serviços e Profissional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Serviço e Profissional
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Profissional</span>
            <span className="text-sm font-medium">{professionalName}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-500">Serviços</span>
            <div className="text-right">
              {selectedServicesNames.length > 0 ? (
                selectedServicesNames.map((name, index) => (
                  <span key={index} className="text-sm font-medium block">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium">Nenhum selecionado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data e Horário */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Data e Horário
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Data</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Horário</span>
            <span className="text-sm font-medium">
              {formValues.time || "Não selecionado"}
            </span>
          </div>
        </div>
      </div>

      {/* Seus Dados */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Seus Dados</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Nome</span>
            <span className="text-sm font-medium">
              {formValues.name || "Não informado"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium">
              {formValues.email || "Não informado"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Telefone</span>
            <span className="text-sm font-medium">
              {formValues.phone
                ? formatPhone(formValues.phone)
                : "Não informado"}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo do Valor */}
      <div className="bg-zinc-700 text-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Duração total</span>
          <span className="text-sm font-medium">{totalDuration}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Valor total</span>
          <span className="text-lg font-bold">
            {totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
