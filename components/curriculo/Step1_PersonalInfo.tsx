
import React from 'react';

const Step1_Intro: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-3">Vamos criar um currículo de destaque!</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Em poucos passos, você terá um documento profissional pronto para impressionar.
            </p>
            <button 
                onClick={onNext}
                className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-700 transition-colors text-lg"
            >
                Começar Agora
            </button>
        </div>
    );
};

export default Step1_Intro;
