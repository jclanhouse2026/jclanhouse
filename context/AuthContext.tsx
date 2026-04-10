import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

    const fetchUserProfile = async (uid: string): Promise<any> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching user profile:", error);
            }
            return data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
        return null;
    };

    const saveUserProfile = async (uid: string, data: any) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: uid, ...data });
            
            if (error) {
                console.error("Error saving user profile:", error);
            }
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    };

    const refetchUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profileData = await fetchUserProfile(session.user.id) || {};
            const isAdminEmail = session.user.email ? ADMIN_EMAILS.includes(session.user.email) : false;
            
            setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profileData.name || session.user.user_metadata?.full_name || 'Usuário',
                username: profileData.username || session.user.email?.split('@')[0] || 'user',
                role: isAdminEmail ? 'admin' : (profileData.role || 'client'),
                isPremium: isAdminEmail || profileData.isPremium || false,
                hasBilling: isAdminEmail || profileData.hasBilling || false,
                avatarUrl: profileData.avatarUrl || session.user.user_metadata?.avatar_url,
                photoURL: profileData.photoURL || profileData.avatarUrl || session.user.user_metadata?.avatar_url,
                pdvAccessStatus: isAdminEmail ? 'authorized' : (profileData.pdvAccessStatus || 'none'),
                status: profileData.status || 'active',
            });
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profileData = await fetchUserProfile(session.user.id) || {};
                const isAdminEmail = session.user.email ? ADMIN_EMAILS.includes(session.user.email) : false;
                
                const currentUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: profileData.name || session.user.user_metadata?.full_name || 'Usuário',
                    username: profileData.username || session.user.email?.split('@')[0] || 'user',
                    role: isAdminEmail ? 'admin' : (profileData.role || 'client'),
                    isPremium: isAdminEmail || profileData.isPremium || false,
                    hasBilling: isAdminEmail || profileData.hasBilling || false,
                    avatarUrl: profileData.avatarUrl || session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                    photoURL: profileData.photoURL || profileData.avatarUrl || session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                    pdvAccessStatus: isAdminEmail ? 'authorized' : (profileData.pdvAccessStatus || 'none'),
                    status: profileData.status || 'active',
                };

                if (!profileData.id) {
                    await saveUserProfile(session.user.id, currentUser);
                }

                setUser(currentUser);
            }
            setLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const profileData = await fetchUserProfile(session.user.id) || {};
                const isAdminEmail = session.user.email ? ADMIN_EMAILS.includes(session.user.email) : false;
                
                const currentUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: profileData.name || session.user.user_metadata?.full_name || 'Usuário',
                    username: profileData.username || session.user.email?.split('@')[0] || 'user',
                    role: isAdminEmail ? 'admin' : (profileData.role || 'client'),
                    isPremium: isAdminEmail || profileData.isPremium || false,
                    hasBilling: isAdminEmail || profileData.hasBilling || false,
                    avatarUrl: profileData.avatarUrl || session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                    photoURL: profileData.photoURL || profileData.avatarUrl || session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=User&background=0891b2&color=fff`,
                    pdvAccessStatus: isAdminEmail ? 'authorized' : (profileData.pdvAccessStatus || 'none'),
                    status: profileData.status || 'active',
                };

                setUser(currentUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (identifier: string, pass: string, rememberMe: boolean): Promise<void> => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: identifier,
                password: pass,
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Login error:", error);
            throw new Error('Credenciais inválidas ou erro de conexão.');
        }
    };

    const loginWithGoogle = async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Google login error:", error);
            throw new Error('Falha ao autenticar com o Google.');
        }
    };

    const register = async (name: string, email: string, username: string, pass: string): Promise<void> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: pass,
                options: {
                    data: {
                        full_name: name,
                        username: username,
                    }
                }
            });
            if (error) throw error;

            if (data.user) {
                const avatarUrl = `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=0891b2&color=fff`;
                const isAdminEmail = email ? ADMIN_EMAILS.includes(email) : false;
                
                const profileData = {
                    username,
                    name,
                    email,
                    avatarUrl,
                    role: isAdminEmail ? 'admin' : 'client',
                    isPremium: isAdminEmail,
                    hasBilling: isAdminEmail,
                    pdvAccessStatus: isAdminEmail ? 'authorized' : 'none',
                    status: 'active'
                };

                await saveUserProfile(data.user.id, profileData);
            }
        } catch (error: any) {
            console.error("Register error:", error);
            throw new Error(error.message);
        }
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        } catch (error: any) {
            throw new Error(error.message);
        }
    };
    
    const adminGetAllUsers = async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');
            if (error) throw error;
            return data as User[];
        } catch (error) {
            console.error("Error getting all users:", error);
            return user ? [user] : [];
        }
    };

    const adminUpdateUserRole = async (userId: string, role: UserRole): Promise<void> => {
        await saveUserProfile(userId, { role });
        if (user?.id === userId) setUser({ ...user, role });
    };
    
    const adminCreateUser = async (details: { name: string; email: string; username: string; pass: string; role?: UserRole; pdvAccessStatus?: PdvAccessStatus }): Promise<void> => {
        throw new Error('Apenas o próprio usuário pode se registrar ou use o Supabase Dashboard.');
    };

    const adminUpdateUser = async (userId: string, updates: Partial<User>): Promise<Partial<User>> => {
        if (user && user.id === userId && updates.password) {
            try {
                const { error } = await supabase.auth.updateUser({
                    password: updates.password
                });
                if (error) throw error;
            } catch (error: any) {
                throw new Error(error.message);
            }
        }
    
        await saveUserProfile(userId, updates);
        
        if (user?.id === userId) {
            setUser(prev => prev ? { ...prev, ...updates } : null);
        }
        
        return updates;
    };

    const adminDeleteUser = async (userId: string): Promise<void> => {
        console.warn("Deleting user profile only. Auth user remains.");
        await supabase.from('profiles').delete().eq('id', userId);
    };

    const isAuthenticated = !!user;

    const authorizePdvAccess = async (userId: string): Promise<void> => {
        await saveUserProfile(userId, { pdvAccessStatus: 'authorized' });
    };

    const revokePdvAccess = async (userId: string): Promise<void> => {
        await saveUserProfile(userId, { pdvAccessStatus: 'revoked' });
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        try {
            const { data, error } = await supabase.storage
                .from('images')
                .upload(path, file, {
                    upsert: true
                });
            
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(data.path);
            
            return publicUrl;
        } catch (error: any) {
            console.error("Upload error:", error);
            throw new Error('Falha ao fazer upload da imagem.');
        }
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
