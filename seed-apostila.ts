import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function seedApostilaData() {
  try {
    // Set default settings
    await setDoc(doc(db, 'apostila_settings', 'default'), {
      price_bw: 0.15,
      price_color: 0.50,
      price_spiral: 5.00,
      price_wireo: 10.00,
      limit_spiral: 300,
      limit_wireo: 120,
      enable_double_sided: true,
      enable_spiral: true,
      enable_wireo: true,
      min_delivery_days: 1
    }, { merge: true });
    console.log('Apostila settings seeded.');

    // Check if colors exist
    const colorsSnap = await getDocs(collection(db, 'apostila_colors'));
    if (colorsSnap.empty) {
      const defaultColors = [
        { name: 'Transparente', hex: '#ffffff', active: true },
        { name: 'Preto', hex: '#000000', active: true },
        { name: 'Azul', hex: '#3b82f6', active: true },
        { name: 'Vermelho', hex: '#ef4444', active: true },
        { name: 'Verde', hex: '#22c55e', active: true },
      ];

      for (const color of defaultColors) {
        await setDoc(doc(collection(db, 'apostila_colors')), color);
      }
      console.log('Apostila colors seeded.');
    } else {
      console.log('Apostila colors already exist.');
    }
  } catch (e) {
    console.error('Error seeding data:', e);
  }
  process.exit(0);
}

seedApostilaData();
