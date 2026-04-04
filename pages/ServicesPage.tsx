
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useServiceSettings } from '../context/ServiceSettingsContext';
import { IconMap } from '../components/IconMap';
import PrinterIcon from '../components/icons/PrinterIcon';
import type { ServiceSetting } from '../types';

const iconColors = [
    { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    { bg: 'bg-pink-500/10', text: 'text-pink-400' },
    { bg: 'bg-sky-500/10', text: 'text-sky-400' },
    { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    { bg: 'bg-teal-500/10', text: 'text-teal-400' },
];

const ServiceCard: React.FC<{ service: ServiceSetting, colors: {bg: string, text: string} }> = ({ service, colors }) => {
  const Icon = IconMap[service.icon] || PrinterIcon;
  
  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-purple-500/10 hover:border-slate-700">
      <div className={`flex items-center justify-center h-14 w-14 rounded-xl mb-6 ${colors.bg}`}>
        {Icon ? <Icon className={`h-7 w-7 ${colors.text}`} /> : <span className={`h-7 w-7 ${colors.text}`}>?</span>}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{service.title}</h3>
      <p className="text-slate-400 mb-6 flex-grow">{service.description}</p>
      <Link to={service.link || '#'} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group">
          ACESSE AGORA <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
    </div>
  );
};


const ServicesPage: React.FC = () => {
  const { serviceSettings } = useServiceSettings();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Serviços</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
              Soluções completas em gráfica rápida, impressões e tecnologia para o seu dia a dia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceSettings.map((service, index) => (
              <ServiceCard key={service.id} service={service} colors={iconColors[index % iconColors.length]} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
