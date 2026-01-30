import { supabase } from "@/lib/supabase";

export interface AvailableTimesRequest {
  employee_id: string;
  service_ids: string[];
  date: string;
  store_id: string;
}

export interface TimeSlot {
  label: string;
  value: string;
}

export interface AvailableTimesResponse {
  success: boolean;
  availableTimes: TimeSlot[];
  totalDuration: number;
  storeHours?: {
    open: string;
    close: string;
  } | null;
  error?: string;
}

interface Appointment {
  scheduled_time: string;
  duration: string | null;
}

// Converte string "HH:MM" ou "HH:MM:SS" para minutos desde meia-noite
function timeToMinutes(time: string): number {
  const parts = time.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Converte minutos desde meia-noite para string "HH:MM"
function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Verifica se um slot colide com algum agendamento existente
function hasConflict(
  slotStart: number,
  slotEnd: number,
  appointments: Array<{ start: number; end: number }>,
): boolean {
  for (const apt of appointments) {
    // Há conflito se o slot começa antes do fim do agendamento E termina depois do início
    if (slotStart < apt.end && slotEnd > apt.start) {
      return true;
    }
  }
  return false;
}

export const schedulingService = {
  async getAvailableTimes(
    request: AvailableTimesRequest,
  ): Promise<AvailableTimesResponse> {
    try {
      const { employee_id, service_ids, date, store_id } = request;

      // Validações básicas
      if (!employee_id || !service_ids?.length || !date || !store_id) {
        return {
          success: false,
          availableTimes: [],
          totalDuration: 0,
          error: "Parâmetros inválidos",
        };
      }

      // Obtém o dia da semana (0=Domingo, 6=Sábado)
      const selectedDate = new Date(date + "T12:00:00");
      const dayOfWeek = selectedDate.getDay();

      // 1. Buscar horário de funcionamento da loja para o dia selecionado
      const { data: storeHours, error: storeHoursError } = await supabase
        .from("store_hours")
        .select("start_time, end_time, is_active")
        .eq("store_id", store_id)
        .eq("day_of_week", dayOfWeek)
        .single();

      if (storeHoursError) {
        console.error("Erro ao buscar horários da loja:", storeHoursError);
        return {
          success: false,
          availableTimes: [],
          totalDuration: 0,
          error: "Erro ao buscar horários de funcionamento",
        };
      }

      // Verifica se a loja está aberta neste dia
      if (
        !storeHours?.is_active ||
        !storeHours.start_time ||
        !storeHours.end_time
      ) {
        return {
          success: true,
          availableTimes: [],
          totalDuration: 0,
          storeHours: null,
          error: "Loja fechada neste dia",
        };
      }

      const storeOpenMinutes = timeToMinutes(storeHours.start_time);
      const storeCloseMinutes = timeToMinutes(storeHours.end_time);

      // 2. Buscar duração dos serviços selecionados
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, duration")
        .in("id", service_ids);

      if (servicesError) {
        console.error("Erro ao buscar serviços:", servicesError);
        return {
          success: false,
          availableTimes: [],
          totalDuration: 0,
          error: "Erro ao buscar serviços",
        };
      }

      if (!services || services.length === 0) {
        return {
          success: false,
          availableTimes: [],
          totalDuration: 0,
          error: "Serviços não encontrados",
        };
      }

      // Calcular duração total dos serviços selecionados
      const totalDuration = services.reduce((total, service) => {
        return total + timeToMinutes(service.duration);
      }, 0);

      // 3. Buscar agendamentos existentes do profissional na data selecionada
      const { data: existingAppointments, error: appointmentsError } =
        await supabase
          .from("schedules")
          .select("scheduled_time, duration")
          .eq("employee_id", employee_id)
          .eq("scheduled_date", date);

      if (appointmentsError) {
        console.error("Erro ao buscar agendamentos:", appointmentsError);
        return {
          success: false,
          availableTimes: [],
          totalDuration,
          error: "Erro ao buscar agendamentos existentes",
        };
      }

      // Converter agendamentos existentes para intervalos em minutos
      const bookedSlots = (existingAppointments || []).map(
        (apt: Appointment) => {
          const startMinutes = timeToMinutes(apt.scheduled_time);
          // Se não tiver duration, assume 30 minutos como padrão
          const durationMinutes = apt.duration
            ? timeToMinutes(apt.duration)
            : 30;
          return {
            start: startMinutes,
            end: startMinutes + durationMinutes,
          };
        },
      );

      // 4. Gerar slots de 30 em 30 minutos, filtrando os que têm conflito
      const availableTimes: TimeSlot[] = [];
      const slotInterval = 30; // Intervalo entre slots em minutos

      for (
        let slotStart = storeOpenMinutes;
        slotStart + totalDuration <= storeCloseMinutes;
        slotStart += slotInterval
      ) {
        const slotEnd = slotStart + totalDuration;

        // Verifica se este slot não conflita com nenhum agendamento existente
        if (!hasConflict(slotStart, slotEnd, bookedSlots)) {
          const timeStr = minutesToTime(slotStart);
          availableTimes.push({
            label: timeStr,
            value: timeStr,
          });
        }
      }

      return {
        success: true,
        availableTimes,
        totalDuration,
        storeHours: {
          open: minutesToTime(storeOpenMinutes),
          close: minutesToTime(storeCloseMinutes),
        },
      };
    } catch (err) {
      console.error("Error getting available times:", err);
      return {
        success: false,
        availableTimes: [],
        totalDuration: 0,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  },

  /**
   * Cria um novo agendamento
   */
  async createAppointment(data: {
    store_id: string;
    employee_id: string;
    service_ids: string[];
    scheduled_date: string;
    scheduled_time: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        store_id,
        employee_id,
        service_ids,
        scheduled_date,
        scheduled_time,
        customer,
      } = data;

      // 1. Buscar ou criar o cliente
      let customerId: string;

      // Verifica se já existe um cliente com esse email na loja
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("store_id", store_id)
        .eq("email", customer.email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;

        // Atualiza os dados do cliente
        await supabase
          .from("customers")
          .update({
            name: customer.name,
            phone: customer.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      } else {
        // Cria um novo cliente
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            store_id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          })
          .select("id")
          .single();

        if (customerError || !newCustomer) {
          console.error("Erro ao criar cliente:", customerError);
          return { success: false, error: "Erro ao criar cliente" };
        }

        customerId = newCustomer.id;
      }

      // 2. Buscar informações dos serviços para calcular duração e valor total
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, duration, value")
        .in("id", service_ids);

      if (servicesError || !services || services.length === 0) {
        console.error("Erro ao buscar serviços:", servicesError);
        return { success: false, error: "Erro ao buscar serviços" };
      }

      // Calcula duração e valor total
      let totalMinutes = 0;
      let totalValue = 0;

      for (const service of services) {
        const [hours, minutes] = service.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
        totalValue += Number(service.value);
      }

      const totalDuration = minutesToTime(totalMinutes);

      // 3. Criar o agendamento (usando o primeiro serviço como referência)
      const { error: scheduleError } = await supabase.from("schedules").insert({
        store_id,
        customer_id: customerId,
        employee_id,
        service_id: service_ids[0], // Usa o primeiro serviço como referência
        scheduled_date,
        scheduled_time,
        duration: totalDuration,
        total: totalValue,
        completed: false,
      });

      if (scheduleError) {
        console.error("Erro ao criar agendamento:", scheduleError);
        return { success: false, error: "Erro ao criar agendamento" };
      }

      return { success: true };
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  },
};
