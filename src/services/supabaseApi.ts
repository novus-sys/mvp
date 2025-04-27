import { supabase, Tables, TablesInsert, TablesUpdate } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Generic response type
export type ApiResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

// User types
export type UserProfile = Tables['users'] & {}

// Project types
export type Project = Tables['projects'] & {
  members?: UserProfile[];
  tasks?: ProjectTask[];
}

export type ProjectTask = Tables['project_tasks'] & {}

export type ProjectMember = Tables['project_members'] & {
  user?: UserProfile;
}

// Resource types
export type Resource = Tables['resources'] & {
  uploader?: UserProfile;
  visibility?: 'public' | 'private';
  shared_with?: string[];
}

// Question types
export type Question = Tables['questions'] & {
  author?: UserProfile;
  answers?: Answer[];
}

export type Answer = Tables['answers'] & {
  author?: UserProfile;
}

// Opportunity types
export type Opportunity = Tables['opportunities'] & {
  poster?: UserProfile;
}

// API Functions

// Profiles API
export const profilesApi = {
  getAll: async (): Promise<ApiResponse<UserProfile[]>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
      
    return { data, error };
  },
  getById: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    return { data, error };
  },
  
  update: async (userId: string, userData: TablesUpdate['users']): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
      
    return { data, error };
  },
  
  uploadAvatar: async (userId: string, file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update profile with avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId)
        .select()
        .single();
        
      return { 
        data: { avatar_url: urlData.publicUrl },
        error 
      };
    } catch (error) {
      return { 
        data: null, 
        error: error as Error 
      };
    }
  }
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          *,
          user:profiles (*)
        ),
        project_tasks (*)
      `)
      .order('created_at', { ascending: false });
      
    // Transform data to match our interface
    const transformedData = data?.map(project => {
      const members = project.project_members?.map(member => member.user) || [];
      const tasks = project.project_tasks || [];
      
      return {
        ...project,
        members,
        tasks
      };
    });
    
    return { data: transformedData || null, error };
  },
  
  getById: async (id: string): Promise<ApiResponse<Project>> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          *,
          user:profiles (*)
        ),
        project_tasks (*)
      `)
      .eq('id', id)
      .single();
      
    // Transform data to match our interface
    if (data) {
      const members = data.project_members?.map(member => member.user) || [];
      const tasks = data.project_tasks || [];
      
      const transformedData = {
        ...data,
        members,
        tasks
      };
      
      return { data: transformedData, error };
    }
    
    return { data, error };
  },
  
  create: async (projectData: TablesInsert['projects']): Promise<ApiResponse<Project>> => {
    // First create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
      
    if (projectError) return { data: null, error: projectError };
    
    // Then add the creator as a member with owner role
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{
        project_id: project.id,
        user_id: project.created_by,
        role: 'owner'
      }]);
      
    if (memberError) return { data: null, error: memberError };
    
    // Return the created project
    return await projectsApi.getById(project.id);
  },
  
  update: async (id: string, projectData: TablesUpdate['projects']): Promise<ApiResponse<Project>> => {
    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id);
      
    if (error) return { data: null, error };
    
    // Return the updated project
    return await projectsApi.getById(id);
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    return { data: null, error };
  },
  
  // Project tasks
  addTask: async (projectId: string, taskData: TablesInsert['project_tasks']): Promise<ApiResponse<ProjectTask>> => {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert([{ ...taskData, project_id: projectId }])
      .select()
      .single();
      
    return { data, error };
  },
  
  updateTask: async (taskId: string, taskData: TablesUpdate['project_tasks']): Promise<ApiResponse<ProjectTask>> => {
    const { data, error } = await supabase
      .from('project_tasks')
      .update(taskData)
      .eq('id', taskId)
      .select()
      .single();
      
    return { data, error };
  },
  
  deleteTask: async (taskId: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);
      
    return { data: null, error };
  },
  
  // Project members
  addMember: async (projectId: string, userId: string, role: 'member' | 'viewer' = 'member'): Promise<ApiResponse<ProjectMember>> => {
    const { data, error } = await supabase
      .from('project_members')
      .insert([{
        project_id: projectId,
        user_id: userId,
        role
      }])
      .select()
      .single();
      
    return { data, error };
  },
  
  updateMemberRole: async (projectId: string, userId: string, role: 'owner' | 'member' | 'viewer'): Promise<ApiResponse<ProjectMember>> => {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role })
      .match({ project_id: projectId, user_id: userId })
      .select()
      .single();
      
    return { data, error };
  },
  
  removeMember: async (projectId: string, userId: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .match({ project_id: projectId, user_id: userId });
      
    return { data: null, error };
  }
};

