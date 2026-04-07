import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth } from '../lib/firebase';
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

// Helper for local storage profiles
const getLocalProfiles = (): Record<string, any> => {
    try {
        const data = localStorage.getItem('app_profiles');
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

const saveLocalProfiles = (profiles: Record<string, any>) => {
    localStorage.setItem('app_profiles', JSON.stringify(profiles));
};

const ADMIN_EMAILS = ['jclanhouse2012@hotmail.com.br', 'lanjc0245@gmail.com', 'admin@jclanhouse.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refetchUser = async () => {
        if (auth.currentUser) {
            const profiles = getLocalProfiles();
            const profileData = profiles[auth.currentUser.uid];
            const isAdminEmail = auth.currentUser.email ? ADMIN_EMAILS.includes(auth.currentUser.email) : false;
            
            if (profileData) {
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
                const profiles = getLocalProfiles();
                let profileData = profiles[firebaseUser.uid];
                const isAdminEmail = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
                
                if (profileData) {
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
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
                    
                    profiles[firebaseUser.uid] = {
                        username: defaultProfile.username,
                        name: defaultProfile.name,
                        avatar_url: defaultProfile.avatarUrl,
                        role: defaultProfile.role,
                        is_premium: defaultProfile.isPremium,
                        has_billing: defaultProfile.hasBilling,
                        pdv_access_status: defaultProfile.pdvAccessStatus,
                        status: defaultProfile.status
                    };
                    saveLocalProfiles(profiles);
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
            const profiles = getLocalProfiles();
            const foundUser = Object.values(profiles).find((p: any) => p.username === identifier);
            
            if (!foundUser) {
                throw new Error('Credenciais inválidas.');
            }
            
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
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            
            const profiles = getLocalProfiles();
            
            if (!profiles[firebaseUser.uid]) {
                const isAdminEmail = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
                const defaultProfile = {
                    username: firebaseUser.email?.split('@')[0] || 'user',
                    name: firebaseUser.displayName || 'Usuário',
                    email: firebaseUser.email || '',
                    avatar_url: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${(firebaseUser.displayName || 'User').replace(' ', '+')}&background=0891b2&color=fff`,
                    role: isAdminEmail ? 'admin' : 'client',
                    is_premium: isAdminEmail,
                    has_billing: isAdminEmail,
                    pdv_access_status: isAdminEmail ? 'authorized' : 'none',
                    status: 'active'
                };
                
                profiles[firebaseUser.uid] = defaultProfile;
                saveLocalProfiles(profiles);
            }
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
            const profiles = getLocalProfiles();
            const usernameExists = Object.values(profiles).some((p: any) => p.username === username);
            
            if (usernameExists) {
                throw new Error('Nome de usuário já está em uso.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const newUser = userCredential.user;

            const avatar_url = `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=0891b2&color=fff`;

            const isAdminEmail = email ? ADMIN_EMAILS.includes(email) : false;
            profiles[newUser.uid] = {
                username,
                name,
                email,
                avatar_url,
                role: isAdminEmail ? 'admin' : 'client',
                is_premium: isAdminEmail,
                has_billing: isAdminEmail,
                pdv_access_status: isAdminEmail ? 'authorized' : 'none',
                status: 'active'
            };
            saveLocalProfiles(profiles);
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
        const profiles = getLocalProfiles();
        return Object.entries(profiles)
            .filter(([_, data]: [string, any]) => data.status === 'active')
            .map(([id, data]: [string, any]) => ({
                id,
                email: data.email || '',
                name: data.name || '',
                username: data.username || '',
                role: data.role || 'client',
                isPremium: data.is_premium || false,
                hasBilling: data.has_billing || false,
                avatarUrl: data.avatar_url || '',
                pdvAccessStatus: data.pdv_access_status || 'none',
                status: data.status || 'active',
            }));
    }

    const adminUpdateUserRole = async (userId: string, role: UserRole): Promise<void> => {
        const profiles = getLocalProfiles();
        if (profiles[userId]) {
            profiles[userId].role = role;
            saveLocalProfiles(profiles);
        }
    }
    
    const adminCreateUser = async (details: { name: string; email: string; username: string; pass: string; role?: UserRole; pdvAccessStatus?: PdvAccessStatus }): Promise<void> => {
        try {
            const profiles = getLocalProfiles();
            const usernameExists = Object.values(profiles).some((p: any) => p.username === details.username);
            
            if (usernameExists) {
                throw new Error('Nome de usuário já está em uso.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.pass);
            const newUser = userCredential.user;

            const avatar_url = `https://ui-avatars.com/api/?name=${details.name.replace(' ', '+')}&background=0891b2&color=fff`;

            const isAdminEmail = details.email ? ADMIN_EMAILS.includes(details.email) : false;
            const role = details.role || (isAdminEmail ? 'admin' : 'client');
            const pdvAccessStatus = details.pdvAccessStatus || (isAdminEmail ? 'authorized' : 'none');

            profiles[newUser.uid] = {
                username: details.username,
                name: details.name,
                email: details.email,
                avatar_url,
                role,
                is_premium: isAdminEmail,
                has_billing: isAdminEmail,
                pdv_access_status: pdvAccessStatus,
                status: 'active'
            };
            saveLocalProfiles(profiles);
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
            throw new Error(error.message);
        }
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
    
        const profiles = getLocalProfiles();
        if (!profiles[userId]) return {};

        const appliedUpdates: Partial<User> = {};
    
        if (updates.avatarUrl) {
            profiles[userId].avatar_url = updates.avatarUrl;
            appliedUpdates.avatarUrl = updates.avatarUrl;
        }
    
        if (updates.photoURL) {
            profiles[userId].photo_url = updates.photoURL;
            appliedUpdates.photoURL = updates.photoURL;
        }

        if (updates.name) {
            profiles[userId].name = updates.name;
            appliedUpdates.name = updates.name;
        }
        if (updates.username) {
            profiles[userId].username = updates.username;
            appliedUpdates.username = updates.username;
        }

        saveLocalProfiles(profiles);
        return appliedUpdates;
    };

    const adminDeleteUser = async (userId: string): Promise<void> => {
        const profiles = getLocalProfiles();
        if (profiles[userId]) {
            profiles[userId].status = 'inactive';
            saveLocalProfiles(profiles);
        }
    };

    const isAuthenticated = !!user;

    const authorizePdvAccess = async (userId: string): Promise<void> => {
        const profiles = getLocalProfiles();
        if (profiles[userId]) {
            profiles[userId].pdv_access_status = 'authorized';
            saveLocalProfiles(profiles);
        }
    };

    const revokePdvAccess = async (userId: string): Promise<void> => {
        const profiles = getLocalProfiles();
        if (profiles[userId]) {
            profiles[userId].pdv_access_status = 'revoked';
            saveLocalProfiles(profiles);
        }
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const MAX_SIZE = 2 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return reject(new Error('O arquivo é muito grande. O limite é de 2MB.'));
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = () => {
                reject(new Error('Falha ao ler o arquivo.'));
            };
            reader.readAsDataURL(file);
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
