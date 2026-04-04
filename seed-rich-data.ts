import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const richPricingData = {
    caderneta: { 
        mainOptions: [
            { id: 'a5_wireo', name: 'A5 Wire-o', price: 35 }, 
            { id: 'a5_brochura', name: 'A5 Brochura', price: 30 }
        ], 
        luxuryAddons: [
            { id: 'elastico', name: 'Elástico', price: 5 }, 
            { id: 'bolso', name: 'Bolso Plástico', price: 3 }
        ] 
    },
    adesivos_escolares: { 
        packages: [
            { id: 'basico', name: 'Kit Básico (50 un)', price: 25 }, 
            { id: 'completo', name: 'Kit Completo (100 un)', price: 45 }
        ], 
        materials: [
            { id: 'vinil_branco', name: 'Vinil Branco', priceMultiplier: 1 }, 
            { id: 'papel_foto', name: 'Papel Fotográfico', priceMultiplier: 0.8 }
        ] 
    },
    adesivos_premium: { 
        sizes: [3, 4, 5, 6, 7, 8, 9, 10], 
        formats: [
            { id: 'redondo', name: 'Redondo' }, 
            { id: 'quadrado', name: 'Quadrado' }, 
            { id: 'recorte', name: 'Recorte Especial' }
        ], 
        materials: [
            { id: 'vinil', name: 'Vinil', priceModifier: 1, priceText: 'Padrão' }, 
            { id: 'papel', name: 'Papel Fotográfico', priceModifier: 0.7, priceText: '-30%' }
        ], 
        lamination: { name: 'Laminação Holográfica', pricePerUnit: 0.2, priceText: '+ R$ 0,20/un' } 
    },
    cartoes_visita: { 
        quantities: [100, 250, 500, 1000], 
        papers: [
            { id: 'couche250', name: 'Couchê 250g', description: 'Papel padrão, ótimo custo-benefício.', basePrice: 45 }, 
            { id: 'couche300', name: 'Couchê 300g', description: 'Mais espesso e firme, aspecto premium.', basePrice: 60 }
        ], 
        addons: [
            { id: 'lamination', name: 'Laminação Fosca', priceMultiplier: 1.3 }, 
            { id: 'twoSided', name: 'Frente e Verso', priceMultiplier: 1.5 }
        ] 
    },
    panfletos: { 
        formats: [
            { id: '10x15', name: '10x15 cm', description: 'Padrão' }, 
            { id: '14x20', name: '14x20 cm', description: 'Médio' }
        ], 
        quantities: [1000, 2500, 5000], 
        prices: { 
            '10x15': { 1000: 150, 2500: 250, 5000: 400 }, 
            '14x20': { 1000: 200, 2500: 350, 5000: 600 } 
        } 
    },
    impressao: { 
        basePrice: 0.50, 
        techModifiers: { 
            laser: { base: 1, color: 2 }, 
            inkjet: { base: 0.8, color: 1.5 } 
        }, 
        formatModifiers: [
            { id: 'A4', name: 'A4', modifier: 1 }, 
            { id: 'A3', name: 'A3', modifier: 2 }
        ], 
        mediaModifiers: [
            { id: 'sulfite75g', name: 'Sulfite 75g', modifier: 1 }, 
            { id: 'couche115g', name: 'Couchê 115g', modifier: 1.5 },
            { id: 'fotografico', name: 'Papel Fotográfico', modifier: 2.5 }
        ] 
    }
};

async function seed() {
  try {
    await setDoc(doc(db, 'service_pricing', 'default'), { config: richPricingData });
    console.log('Rich pricing seeded successfully');
  } catch (e) {
    console.error('Error seeding data:', e);
  }
  process.exit(0);
}

seed();
