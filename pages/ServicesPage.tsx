
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

  const coreServices = [
    {
      id: 'caderneta',
      title: 'Caderneta de Vacina',
      description: 'Personalize a caderneta de vacina com o tema favorito da criança. Capa dura, laminação e miolo atualizado.',
      icon: 'BookIcon',
      link: '/caderneta',
      buttonText: 'ESCOLHER TEMA',
      color: { bg: 'bg-orange-500/10', text: 'text-orange-400' }
    },
    {
      id: 'adesivos-escolares',
      title: 'Adesivos Escolares',
      description: 'Kits de adesivos escolares personalizados com o tema favorito da criança. Material à prova d\'água.',
      icon: 'TagIcon',
      link: '/temas-escolares',
      buttonText: 'ESCOLHER TEMA',
      color: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' }
    },
    {
      id: 'canecas',
      title: 'Canecas Personalizadas',
      description: 'Canecas de cerâmica ou polímero personalizadas com fotos, frases ou temas especiais para presente.',
      icon: 'PhotographIcon',
      link: '/temas-canecas',
      buttonText: 'ESCOLHER TEMA',
      color: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' }
    },
    {
      id: 'impressao',
      title: 'Impressão e Cópias',
      description: 'Impressões e cópias em alta qualidade, preto e branco ou colorido. Diversos tipos de papel e acabamentos.',
      icon: 'PrinterIcon',
      link: '/impressao',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-sky-500/10', text: 'text-sky-400' }
    },
    {
      id: 'adesivos-personalizados',
      title: 'Adesivos Personalizados',
      description: 'Adesivos para festas, eventos ou identificação. Diversos formatos, tamanhos e materiais de alta durabilidade.',
      icon: 'SparklesIcon',
      link: '/adesivos-personalizados',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-pink-500/10', text: 'text-pink-400' }
    },
    {
      id: 'encadernacao',
      title: 'Encadernação',
      description: 'Encadernação em espiral para apostilas, documentos, trabalhos escolares e apresentações profissionais.',
      icon: 'DocumentIcon',
      link: '/apostila',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-rose-500/10', text: 'text-rose-400' }
    },
    {
      id: 'curriculo',
      title: 'Currículos',
      description: 'Criação e formatação de currículos profissionais para destacar seu perfil no mercado de trabalho.',
      icon: 'DocumentTextIcon',
      link: '/curriculo',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-teal-500/10', text: 'text-teal-400' }
    },
    {
      id: 'cartoes-visita',
      title: 'Cartões de Visita',
      description: 'Cartões de visita personalizados para profissionais e empresas. Alta qualidade de impressão e design.',
      icon: 'CreditCardIcon',
      link: '/cartoes-visita',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
    },
    {
      id: 'panfletos',
      title: 'Panfletos e Flyers',
      description: 'Divulgue seu negócio com panfletos e flyers de alta qualidade, design impactante e cores vibrantes.',
      icon: 'PhotographIcon',
      link: '/panfletos',
      buttonText: 'ACESSE AGORA',
      color: { bg: 'bg-amber-500/10', text: 'text-amber-400' }
    }
  ];

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
            {coreServices.map((service) => {
              const Icon = IconMap[service.icon] || PrinterIcon;
              return (
                <div key={service.id} className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-cyan-500/10 hover:border-slate-700">
                  <div className={`flex items-center justify-center h-14 w-14 rounded-xl mb-6 ${service.color.bg}`}>
                    <Icon className={`h-7 w-7 ${service.color.text}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{service.title}</h3>
                  <p className="text-slate-400 mb-6 flex-grow">{service.description}</p>
                  <Link to={service.link} className={`font-semibold transition-colors group flex items-center gap-2 ${service.color.text} hover:opacity-80`}>
                      {service.buttonText} <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              );
            })}

            {serviceSettings
              .filter(dynamicService => 
                !coreServices.some(core => core.title.toLowerCase() === dynamicService.title.toLowerCase())
              )
              .map((service, index) => (
                <ServiceCard key={service.id} service={service} colors={iconColors[index % iconColors.length]} />
              ))
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
