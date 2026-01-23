import { IlamyCalendar, useIlamyCalendarContext } from "@ilamy/calendar";
import "dayjs/locale/pt-br";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import moment from "moment";
import { Button } from "../ui/button";
import { useMemo, useState, useEffect } from "react";
import { UpsertSchedulingModal } from "./UpsertSchedulingModal";
import { schedulesService } from "@/services/schedulesService";

const CalendarHeader: React.FC<{ onNewSchedulingClick: () => void }> = ({
  onNewSchedulingClick,
}) => {
  const { prevPeriod, nextPeriod, view, setView, currentDate, today } =
    useIlamyCalendarContext();

  const currentDateText = useMemo(() => {
    if (view === "month") {
      return currentDate.startOf("month").format("MMMM [de] YYYY");
    }

    if (view === "week") {
      const startOfWeek = currentDate.startOf("week").format("DD [de] MMM");
      const endOfWeek = currentDate.endOf("week").format("DD [de] MMM YYYY");
      return `${startOfWeek} - ${endOfWeek}`;
    }

    if (view === "day") {
      return currentDate.format("DD [de] MMMM YYYY");
    }

    return "";
  }, [currentDate, view]);

  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <ChevronLeft
            className="cursor-pointer text-zinc-500 flex-shrink-0"
            size={18}
            onClick={() => prevPeriod()}
          />
          <span className="text-sm sm:text-base truncate">
            {currentDateText}
          </span>
          <ChevronRight
            className="cursor-pointer text-zinc-500 flex-shrink-0"
            size={18}
            onClick={() => nextPeriod()}
          />
        </div>
        <Button
          className="ml-auto flex-shrink-0 text-xs sm:text-sm"
          onClick={onNewSchedulingClick}
        >
          <Plus size={16} className="sm:size-5" />
          <span className="hidden sm:inline">Agendamento</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Button
          variant={view === "day" ? "default" : "outline"}
          onClick={() => setView("day")}
          size="sm"
          className="text-xs"
        >
          Dia
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          onClick={() => setView("week")}
          size="sm"
          className="text-xs"
        >
          Semana
        </Button>
        <Button
          variant={view === "month" ? "default" : "outline"}
          onClick={() => setView("month")}
          size="sm"
          className="text-xs"
        >
          Mês
        </Button>

        <Button
          variant="secondary"
          onClick={() => today()}
          size="sm"
          className="text-xs"
        >
          Hoje
        </Button>
      </div>
    </div>
  );
};

export const Calendar: React.FC<{
  storeId: string | null;
  onScheduleCreate?: (data: any) => void;
  refreshTrigger?: number;
}> = ({ storeId, onScheduleCreate, refreshTrigger = 0 }) => {
  const [schedulingModalIsOpen, setSchedulingModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<any | undefined>(
    undefined,
  );
  const [events, setEvents] = useState<any[]>([]);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  const loadSchedules = async () => {
    if (!storeId) return;

    const { data, error } = await schedulesService.getAll(storeId);

    if (error) {
      console.error("Error loading schedules:", error);
      return;
    }

    if (data && Array.isArray(data)) {
      const transformedEvents = data.map((schedule: any) => {
        const dateStr = schedule.scheduled_date;
        const timeStr = schedule.scheduled_time || "00:00:00";
        const combinedStr = `${dateStr} ${timeStr}`;

        const scheduleDatetime = moment(combinedStr, "YYYY-MM-DD HH:mm:ss");

        // Ensure services is always an array
        const servicesArray = Array.isArray(schedule.services)
          ? schedule.services
          : schedule.services
            ? [schedule.services]
            : [];

        const durationMinutes = (servicesArray.length || 1) * 60;

        return {
          id: schedule.id,
          title: schedule.customers?.name || "Agendamento",
          start: scheduleDatetime.toDate(),
          end: scheduleDatetime.add(durationMinutes, "minutes").toDate(),
          color: "white",
          backgroundColor: "#222",
          data: {
            customerId: schedule.customer_id,
            customer: schedule.customers?.name,
            professionalId: schedule.employee_id,
            professional: schedule.employees?.name,
            services: servicesArray.map((s: any) => s.name).join(", "),
            serviceIds: servicesArray.map((s: any) => s.id),
          },
          rawSchedule: schedule,
        };
      });

      setEvents(transformedEvents);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [storeId, refreshTrigger, localRefreshTrigger]);

  const handleSchedulingConfirm = (data: any) => {
    console.log("Novo agendamento:", data);
    onScheduleCreate?.(data);
    setSchedulingModalIsOpen(false);
  };

  const handleScheduleDelete = () => {
    // Reset selected states and reload schedules
    setSelectedDate(undefined);
    setSelectedSchedule(undefined);
    // Trigger a refresh
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  const handleEventClick = (eventData: any) => {
    setSelectedSchedule(eventData);
    setSelectedDate(undefined);
    setSchedulingModalIsOpen(true);
  };

  return (
    <div className="h-full">
      <IlamyCalendar
        locale="pt-br"
        stickyViewHeader
        dayMaxEvents={2}
        headerComponent={
          <CalendarHeader
            onNewSchedulingClick={() => setSchedulingModalIsOpen(true)}
          />
        }
        disableDragAndDrop
        businessHours={{
          startTime: 9,
          endTime: 18,
        }}
        onCellClick={(a) => {
          setSelectedDate(a.start.toDate());
          setSelectedSchedule(undefined);
          setSchedulingModalIsOpen(true);
        }}
        onEventClick={(eventData) => {
          const event = events.find((e) => e.id === eventData.id);
          if (event) {
            handleEventClick(event);
          }
        }}
        events={events}
        timeFormat="24-hour"
      />

      <UpsertSchedulingModal
        isOpen={schedulingModalIsOpen}
        onClose={() => {
          setSchedulingModalIsOpen(false);
          setSelectedDate(undefined);
          setSelectedSchedule(undefined);
        }}
        onConfirmClick={handleSchedulingConfirm}
        selectedDate={selectedDate}
        storeId={storeId}
        selectedSchedule={selectedSchedule}
        onDelete={handleScheduleDelete}
      />
    </div>
  );
};
