import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ISelectProps {
  name?: string;
  label?: string;
  placeholder?: string;
  options: Array<{ id: string | number; name: string; label?: string }>;
}

export const Select: React.FC<ISelectProps> = ({
  name,
  label,
  placeholder,
  options,
}) => {
  const { control } = useFormContext();

  if (!name) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label htmlFor={name} className="text-xs sm:text-sm">
            {label}
          </Label>
        )}
        <SelectComponent>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            {options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label || option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectComponent>
      </div>
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1 w-full">
          {label && (
            <Label htmlFor={name} className="text-xs sm:text-sm">
              {label}
            </Label>
          )}
          <SelectComponent
            value={field.value || ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.label || option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>
          {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
