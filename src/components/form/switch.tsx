import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import React from "react";

interface ISwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
}

const SwitchUI = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ ...rest }, ref) => (
  <label className="relative inline-flex items-center cursor-pointer select-none">
    <input type="checkbox" ref={ref} className="sr-only peer" {...rest} />
    <span className="w-11 h-6 bg-gray-300 peer-checked:bg-primary rounded-full transition-colors duration-300 peer-focus:ring-0 peer-focus:ring-primary/40 dark:bg-gray-700 dark:peer-checked:bg-primary relative">
      <span
        className={`absolute top-1 ${
          rest?.checked ? "right-1" : "left-1"
        } w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5`}
      />
    </span>
  </label>
));

export const Switch: React.FC<ISwitchProps> = ({ name, label, ...props }) => {
  const { control } = useFormContext();

  if (!name) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <Label htmlFor={name} className="text-xs sm:text-sm">
            {label}
          </Label>
        )}
        <SwitchUI id={name} {...props} />
      </div>
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col gap-1">
          {label && (
            <Label htmlFor={name} className="text-xs sm:text-sm">
              {label}
            </Label>
          )}
          <SwitchUI
            id={name}
            checked={field.value}
            onChange={field.onChange}
            {...props}
          />
          {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
