import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured);

  // Initialize auth state from Supabase session
  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }
    
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes if Supabase is configured
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (isConfigured) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      });
      
      subscription = data.subscription;
    }

    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch user profile from the profiles table
  const fetchProfile = async (userId: string) => {
    if (!isConfigured) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: any) => {
    if (!isConfigured) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Please set up your Supabase credentials in the .env file.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'student',
          },
        },
      });
      
      if (error) throw error;
      
      // If successful, create a profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name: userData.name,
              role: userData.role || 'student',
              institution: userData.institution || '',
              email: email,
            },
          ]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            variant: 'destructive',
            title: 'Profile creation failed',
            description: profileError.message,
          });
        }
      }
      
      toast({
        title: 'Registration successful!',
        description: 'Please check your email to confirm your account.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Please set up your Supabase credentials in the .env file.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Login successful!',
        description: `Welcome back${profile?.name ? ', ' + profile.name : ''}!`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Please set up your Supabase credentials in the .env file.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error signing out',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: any) => {
    if (!isConfigured) {
      toast({
        variant: 'destructive',
        title: 'Supabase not configured',
        description: 'Please set up your Supabase credentials in the .env file.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          role: data.role,
        },
      });
      
      if (authError) throw authError;
      
      // Update profile record with all fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          role: data.role,
          title: data.title,
          institution: data.institution,
          location: data.location,
          bio: data.bio,
          avatar_url: data.avatar_url,
          skills: data.skills,
          academic_timeline: data.academic_timeline,
          stats: data.stats
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Refresh profile data
      fetchProfile(user.id);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

// Custom hook to use the auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
