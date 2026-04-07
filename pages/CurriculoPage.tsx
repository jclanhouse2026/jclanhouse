import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Stepper from '../components/curriculo/Stepper';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { useCustomers } from '../context/CustomerContext';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';

// Import step components
import Step1_Intro from '../components/curriculo/steps/Step1_Intro';
import Step2_BasicInfo from '../components/curriculo/steps/Step2_BasicInfo';
import Step3_Location from '../components/curriculo/steps/Step3_Location';
import Step4_Details from '../components/curriculo/steps/Step4_Details';
import Step5_Summary from '../components/curriculo/steps/Step5_Summary';
import Step6_Experience from '../components/curriculo/steps/Step6_Experience';
import Step7_Education from '../components/curriculo/steps/Step7_Education';
import Step8_Skills from '../components/curriculo/steps/Step8_Skills';
import Step9_Languages from '../components/curriculo/steps/Step9_Languages';
import Step10_Finalize from '../components/curriculo/steps/Step10_Finalize';

const CurriculoPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const totalSteps = 10;
    const { loadResumeIntoBuilder, getRequestById, resumeData, importProfileData } = useResume();
    const { customersForCurrentUser } = useCustomers();

    useEffect(() => {
        if (!user) return; // Don't run this effect if user is not logged in
        const params = new URLSearchParams(location.search);
        const requestId = params.get('requestId');
        if (requestId) {
            const request = getRequestById(requestId);
            if (request) {
                loadResumeIntoBuilder(request.resumeData);
                 // Start at the final step if editing
                setStep(10);
            }
        } else {
            // If it's a new resume and user is logged in, try to import profile data
            if (customersForCurrentUser.length > 0) {
                const customer = customersForCurrentUser[0];
                // Only pre-fill if the name is still the default one or empty
                if (resumeData.profile.name === 'Seu Nome Completo' || resumeData.profile.name === '') {
                    importProfileData(customer);
                }
            }
        }
    }, [location.search, getRequestById, loadResumeIntoBuilder, user, customersForCurrentUser, importProfileData, resumeData.profile.name]);


    const nextStep = () => {
        setDirection('forward');
        setStep(prev => Math.min(prev + 1, totalSteps));
    };
    const prevStep = () => {
        setDirection('backward');
        setStep(prev => Math.max(prev - 1, 1));
    };
    
    const renderStep = () => {
        const key = `${step}-${direction}`;
        let animationClass = '';
        if (direction === 'forward') {
            animationClass = 'animate-[slide-in_0.5s_ease-in-out]';
        } else {
            animationClass = 'animate-[slide-in-reverse_0.5s_ease-in-out]';
        }

        const stepContent = () => {
            switch(step) {
                case 1: return <Step1_Intro onNext={nextStep} />;
                case 2: return <Step2_BasicInfo />;
                case 3: return <Step3_Location />;
                case 4: return <Step4_Details />;
                case 5: return <Step6_Experience />;
                case 6: return <Step7_Education />;
                case 7: return <Step8_Skills />;
                case 8: return <Step9_Languages />;
                case 9: return <Step5_Summary />;
                case 10: return <Step10_Finalize />;
                default: return <Step1_Intro onNext={nextStep} />;
            }
        };

        return <div key={key} className={animationClass}>{stepContent()}</div>
    }

    if (!user) {
        return (
             <div className="min-h-screen bg-slate-900 flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
                    <div className="max-w-lg w-full text-center bg-slate-800 p-8 rounded-xl border border-slate-700">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-cyan-500 mb-4" />
                        <h1 className="text-2xl font-bold text-white">Acesse sua Conta para Começar</h1>
                        <p className="text-slate-400 mt-2 mb-6">Para criar e salvar seu currículo, você precisa estar logado.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => navigate('/login', { state: { from: location } })}
                                className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700"
                            >
                                Fazer Login
                            </button>
                             <button 
                                onClick={() => navigate('/register', { state: { from: location } })}
                                className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600"
                            >
                                Criar Conta
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col overflow-x-hidden">
             <style>{`
                @keyframes slide-in {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-in-reverse {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    <Stepper currentStep={step} totalSteps={totalSteps} />

                    <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-4 sm:p-8 mt-8 min-h-[400px] flex flex-col justify-center">
                        {renderStep()}
                    </div>

                    {step > 1 && (
                         <div className="flex justify-between items-center mt-8">
                            <button 
                                onClick={prevStep} 
                                className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            {step < totalSteps && (
                                <button 
                                    onClick={nextStep} 
                                    className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors"
                                >
                                    Próximo
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CurriculoPage;