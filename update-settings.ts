import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const serviceSettings = [
  {
    id: "1",
    title: "Currículos",
    description: "Criação e impressão de currículos profissionais para destacar você no mercado.",
    icon: "DocumentTextIcon",
    link: "/curriculo"
  },
  {
    id: "2",
    title: "Impressão e Cópias",
    description: "Impressões a laser e jato de tinta, coloridas e P&B com alta qualidade e rapidez.",
    icon: "PrinterIcon",
    link: "/impressao"
  },
  {
    id: "3",
    title: "Encadernação",
    description: "Encadernações em espiral e capa dura para apostilas, TCCs e documentos.",
    icon: "BookIcon",
    link: "/caderneta"
  },
  {
    id: "4",
    title: "Panfletos e Flyers",
    description: "Material promocional para divulgar seu negócio com impacto visual.",
    icon: "InformationCircleIcon",
    link: "/panfletos"
  },
  {
    id: "5",
    title: "Adesivos Escolares",
    description: "Kits de adesivos personalizados para material escolar com diversos temas.",
    icon: "TagIcon",
    link: "/temas-escolares"
  },
  {
    id: "6",
    title: "Adesivos Personalizados",
    description: "Adesivos premium, rótulos e etiquetas em diversos formatos e materiais.",
    icon: "SparklesIcon",
    link: "/adesivos-personalizados"
  },
  {
    id: "7",
    title: "Cartões de Visita",
    description: "Cartões de visita profissionais com diversos acabamentos para sua marca.",
    icon: "BriefcaseIcon",
    link: "/cartoes-visita"
  }
];

async function update() {
    const batch = writeBatch(db);
    
    // Delete all existing
    const querySnapshot = await getDocs(collection(db, 'service_settings'));
    querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'service_settings', document.id));
    });
    
    // Insert new
    serviceSettings.forEach((setting) => {
        const { id, ...rest } = setting;
        const newDocRef = doc(collection(db, 'service_settings'));
        batch.set(newDocRef, rest);
    });
    
    await batch.commit();
    console.log('Service settings updated successfully!');
    process.exit(0);
}

update();
