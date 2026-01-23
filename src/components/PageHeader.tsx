import type { ReactNode } from "react";

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  buttons?: ReactNode[];
}> = ({ title, subtitle, buttons }) => {
  return (
    <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col">
        <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
        <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
      </div>

      {buttons?.length ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {buttons.map((button, index) => (
            <div key={index} className="w-full sm:w-auto">
              {button}
            </div>
          ))}
        </div>
      ) : undefined}
    </div>
  );
};
