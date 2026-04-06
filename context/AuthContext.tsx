import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    User as FirebaseUser,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { User, UserRole } from '../types';

const AVATAR_BUCKET = 'avatars';

const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, username: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  adminGetAllUsers: () => Promise<User[]>;
  adminUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  adminCreateUser: (details: { name: string; email: string; username: string; pass: string }) => Promise<void>;
  adminUpdateUser: (userId: string, updates: Partial<User>) => Promise<Partial<User>>;
  adminDeleteUser: (userId: string) => Promise<void>;
  authorizePdvAccess: (userId: string) => Promise<void>;
  revokePdvAccess: (userId: string) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const updateUserState = async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
            setUser(null);
            return;
        }

        try {
            const docRef = doc(db, 'profiles', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profileData = docSnap.data();
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: profileData.name || 'Usuário',
                    username: profileData.username,
                    role: profileData.role || 'client',
                    isPremium: profileData.is_premium || false,
                    hasBilling: profileData.has_billing || false,
                    avatarUrl: profileData.avatar_url,
                    pdvAccessStatus: profileData.pdv_access_status || 'none',
                    status: profileData.status || 'active',
                });
            } else {
                // If profile doesn't exist, create a default one
                const defaultProfile = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || 'Usuário',
                    username: firebaseUser.email?.split('@')[0] || 'user',
                    role: 'client',
                    isPremium: false,
                    hasBilling: false,
                    avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                    pdvAccessStatus: 'none',
                    status: 'active',
                };
                
                await setDoc(docRef, {
                    username: defaultProfile.username,
                    name: defaultProfile.name,
                    avatar_url: defaultProfile.avatarUrl,
                    role: defaultProfile.role,
                    is_premium: defaultProfile.isPremium,
                    has_billing: defaultProfile.hasBilling,
                    pdv_access_status: defaultProfile.pdvAccessStatus,
                    status: defaultProfile.status
                });

                setUser(defaultProfile);
            }
        } catch (e) {
            console.error("Exceção ao buscar perfil:", (e as Error).message);
            setUser(null);
        }
    };

    const refetchUser = async () => {
        if (auth.currentUser) {
            await updateUserState(auth.currentUser);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            await updateUserState(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (identifier: string, pass: string, rememberMe: boolean): Promise<void> => {
        let emailToLogin = identifier;
        const isEmail = identifier.includes('@');

        if (!isEmail) {
            const q = query(collection(db, 'profiles'), where('username', '==', identifier));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error('Credenciais inválidas.');
            }
            
            // We need the email associated with this username.
            // Since we don't store email in profiles by default, we should ensure we do or use a lookup.
            // Wait, the Supabase code fetched email from profiles. Let's assume email is stored in profiles or we need to add it.
            // Actually, we should store email in profiles to make this work.
            const profileData = querySnapshot.docs[0].data();
            if (!profileData.email) {
                 throw new Error('Email não encontrado para este usuário.');
            }
            emailToLogin = profileData.email;
        }

        try {
            await signInWithEmailAndPassword(auth, emailToLogin, pass);
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                 throw new Error('Credenciais inválidas.');
            }
            if (error.code === 'auth/too-many-requests') {
                 throw new Error('Muitas tentativas de login. Tente novamente mais tarde.');
            }
            if (error.code === 'auth/network-request-failed') {
                 throw new Error('Erro de conexão. Verifique sua internet ou se o domínio está autorizado no Firebase.');
            }
            throw new Error(error.message);
        }
    };

    const loginWithGoogle = async (): Promise<void> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            
            // Check if profile exists
            const docRef = doc(db, 'profiles', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                // Register new user
                const defaultProfile = {
                    username: firebaseUser.email?.split('@')[0] || 'user',
                    name: firebaseUser.displayName || 'Usuário',
                    email: firebaseUser.email || '',
                    avatar_url: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${(firebaseUser.displayName || 'User').replace(' ', '+')}&background=0891b2&color=fff`,
                    role: 'client',
                    is_premium: false,
                    has_billing: false,
                    pdv_access_status: 'none',
                    status: 'active'
                };
                
                await setDoc(docRef, defaultProfile);
            }
            
            await updateUserState(firebaseUser);
        } catch (error: any) {
            console.error("Google login error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Login cancelado pelo usuário.');
            }
            if (error.code === 'auth/network-request-failed') {
                 throw new Error('Erro de conexão. Verifique sua internet ou se o domínio está autorizado no Firebase.');
            }
            throw new Error('Falha ao autenticar com o Google.');
        }
    };

    const register = async (name: string, email: string, username: string, pass: string): Promise<void> => {
        try {
            // Check if username already exists
            const q = query(collection(db, 'profiles'), where('username', '==', username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error('Nome de usuário já está em uso.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newUser = userCredential.user;

            const avatar_url = `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=0891b2&color=fff`;

            await setDoc(doc(db, 'profiles', newUser.uid), {
                username,
                name,
                email, // Store email for login lookup
                avatar_url,
                role: 'client',
                is_premium: false,
                has_billing: false,
                pdv_access_status: 'none',
                status: 'active'
            });
            
            // Force refetch to update state
            await updateUserState(newUser);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este email já está em uso.');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('A senha deve ter pelo menos 6 caracteres.');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('O email fornecido é inválido.');
            }
            if (error.code === 'auth/network-request-failed') {
                 throw new Error('Erro de conexão. Verifique sua internet ou se o domínio está autorizado no Firebase.');
            }
            throw new Error(error.message);
        }
    };

    const logout = (): void => {
        setUser(null);
        signOut(auth).catch(error => {
            console.error("Error signing out:", error);
        });
    };
    
    const adminGetAllUsers = async (): Promise<User[]> => {
        const q = query(collection(db, 'profiles'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email || '',
            name: doc.data().name || '',
            username: doc.data().username || '',
            role: doc.data().role || 'client',
            isPremium: doc.data().is_premium || false,
            hasBilling: doc.data().has_billing || false,
            avatarUrl: doc.data().avatar_url || '',
            pdvAccessStatus: doc.data().pdv_access_status || 'none',
            status: doc.data().status || 'active',
        }));
    }

    const adminUpdateUserRole = async (userId: string, role: UserRole): Promise<void> => {
        await updateDoc(doc(db, 'profiles', userId), { role });
    }
    
    const adminCreateUser = async (details: { name: string; email: string; username: string; pass: string }): Promise<void> => {
        console.warn("adminCreateUser called on the frontend. In production, this should be a trusted server-side call.");
        // Note: Firebase Auth doesn't allow creating users without signing them in on the client SDK easily.
        // We will just call register, which will sign the admin out and sign the new user in.
        // In a real app, use Firebase Admin SDK in a Cloud Function.
        await register(details.name, details.email, details.username, details.pass);
    };

    const adminUpdateUser = async (userId: string, updates: Partial<User>): Promise<Partial<User>> => {
        if (user && user.id === userId && updates.password && auth.currentUser) {
            try {
                await updatePassword(auth.currentUser, updates.password);
            } catch (error: any) {
                if (error.code === 'auth/requires-recent-login') {
                    throw new Error('Para alterar a senha, você precisa ter feito login recentemente. Por favor, saia e entre novamente.');
                }
                if (error.code === 'auth/weak-password') {
                    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
                }
                throw new Error(error.message);
            }
        }
    
        const profileUpdates: { [key: string]: any } = {};
        const appliedUpdates: Partial<User> = {};
    
        if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image')) {
            // Salvar a imagem em base64 diretamente no Firestore para evitar problemas com o Storage
            profileUpdates.avatar_url = updates.avatarUrl;
            appliedUpdates.avatarUrl = updates.avatarUrl;
        } else if (updates.avatarUrl) {
            profileUpdates.avatar_url = updates.avatarUrl;
        }
    
        if (updates.name) {
            profileUpdates.name = updates.name;
            appliedUpdates.name = updates.name;
        }
        if (updates.username) {
            profileUpdates.username = updates.username;
            appliedUpdates.username = updates.username;
        }

        if (Object.keys(profileUpdates).length > 0) {
            await updateDoc(doc(db, 'profiles', userId), profileUpdates);
        }

        return appliedUpdates;
    };

    const adminDeleteUser = async (userId: string): Promise<void> => {
        await updateDoc(doc(db, 'profiles', userId), { status: 'inactive' });
    };

    const isAuthenticated = !!user;

    const authorizePdvAccess = async (userId: string): Promise<void> => {
        await updateDoc(doc(db, 'profiles', userId), { pdv_access_status: 'authorized' });
    };

    const revokePdvAccess = async (userId: string): Promise<void> => {
        await updateDoc(doc(db, 'profiles', userId), { pdv_access_status: 'revoked' });
    };

    const value = {
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated,
        adminGetAllUsers,
        adminUpdateUserRole,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        authorizePdvAccess,
        revokePdvAccess,
        refetchUser
    };

    return (
        <AuthContext.Provider value={value}>
        {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
