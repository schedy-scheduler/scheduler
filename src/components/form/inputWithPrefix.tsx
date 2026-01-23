import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { Input as InputComponent } from "../ui/input";
import React from "react";

interface IInputWithPrefixProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  name?: string;
  label?: string;
  prefix?: string;
}

export const InputWithPrefix: React.FC<IInputWithPrefixProps> = ({
  name,
  label,
  prefix,
  ...props
}) => {
  const { control } = useFormContext();

  const InputField = (
    <div className="flex items-center w-full h-full">
      {prefix && (
        <span className="flex items-center h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 whitespace-nowrap">
          {prefix}
        </span>
      )}
      <InputComponent
        id={name}
        className={`${prefix ? "rounded-l-none" : ""} text-sm`}
        {...props}
      />
    </div>
  );

  if (!name) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label htmlFor={name} className="text-xs sm:text-sm">
            {label}
          </Label>
        )}
        {InputField}
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
          <div className="flex items-center w-full">
            {prefix && (
              <span className="flex items-center h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 whitespace-nowrap">
                {prefix}
              </span>
            )}
            <InputComponent
              id={name}
              className={`${prefix ? "rounded-l-none" : ""} text-sm`}
              {...field}
              {...props}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
};
