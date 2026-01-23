import { useFormContext } from "react-hook-form";
import { Switch, TimePicker } from "../form";

interface IStoreHourItemProps {
  name: string;
  label: string;
}

export const StoreHourItem: React.FC<IStoreHourItemProps> = ({
  name,
  label,
}) => {
  const { watch } = useFormContext();

  const isActive = watch(`${name}.active`);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-50 rounded">
      <div className="flex items-center gap-2">
        <Switch name={`${name}.active`} />
        <label
          htmlFor={`${name}.active`}
          className="text-xs sm:text-sm text-zinc-600 font-medium min-w-fit"
        >
          {label}
        </label>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        <TimePicker name={`${name}.start`} disabled={!isActive} />
        <span className="text-xs text-zinc-500">até</span>
        <TimePicker name={`${name}.end`} disabled={!isActive} />
      </div>
    </div>
  );
};
