import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
    const querySnapshot = await getDocs(collection(db, 'service_settings'));
    const data = querySnapshot.docs.map(doc => doc.data());
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
}

check();
