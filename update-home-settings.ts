import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function updateHomeSettings() {
  try {
    const docRef = doc(db, 'home_settings', 'default');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().settings) {
      const settings = docSnap.data().settings;
      let updated = false;

      if (settings.categories) {
        settings.categories = settings.categories.map((c: any) => {
          if (c.name === 'Cadernetas' || c.name === 'Encadernação') {
            updated = true;
            return { ...c, name: 'Encadernação', link: '/apostila' };
          }
          return c;
        });
      }

      if (settings.footer && settings.footer.serviceLinks) {
        settings.footer.serviceLinks = settings.footer.serviceLinks.map((l: any) => {
          if (l.text === 'Cadernetas' || l.text === 'Encadernação') {
            updated = true;
            return { ...l, text: 'Encadernação', link: '/apostila' };
          }
          return l;
        });
      }

      if (updated) {
        await updateDoc(docRef, { settings });
        console.log('Updated home_settings to point Encadernação to /apostila');
      } else {
        console.log('No updates needed for home_settings');
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

updateHomeSettings();
