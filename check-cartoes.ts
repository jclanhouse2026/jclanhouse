import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
    const docRef = doc(db, 'service_pricing', 'default');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log(JSON.stringify(docSnap.data().config?.cartoes_visita, null, 2));
    } else {
        console.log('No data');
    }
    process.exit(0);
}

check();
