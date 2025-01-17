import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status if user exists
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setInitialized(true);
        }
      })
      .catch((error) => {
        setConnectionError(true);
        console.error('Connection error:', error);
        setError('Please click the "Connect to Supabase" button to set up your database connection');
        setInitialized(true);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Check admin status when auth state changes
        if (currentUser) { 
          checkAdminStatus(currentUser.id);
        } else {
          setIsAdmin(false);
        }
        
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          setConnectionError(true);
          setError('Please click the "Connect to Supabase" button to set up your database connection');
        } else {
          setError('Authentication error occurred');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setConnectionError(true);
          setError('Please click the "Connect to Supabase" button to set up your database connection');
        } else {
          console.error('Error checking admin status:', error);
        }
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.is_admin || false);
        setConnectionError(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setConnectionError(true);
        setError('Please click the "Connect to Supabase" button to set up your database connection');
      }
      setIsAdmin(false);
    } finally {
      setInitialized(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, isAdmin }}>
      {!initialized ? ( 
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : connectionError ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-500">Please click the "Connect to Supabase" button to set up your database connection</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}