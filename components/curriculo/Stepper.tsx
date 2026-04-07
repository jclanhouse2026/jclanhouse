
import React from 'react';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

const stepLabels = [
    'Início', 'Básico', 'Local', 'Detalhes', 'Experiência', 
    'Formação', 'Qualificações', 'Idiomas', 'Resumo', 'Finalizar'
];

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="w-full px-4 sm:px-0">
            <div className="flex items-center">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <React.Fragment key={stepNumber}>
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                                        isActive
                                            ? 'bg-cyan-500 text-white ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900'
                                            : isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                    }`}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </div>
                                <p className={`mt-2 text-[10px] sm:text-xs font-semibold transition-colors duration-300 hidden sm:block ${
                                    isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                    {stepLabels[index]}
                                </p>
                            </div>
                            {stepNumber < totalSteps && (
                                <div className={`flex-1 h-1 mx-1 sm:mx-2 transition-colors duration-500 ${
                                    isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;