import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { MultiSelect, Select } from "@/components/form";
import {
  storeService,
  type Employee,
  type Service,
} from "@/services/storeService";

export const Step1: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { watch } = useFormContext<{ services: string[] }>();
  const [professionals, setProfessionals] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedServices = watch("services");

  const { totalDuration, totalValue } = useMemo(() => {
    if (!selectedServices || selectedServices.length === 0) {
      return { totalDuration: "00:00", totalValue: 0 };
    }

    let totalMinutes = 0;
    let value = 0;

    for (const serviceId of selectedServices) {
      const service = servicesData.find((s) => s.id === serviceId);
      if (service) {
        // Converte duração "HH:MM" para minutos
        const [hours, minutes] = service.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
        value += Number(service.value);
      }
    }

    // Converte minutos totais de volta para "HH:MM"
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    return { totalDuration: duration, totalValue: value };
  }, [selectedServices, servicesData]);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        // Get store ID first
        const storeId = await storeService.getStoreIdBySlug(slug);
        if (!storeId) {
          setLoading(false);
          return;
        }

        // Fetch employees and services in parallel
        const [employees, servicesList] = await Promise.all([
          storeService.getEmployeesByStoreId(storeId),
          storeService.getServicesByStoreId(storeId),
        ]);

        // Transform employees to select options
        const professionalOptions = employees.map((employee: Employee) => ({
          id: employee.id,
          name: employee.name,
        }));
        setProfessionals(professionalOptions);

        // Transform services to select options
        const servicesOptions = servicesList.map((service: Service) => ({
          id: service.id,
          name: service.name,
        }));
        setServices(servicesOptions);
        setServicesData(servicesList);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Select
        name="professional"
        options={[
          { id: 0, name: "none", label: "Sem preferência" },
          ...professionals,
        ]}
        label="Profissional"
        placeholder="Selecione um profissional"
      />

      <MultiSelect
        name="services"
        options={services}
        label="Serviços"
        placeholder="Selecione os serviços"
      />

      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Duração</span>
          <span className="text-sm font-medium">{totalDuration}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">Valor total</span>
          <span className="text-sm font-medium">
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
