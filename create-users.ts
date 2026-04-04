import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function createUsers() {
  try {
    // Create Admin
    const adminCred = await createUserWithEmailAndPassword(auth, 'admin@jclanhouse.com', '159753');
    await setDoc(doc(db, 'profiles', adminCred.user.uid), {
      username: 'admin',
      name: 'Administrador',
      email: 'admin@jclanhouse.com',
      role: 'admin',
      is_premium: true,
      has_billing: true,
      pdv_access_status: 'authorized',
      status: 'active'
    });
    console.log('Admin created: admin@jclanhouse.com / admin123');

    // Create Client
    const clientCred = await createUserWithEmailAndPassword(auth, 'cliente@teste.com', 'cliente123');
    await setDoc(doc(db, 'profiles', clientCred.user.uid), {
      username: 'cliente',
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
      role: 'client',
      is_premium: false,
      has_billing: false,
      pdv_access_status: 'none',
      status: 'active'
    });
    console.log('Client created: cliente@teste.com / cliente123');

  } catch (error) {
    console.error('Error creating users:', error);
  }
  process.exit(0);
}

createUsers();
