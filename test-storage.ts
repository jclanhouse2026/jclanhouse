import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';
import fs from 'fs';

const appletConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig1 = {
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  appId: appletConfig.appId,
  storageBucket: appletConfig.storageBucket
};

const app1 = initializeApp(firebaseConfig1, 'app1');
const storage1 = getStorage(app1);
const storageRef1 = ref(storage1, 'test1.txt');

uploadString(storageRef1, 'Hello World').then(() => {
  console.log('Uploaded successfully using appletConfig.storageBucket');
}).catch((error) => {
  console.error('Error uploading with appletConfig.storageBucket:', error.message);
  
  const firebaseConfig2 = {
    ...firebaseConfig1,
    storageBucket: `${appletConfig.projectId}.appspot.com`
  };
  const app2 = initializeApp(firebaseConfig2, 'app2');
  const storage2 = getStorage(app2);
  const storageRef2 = ref(storage2, 'test2.txt');
  
  uploadString(storageRef2, 'Hello World').then(() => {
    console.log('Uploaded successfully using appspot.com');
  }).catch((err) => {
    console.error('Error uploading with appspot.com:', err.message);
  });
});
