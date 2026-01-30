import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ValidationError, type ObjectSchema } from "yup";

interface Step {
  label: string;
  component: React.ReactNode;
  schema?: ObjectSchema<Record<string, unknown>>;
  fields?: string[];
}

interface FormStepsProps {
  steps: Step[];
  onComplete?: () => void;
  validateStep?: boolean;
  isSubmitting?: boolean;
}

export const FormSteps: React.FC<FormStepsProps> = ({
  steps,
  onComplete,
  validateStep = true,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { trigger, getValues, setError, clearErrors } = useFormContext();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (validateStep) {
      const step = steps[currentStep];

      // Se o step tem um schema específico, valida com ele
      if (step.schema) {
        // Limpa erros anteriores dos campos do step
        if (step.fields) {
          step.fields.forEach((field) => clearErrors(field));
        }

        try {
          const values = getValues();
          await step.schema.validate(values, { abortEarly: false });
        } catch (validationError) {
          // Verifica se é um ValidationError do Yup
          if (validationError instanceof ValidationError) {
            // Processa cada erro interno
            validationError.inner.forEach((err) => {
              if (err.path) {
                setError(err.path, {
                  type: "manual",
                  message: err.message,
                });
              }
            });

            // Se não tem inner errors mas tem path, usa o erro principal
            if (validationError.inner.length === 0 && validationError.path) {
              setError(validationError.path, {
                type: "manual",
                message: validationError.message,
              });
            }
          }
          return;
        }
      }
      // Se o step tem campos específicos, valida apenas eles
      else if (step.fields && step.fields.length > 0) {
        const isValid = await trigger(step.fields);
        if (!isValid) return;
      }
      // Caso contrário, valida todos os campos
      else {
        const isValid = await trigger();
        if (!isValid) return;
      }
    }

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Step Indicators */}
      <div className="px-6 py-6 flex w-full justify-center items-center">
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${
                  index <= currentStep
                    ? "bg-zinc-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 rounded-full h-1 mx-2 transition-colors ${
                    index < currentStep ? "bg-zinc-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Title */}
      <div className="px-6 py-3">
        <h2 className="text-sm font-semibold text-center text-gray-900">
          {steps[currentStep]?.label}
        </h2>
      </div>

      {/* Step Content */}
      <div className="w-full overflow-y-auto px-6 py-4">
        {steps[currentStep]?.component}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isSubmitting}
          className="text-sm sm:text-base"
        >
          Anterior
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="text-sm sm:text-base"
        >
          {isSubmitting
            ? "Aguarde..."
            : isLastStep
              ? "Confirmar agendamento"
              : "Próximo"}
        </Button>
      </div>
    </div>
  );
};
