import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { Input as InputComponent } from "../ui/input";
import { cn } from "@/lib/utils";

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
}

export const Input: React.FC<IInputProps> = ({ name, label, ...props }) => {
  const { control } = useFormContext();

  if (!name) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label htmlFor={name} className="text-xs sm:text-sm">
            {label}
          </Label>
        )}
        <InputComponent
          id={name}
          {...props}
          className={cn("text-sm", props.className)}
        />
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
          <InputComponent
            id={name}
            {...field}
            {...props}
            className={cn("text-sm", props.className)}
          />
          {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
