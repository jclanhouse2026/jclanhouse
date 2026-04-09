import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    sendPasswordResetEmail,
    User as FirebaseUser,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import type { User, UserRole, PdvAccessStatus } from '../types';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, username: string, pass: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  adminGetAllUsers: () => Promise<User[]>;
  adminUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  adminCreateUser: (details: { name: string; email: string; username: string; pass: string; role?: UserRole; pdvAccessStatus?: PdvAccessStatus }) => Promise<void>;
  adminUpdateUser: (userId: string, updates: Partial<User>) => Promise<Partial<User>>;
  adminDeleteUser: (userId: string) => Promise<void>;
  authorizePdvAccess: (userId: string) => Promise<void>;
  revokePdvAccess: (userId: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



const ADMIN_EMAILS = ['jclanhouse2012@hotmail.com.br', 'lanjc0245@gmail.com', 'admin@jclanhouse.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refetchUser = async () => {
        if (auth.currentUser) {
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            const isAdminEmail = auth.currentUser.email ? ADMIN_EMAILS.includes(auth.currentUser.email) : false;
            
            if (docSnap.exists()) {
                const profileData = docSnap.data();
                setUser({
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email || '',
                    name: profileData.name || 'Usuário',
                    username: profileData.username,
                    role: isAdminEmail ? 'admin' : (profileData.role || 'client'),
                    isPremium: isAdminEmail || profileData.is_premium || false,
                    hasBilling: isAdminEmail || profileData.has_billing || false,
                    avatarUrl: profileData.avatar_url,
                    photoURL: profileData.photo_url || profileData.avatar_url,
                    pdvAccessStatus: isAdminEmail ? 'authorized' : (profileData.pdv_access_status || 'none'),
                    status: profileData.status || 'active',
                });
            }
        }
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, 'users', firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                const isAdminEmail = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
                
                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    const currentRole = profileData.role || 'client';
                    
                    // Sync admin role if email is in ADMIN_EMAILS but role is not admin
                    if (isAdminEmail && currentRole !== 'admin') {
                        await updateDoc(docRef, { role: 'admin', is_premium: true, has_billing: true, pdv_access_status: 'authorized' });
                        profileData.role = 'admin';
                        profileData.is_premium = true;
                        profileData.has_billing = true;
                        profileData.pdv_access_status = 'authorized';
                    }

                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: profileData.name || 'Usuário',
                        username: profileData.username,
                        role: isAdminEmail ? 'admin' : currentRole,
                        isPremium: isAdminEmail || profileData.is_premium || false,
                        hasBilling: isAdminEmail || profileData.has_billing || false,
                        avatarUrl: profileData.avatar_url,
                        photoURL: profileData.photo_url || profileData.avatar_url,
                        pdvAccessStatus: isAdminEmail ? 'authorized' : (profileData.pdv_access_status || 'none'),
                        status: profileData.status || 'active',
                    });
                } else {
                    const defaultProfile: User = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || 'Usuário',
                        username: firebaseUser.email?.split('@')[0] || 'user',
                        role: isAdminEmail ? 'admin' : 'client',
                        isPremium: isAdminEmail,
                        hasBilling: isAdminEmail,
                        avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                        photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                        pdvAccessStatus: isAdminEmail ? 'authorized' : 'none',
                        status: 'active',
                    };
                    
                    await setDoc(docRef, {
                        email: defaultProfile.email,
                        username: defaultProfile.username,
                        name: defaultProfile.name,
                        avatar_url: defaultProfile.avatarUrl,
                        role: defaultProfile.role,
                        is_premium: defaultProfile.isPremium,
                        has_billing: defaultProfile.hasBilling,
                        pdv_access_status: defaultProfile.pdvAccessStatus,
                        status: defaultProfile.status,
                        created_at: new Date().toISOString()
                    });
                    setUser(defaultProfile);
                }
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    const login = async (identifier: string, pass: string, rememberMe: boolean): Promise<void> => {
        let emailToLogin = identifier;
        const isEmail = identifier.includes('@');

        if (!isEmail) {
            const q = query(collection(db, 'users'), where('username', '==', identifier));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error('Credenciais inválidas.');
            }
            
            const foundUser = querySnapshot.docs[0].data();
            if (!foundUser.email) {
                 throw new Error('Email não encontrado para este usuário.');
            }
            emailToLogin = foundUser.email;
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
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the user document creation/sync
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
            const q = query(collection(db, 'users'), where('username', '==', username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                throw new Error('Nome de usuário já está em uso.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newUser = userCredential.user;

            const avatar_url = `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=0891b2&color=fff`;

            const isAdminEmail = email ? ADMIN_EMAILS.includes(email) : false;
            await setDoc(doc(db, 'users', newUser.uid), {
                username,
                name,
                email,
                avatar_url,
                role: isAdminEmail ? 'admin' : 'client',
                is_premium: isAdminEmail,
                has_billing: isAdminEmail,
                pdv_access_status: isAdminEmail ? 'authorized' : 'none',
                status: 'active'
            });
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

    const resetPassword = async (email: string): Promise<void> => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                throw new Error('Usuário não encontrado.');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('Email inválido.');
            }
            throw new Error(error.message);
        }
    };
    
    const adminGetAllUsers = async (): Promise<User[]> => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                email: data.email || '',
                name: data.name || 'Usuário',
                username: data.username || 'user',
                role: data.role || 'client',
                isPremium: data.is_premium || false,
                hasBilling: data.has_billing || false,
                avatarUrl: data.avatar_url,
                photoURL: data.photo_url || data.avatar_url,
                pdvAccessStatus: data.pdv_access_status || 'none',
                status: data.status || 'active',
            });
        });
        return users;
    };

    const adminUpdateUserRole = async (userId: string, role: UserRole): Promise<void> => {
        await updateDoc(doc(db, 'users', userId), { role });
    };
    
    const adminCreateUser = async (details: { name: string; email: string; username: string; pass: string; role?: UserRole; pdvAccessStatus?: PdvAccessStatus }): Promise<void> => {
        throw new Error('Criação de usuário via admin requer Firebase Admin SDK.');
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
    
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.username !== undefined) dbUpdates.username = updates.username;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
        if (updates.hasBilling !== undefined) dbUpdates.has_billing = updates.hasBilling;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.photoURL !== undefined) dbUpdates.photo_url = updates.photoURL;
        if (updates.pdvAccessStatus !== undefined) dbUpdates.pdv_access_status = updates.pdvAccessStatus;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        
        await updateDoc(doc(db, 'users', userId), dbUpdates);
        return updates;
    };

    const adminDeleteUser = async (userId: string): Promise<void> => {
        await deleteDoc(doc(db, 'users', userId));
    };

    const isAuthenticated = !!user;

    const authorizePdvAccess = async (userId: string): Promise<void> => {
        await updateDoc(doc(db, 'users', userId), { pdv_access_status: 'authorized' });
    };

    const revokePdvAccess = async (userId: string): Promise<void> => {
        await updateDoc(doc(db, 'users', userId), { pdv_access_status: 'revoked' });
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new Error('O arquivo é muito grande. O limite é de 2MB.');
        }
        
        // Convert to base64 to bypass Firebase Storage issues
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const value = {
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        isAuthenticated,
        adminGetAllUsers,
        adminUpdateUserRole,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        authorizePdvAccess,
        revokePdvAccess,
        refetchUser,
        uploadFile
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
