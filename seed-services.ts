import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const initialServices = [
    { icon: 'PrinterIcon', title: 'Impressão e Cópias', description: 'Impressões a laser e jato de tinta, coloridas e P&B com alta qualidade e rapidez.', link: '/impressao' },
    { icon: 'BookOpenIcon', title: 'Encadernação', description: 'Encadernações em espiral e capa dura para apostilas, TCCs e documentos.', link: '/caderneta' },
    { icon: 'DocumentTextIcon', title: 'Currículos', description: 'Criação e impressão de currículos profissionais para destacar você no mercado.', link: '/curriculo' },
    { icon: 'TagIcon', title: 'Adesivos Personalizados', description: 'Adesivos escolares, rótulos e etiquetas em diversos formatos e materiais.', link: '/adesivos-personalizados' },
    { icon: 'BriefcaseIcon', title: 'Cartões de Visita', description: 'Cartões de visita profissionais com diversos acabamentos para sua marca.', link: '/cartoes-visita' },
    { icon: 'MegaphoneIcon', title: 'Panfletos e Flyers', description: 'Material promocional para divulgar seu negócio com impacto visual.', link: '/panfletos' }
];

async function seed() {
  try {
    for (const service of initialServices) {
        await addDoc(collection(db, 'service_settings'), service);
    }
    console.log('Services seeded successfully');
  } catch (e) {
    console.error('Error seeding data:', e);
  }
  process.exit(0);
}

seed();