// Resources API
export const resourcesApi = {
  getAll: async (): Promise<ApiResponse<Resource[]>> => {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:profiles!resources_uploaded_by_fkey (*)
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  getAllSharedWithUser: async (userId: string): Promise<ApiResponse<Resource[]>> => {
    // Query resources that are shared with the user directly at the database level
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:profiles!resources_uploaded_by_fkey (*)
      `)
      .eq('visibility', 'private') // Only get private resources
      .not('uploaded_by', userId) // Exclude resources uploaded by the current user
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }
    
    // Double-check the shared_with array just to be safe
    // (This is a safeguard in case the contains query doesn't work as expected)
    const sharedResources = data?.filter(resource => 
      Array.isArray(resource.shared_with) && 
      resource.shared_with.includes(userId)
    ) || [];
    
    return { data: sharedResources, error: null };
  },
  
  getById: async (id: string): Promise<ApiResponse<Resource>> => {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:profiles!resources_uploaded_by_fkey (*)
      `)
      .eq('id', id)
      .single();
      
    return { data, error };
  },
  
  upload: async (userId: string, file: File, metadata: { title: string, description: string, tags: string[], visibility: 'public' | 'private', shared_with?: string[] }): Promise<ApiResponse<Resource>> => {
    try {
      // Upload file to storage
      const fileName = `${Math.random()}-${file.name}`;
      const filePath = `resources/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);
        
      // Create resource record
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          title: metadata.title,
          description: metadata.description,
          file_url: urlData.publicUrl,
          file_type: file.type,
          tags: metadata.tags,
          visibility: metadata.visibility || 'public',
          shared_with: metadata.shared_with || [],
          uploaded_by: userId
        }])
        .select(`
          *,
          uploader:profiles!resources_uploaded_by_fkey (*)
        `)
        .single();
        
      return { data, error };
    } catch (error) {
      return { 
        data: null, 
        error: error as Error 
      };
    }
  },
  
  update: async (id: string, data: { title?: string; description?: string; visibility?: 'public' | 'private'; shared_with?: string[] }): Promise<ApiResponse<Resource>> => {
    try {
      const { data: updatedResource, error } = await supabase
        .from('resources')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          uploader:profiles!resources_uploaded_by_fkey (*)
        `)
        .single();
        
      return { data: updatedResource, error };
    } catch (error) {
      return { 
        data: null, 
        error: error as Error 
      };
    }
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      // First get the resource to get the file path
      const { data: resource, error: getError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();
        
      if (getError) throw getError;
      if (!resource) throw new Error('Resource not found');
      
      // Extract the file name from the URL
      const fileName = resource.file_url.split('/').pop();
      const filePath = `resources/${fileName}`;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([filePath]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
        
      return { data: null, error };
    } catch (error) {
      return { 
        data: null, 
        error: error as Error 
      };
    }
  }
};

// Forum API
export const forumApi = {
  getAllQuestions: async (): Promise<ApiResponse<Question[]>> => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        author:profiles!questions_author_id_fkey (*),
        answers (
          *,
          author:profiles!answers_author_id_fkey (*)
        )
      `)
      .order('created_at', { ascending: false });
      
    return { data, error };
  },
  
  getQuestionById: async (id: string): Promise<ApiResponse<Question>> => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        author:profiles!questions_author_id_fkey (*),
        answers (
          *,
          author:profiles!answers_author_id_fkey (*)
        )
      `)
      .eq('id', id)
      .single();
      
    return { data, error };
  },
  
  createQuestion: async (questionData: TablesInsert['questions']): Promise<ApiResponse<Question>> => {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select(`
        *,
        author:profiles!questions_author_id_fkey (*),
        answers (
          *,
          author:profiles!answers_author_id_fkey (*)
        )
      `)
      .single();
      
    return { data, error };
  },
  
  updateQuestion: async (id: string, questionData: TablesUpdate['questions']): Promise<ApiResponse<Question>> => {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!questions_author_id_fkey (*),
        answers (
          *,
          author:profiles!answers_author_id_fkey (*)
        )
      `)
      .single();
      
    return { data, error };
  },
  
  deleteQuestion: async (id: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
      
    return { data: null, error };
  },
  
  addAnswer: async (questionId: string, answerData: TablesInsert['answers']): Promise<ApiResponse<Answer>> => {
    const { data, error } = await supabase
      .from('answers')
      .insert([{ ...answerData, question_id: questionId }])
      .select(`
        *,
        author:profiles!answers_author_id_fkey (*)
      `)
      .single();
      
    return { data, error };
  },
  
  updateAnswer: async (answerId: string, answerData: TablesUpdate['answers']): Promise<ApiResponse<Answer>> => {
    const { data, error } = await supabase
      .from('answers')
      .update(answerData)
      .eq('id', answerId)
      .select(`
        *,
        author:profiles!answers_author_id_fkey (*)
      `)
      .single();
      
    return { data, error };
  },
  
  deleteAnswer: async (answerId: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId);
      
    return { data: null, error };
  }
};

// Opportunities API
export const opportunitiesApi = {
  getAll: async (): Promise<ApiResponse<Opportunity[]>> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        poster:profiles!opportunities_posted_by_fkey (*)
      `)
      .order('created_at', { ascending: false });
      
    return { data, error };
  },
  
  getById: async (id: string): Promise<ApiResponse<Opportunity>> => {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        poster:profiles!opportunities_posted_by_fkey (*)
      `)
      .eq('id', id)
      .single();
      
    return { data, error };
  },
  
  create: async (opportunityData: TablesInsert['opportunities']): Promise<ApiResponse<Opportunity>> => {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunityData])
      .select(`
        *,
        poster:profiles!opportunities_posted_by_fkey (*)
      `)
      .single();
      
    return { data, error };
  },
  
  update: async (id: string, opportunityData: TablesUpdate['opportunities']): Promise<ApiResponse<Opportunity>> => {
    const { data, error } = await supabase
      .from('opportunities')
      .update(opportunityData)
      .eq('id', id)
      .select(`
        *,
        poster:profiles!opportunities_posted_by_fkey (*)
      `)
      .single();
      
    return { data, error };
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);
      
    return { data: null, error };
  }
};
