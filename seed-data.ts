import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const initialPricingData = {
    caderneta: { mainOptions: [], luxuryAddons: [] },
    adesivos_escolares: { packages: [], materials: [] },
    adesivos_premium: { sizes: [], formats: [], materials: [], lamination: { name: '', pricePerUnit: 0, priceText: '' } },
    cartoes_visita: { quantities: [], papers: [], addons: [] },
    panfletos: { formats: [], quantities: [], prices: {} },
    impressao: { basePrice: 0, techModifiers: { laser: { base: 0, color: 0 }, inkjet: { base: 0, color: 0 } }, formatModifiers: [], mediaModifiers: [] }
};

const initialHomeSettings = {
  hero: { imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", title: "Bem-vindo à JC LAN HOUSE", subtitle: "Serviços de impressão, encadernação, currículos e muito mais." },
  categories: [
    { id: '1', name: "Cadernetas", icon: "BookOpenIcon", link: "/caderneta" },
    { id: '2', name: "Adesivos", icon: "TagIcon", link: "/adesivos-personalizados" },
    { id: '3', name: "Currículos", icon: "DocumentTextIcon", link: "/curriculo" },
    { id: '4', name: "Impressões", icon: "PrinterIcon", link: "/impressao" }
  ],
  differentials: [
    { id: '1', icon: "LightningBoltIcon", title: "Rapidez", description: "Entregamos seus serviços no menor tempo possível." },
    { id: '2', icon: "StarIcon", title: "Qualidade", description: "Utilizamos os melhores materiais do mercado." },
    { id: '3', icon: "HeartIcon", title: "Atendimento", description: "Foco total na satisfação dos nossos clientes." }
  ],
  footer: {
    aboutText: "A JC LAN HOUSE é a sua parceira ideal para serviços gráficos, impressões e soluções digitais rápidas e com qualidade.", 
    siteLinks: [ { id: '1', text: "Home", link: "/" }, { id: '2', text: "Serviços", link: "/servicos" }, { id: '3', text: "Portfólio", link: "/portfolio" } ], 
    serviceLinks: [ { id: '1', text: "Impressões", link: "/impressao" }, { id: '2', text: "Currículos", link: "/curriculo" }, { id: '3', text: "Cadernetas", link: "/caderneta" } ],
    contact: { email: "contato@jclanhouse.com", phone: "(00) 0000-0000", whatsapp: "5500000000000" }
  }
};

async function seed() {
  try {
    await setDoc(doc(db, 'service_pricing', 'default'), { config: initialPricingData });
    console.log('Pricing seeded successfully');
    await setDoc(doc(db, 'home_settings', 'default'), { settings: initialHomeSettings });
    console.log('Home settings seeded successfully');
  } catch (e) {
    console.error('Error seeding data:', e);
  }
  process.exit(0);
}

seed();
