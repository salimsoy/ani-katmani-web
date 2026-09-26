import { Check } from "lucide-react";

type Step = {
  label: string;
  done: boolean;
};

type Props = {
  steps: Step[];
  className?: string;
};

export default function Stepper({ steps, className = "" }: Props) {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const connectorLit = !isLast && steps[idx + 1].done;
        return (
          <div key={step.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step.done ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.done ? <Check size={13} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-semibold text-center w-16 ${
                  step.done ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${connectorLit ? "bg-orange-500" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
