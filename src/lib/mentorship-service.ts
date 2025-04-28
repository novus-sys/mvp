import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Define mentor data structure
export interface MentorData {
  userId: string;
  isMentor: boolean;
  specialization: string[];
  availability: string;
  createdAt: string;
  updatedAt: string;
}

// Local storage key for mentor data
const MENTOR_DATA_KEY = 'thinkbridge_mentor_data';

/**
 * Register the current user as a mentor
 * @param user The authenticated user
 * @param mentorData Additional mentor data
 * @returns Success status
 */
export const registerAsMentor = async (
  user: User,
  mentorData: {
    specialization?: string[];
    availability?: string;
  } = {}
): Promise<boolean> => {
  try {
    console.log('Registering user as mentor:', user.id);
    
    // Create mentor data object
    const mentorInfo: MentorData = {
      userId: user.id,
      isMentor: true,
      specialization: mentorData.specialization || ['General Academic Guidance'],
      availability: mentorData.availability || 'Weekly, 1-hour sessions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // First try to store in Supabase profiles table as a JSON field
    try {
      // Update the user's metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          is_mentor: true,
          mentor_data: mentorInfo
        }
      });
      
      if (authError) {
        console.error('Error updating auth metadata:', authError);
      } else {
        console.log('Successfully updated auth metadata with mentor status');
      }
    } catch (error) {
      console.error('Error updating auth metadata:', error);
    }
    
    // Store in localStorage as a fallback
    try {
      // Get existing mentor data from localStorage
      const existingDataStr = localStorage.getItem(MENTOR_DATA_KEY);
      let existingData: Record<string, MentorData> = {};
      
      if (existingDataStr) {
        existingData = JSON.parse(existingDataStr);
      }
      
      // Add or update this user's mentor data
      existingData[user.id] = mentorInfo;
      
      // Save back to localStorage
      localStorage.setItem(MENTOR_DATA_KEY, JSON.stringify(existingData));
      console.log('Successfully stored mentor data in localStorage');
    } catch (storageError) {
      console.error('Error storing in localStorage:', storageError);
      // This is just a fallback, so we'll continue even if it fails
    }
    
    console.log('Successfully registered as mentor');
    return true;
  } catch (error) {
    console.error('Error in registerAsMentor:', error);
    return false;
  }
};

/**
 * Check if the current user is registered as a mentor
 * @param userId The user ID to check
 * @returns Boolean indicating if user is a mentor
 */
export const checkMentorStatus = async (userId: string): Promise<boolean> => {
  try {
    // First check in auth metadata
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData && authData.user && authData.user.id === userId) {
      const userData = authData.user.user_metadata;
      if (userData && userData.is_mentor === true) {
        return true;
      }
    }
    
    // Then check in localStorage
    try {
      const existingDataStr = localStorage.getItem(MENTOR_DATA_KEY);
      if (existingDataStr) {
        const existingData = JSON.parse(existingDataStr);
        if (existingData[userId] && existingData[userId].isMentor === true) {
          return true;
        }
      }
    } catch (storageError) {
      console.error('Error reading from localStorage:', storageError);
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkMentorStatus:', error);
    return false;
  }
};

/**
 * Unregister the current user from being a mentor
 * @param user The authenticated user
 * @returns Success status
 */
export const unregisterAsMentor = async (user: User): Promise<boolean> => {
  try {
    console.log('Unregistering user as mentor:', user.id);
    
    // First remove from Supabase auth metadata
    try {
      // Update the user's metadata in auth to remove mentor status
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          is_mentor: false,
          mentor_data: null
        }
      });
      
      if (authError) {
        console.error('Error updating auth metadata:', authError);
      } else {
        console.log('Successfully updated auth metadata to remove mentor status');
      }
    } catch (error) {
      console.error('Error updating auth metadata:', error);
    }
    
    // Remove from localStorage as well
    try {
      // Get existing mentor data from localStorage
      const existingDataStr = localStorage.getItem(MENTOR_DATA_KEY);
      if (existingDataStr) {
        let existingData: Record<string, MentorData> = JSON.parse(existingDataStr);
        
        // Remove this user's mentor data
        if (existingData[user.id]) {
          delete existingData[user.id];
          
          // Save back to localStorage
          localStorage.setItem(MENTOR_DATA_KEY, JSON.stringify(existingData));
          console.log('Successfully removed mentor data from localStorage');
        }
      }
    } catch (storageError) {
      console.error('Error removing from localStorage:', storageError);
    }
    
    // Try to remove from mentor_data table if it exists
    try {
      const { error } = await supabase
        .from('mentor_data')
        .delete()
        .eq('user_id', user.id);
        
      if (error) {
        console.log('Note: Could not remove from mentor_data table:', error);
        // This is expected if the table doesn't exist or the user doesn't have a record
      } else {
        console.log('Successfully removed from mentor_data table');
      }
    } catch (dbError) {
      console.error('Error removing from mentor_data table:', dbError);
      // Continue even if this fails
    }
    
    console.log('Successfully unregistered as mentor');
    return true;
  } catch (error) {
    console.error('Error in unregisterAsMentor:', error);
    return false;
  }
};

/**
 * Get all registered mentors
 * @returns Array of mentor profiles with their mentor data
 */
export const getMentors = async () => {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError || !profiles) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }
    
    // Get mentor data from localStorage
    let localMentorData: Record<string, MentorData> = {};
    try {
      const existingDataStr = localStorage.getItem(MENTOR_DATA_KEY);
      if (existingDataStr) {
        localMentorData = JSON.parse(existingDataStr);
      }
    } catch (storageError) {
      console.error('Error reading from localStorage:', storageError);
    }
    
    // Filter profiles that are mentors
    const mentorProfiles = [];
    
    for (const profile of profiles) {
      // Check if this profile is a mentor in localStorage
      if (localMentorData[profile.id]) {
        mentorProfiles.push({
          ...profile,
          mentorData: localMentorData[profile.id]
        });
      }
    }
    
    return mentorProfiles;
  } catch (error) {
    console.error('Error in getMentors:', error);
    return [];
  }
};
