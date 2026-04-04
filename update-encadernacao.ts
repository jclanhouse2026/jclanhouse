import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function updateService() {
  try {
    const serviceRef = collection(db, 'service_settings');
    
    // Find 'Encadernação'
    const q1 = query(serviceRef, where('title', '==', 'Encadernação'));
    const snap1 = await getDocs(q1);
    
    if (!snap1.empty) {
      for (const d of snap1.docs) {
        await updateDoc(doc(db, 'service_settings', d.id), {
          title: 'ENCADERNAÇÃO',
          link: '/apostila',
          description: 'Sistema completo de configuração de impressão e encadernação personalizada.'
        });
        console.log('Updated Encadernação to point to /apostila');
      }
    } else {
      // Maybe it's uppercase or something else
      const all = await getDocs(serviceRef);
      for (const d of all.docs) {
        const data = d.data();
        if (data.title && data.title.toLowerCase().includes('encaderna')) {
          await updateDoc(doc(db, 'service_settings', d.id), {
            title: 'ENCADERNAÇÃO',
            link: '/apostila',
            description: 'Sistema completo de configuração de impressão e encadernação personalizada.'
          });
          console.log('Updated', data.title, 'to ENCADERNAÇÃO -> /apostila');
        }
      }
    }

    // If there's an 'APOSTILA' service from previous seed, we might want to remove it or merge it
    const q2 = query(serviceRef, where('title', '==', 'APOSTILA'));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      for (const d of snap2.docs) {
        // We can just leave it or delete it to avoid duplicates
        // Let's delete it if we already updated Encadernação
        // Actually, let's just keep it simple.
      }
    }

    console.log('Done updating service settings.');
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}

updateService();
