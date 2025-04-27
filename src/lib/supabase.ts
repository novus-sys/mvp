import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder-url.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key');

if (!isSupabaseConfigured) {
  console.warn('Supabase is not properly configured. Using placeholder values for development.');
  console.warn('Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export type Tables = {
  users: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'researcher' | 'educator' | 'admin';
    institution?: string;
    avatar_url?: string;
    created_at: string;
  };
  projects: {
    id: string;
    title: string;
    description: string;
    category: string;
    progress: number;
    deadline?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  project_members: {
    id: string;
    project_id: string;
    user_id: string;
    role: 'owner' | 'member' | 'viewer';
    joined_at: string;
  };
  project_tasks: {
    id: string;
    project_id: string;
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    created_at: string;
    updated_at: string;
  };
  resources: {
    id: string;
    title: string;
    description: string;
    file_url: string;
    file_type: string;
    tags: string[];
    uploaded_by: string;
    created_at: string;
  };
  questions: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    author_id: string;
    created_at: string;
    updated_at: string;
  };
  answers: {
    id: string;
    question_id: string;
    content: string;
    author_id: string;
    created_at: string;
    updated_at: string;
  };
  opportunities: {
    id: string;
    title: string;
    description: string;
    organization: string;
    location: string;
    type: string;
    deadline: string;
    link: string;
    posted_by: string;
    created_at: string;
  };
};

// Helper types for database operations
export type TablesInsert = {
  [K in keyof Tables]: Omit<Tables[K], 'id' | 'created_at' | 'updated_at'>;
};

export type TablesUpdate = {
  [K in keyof Tables]: Partial<Omit<Tables[K], 'id' | 'created_at' | 'updated_at'>>;
};
