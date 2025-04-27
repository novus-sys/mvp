import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Types
export interface Question {
  id: string;
  title: string;
  content: string;
  preview?: string; // Derived from content
  author_id: string; // Changed from user_id to author_id
  tags: string[];
  created_at: string;
  updated_at: string;
  votes: number;
  views: number;
  answers_count?: number; // Calculated field
  author?: {
    name: string;
    avatar_url?: string;
    initials: string;
  };
}

export interface Answer {
  id: string;
  question_id: string;
  content: string;
  author_id: string; // Changed from user_id to author_id
  created_at: string;
  updated_at: string;
  votes?: number; // Make optional since it might not exist in the table
  is_accepted?: boolean; // Make optional since it might not exist in the table
  author?: {
    name: string;
    avatar_url?: string;
    initials: string;
  };
}

export interface QuestionFilter {
  searchQuery?: string;
  tags?: string[];
  sortBy?: 'newest' | 'votes' | 'views' | 'unanswered';
  userQuestions?: boolean;
  userAnswers?: boolean;
  limit?: number;
  offset?: number;
}

// Helper function to generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

// Delete a question
export const deleteQuestion = async (
  questionId: string,
  user: User
): Promise<boolean> => {
  try {
    // First, verify the user is the question owner
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('author_id')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Error fetching question:', questionError);
      throw questionError || new Error('Question not found');
    }

    if (question.author_id !== user.id) {
      throw new Error('Only the question owner can delete this question');
    }

    // First delete all answers associated with this question
    const { error: answersError } = await supabase
      .from('answers')
      .delete()
      .eq('question_id', questionId);

    if (answersError) {
      console.error('Error deleting answers:', answersError);
      throw answersError;
    }

    // Then delete the question
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    return false;
  }
};

// Create a new question
export const createQuestion = async (
  title: string,
  content: string,
  tags: string[],
  user: User
): Promise<Question | null> => {
  try {
    console.log('Creating question with data:', { title, content, tags, userId: user.id });
    
    // Ensure user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      throw new Error('User is not authenticated');
    }
    
    // Ensure tags is an array
    const safeTagsArray = Array.isArray(tags) ? tags : [];
    
    // Create a simplified question object
    const questionData = {
      title,
      content,
      author_id: user.id,  // Changed from user_id to author_id
      tags: safeTagsArray
    };
    
    console.log('Inserting question with data:', questionData);
    
    // Try a simpler insert without .select().single()
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData]);

    if (error) {
      console.error('Error creating question:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }

    console.log('Insert response:', data);
    
    // Fetch the created question
    const { data: questionResult, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('title', title)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (fetchError) {
      console.error('Error fetching created question:', fetchError);
      throw fetchError;
    }
    
    console.log('Question created successfully:', questionResult);
    return questionResult;
  } catch (error) {
    console.error('Error creating question:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // Re-throw to let the component handle it
  }
};

// Get questions with filters
export const getQuestions = async (
  filter: QuestionFilter = {},
  currentUser?: User | null
): Promise<Question[]> => {
  try {
    let query = supabase
      .from('questions')
      .select(`
        *,
        profiles:author_id (name, avatar_url),
        answers:answers (count)
      `);

    // Apply filters
    if (filter.searchQuery) {
      query = query.ilike('title', `%${filter.searchQuery}%`);
    }

    if (filter.tags && filter.tags.length > 0) {
      query = query.contains('tags', filter.tags);
    }

    if (filter.userQuestions && currentUser) {
      query = query.eq('author_id', currentUser.id);
    }

    if (filter.userAnswers && currentUser) {
      // This requires a more complex query with joins
      // For simplicity, we'll handle this differently
      // This is a placeholder
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'votes':
        query = query.order('votes', { ascending: false });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      case 'unanswered':
        // We'll filter this after fetching
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    // Process the data to match our Question interface
    const questions = data.map((item: any) => {
      const profile = item.profiles || {};
      
      // Create a preview from the content (first 150 chars)
      const preview = item.content.length > 150 
        ? `${item.content.substring(0, 150)}...` 
        : item.content;

      // Get the answers count
      const answersCount = item.answers ? item.answers.length : 0;

      return {
        ...item,
        preview,
        answers_count: answersCount,
        author: {
          name: profile.name || 'Anonymous',
          avatar_url: profile.avatar_url,
          initials: getInitials(profile.name || 'Anonymous')
        }
      };
    });

    // Additional filtering for unanswered questions
    if (filter.sortBy === 'unanswered') {
      return questions.filter(q => q.answers_count === 0);
    }

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

// Get a single question by ID
export const getQuestionById = async (id: string, skipViewIncrement: boolean = false): Promise<Question | null> => {
  try {
    // Increment the view count if not skipped
    if (!skipViewIncrement) {
      await supabase.rpc('increment_view_count', { question_id: id });
    }

    // Then fetch the question with related data
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        profiles:author_id (name, avatar_url),
        answers:answers (count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      throw error;
    }

    if (!data) return null;

    const profile = data.profiles || {};
    const answersCount = data.answers ? data.answers.length : 0;

    return {
      ...data,
      answers_count: answersCount,
      author: {
        name: profile.name || 'Anonymous',
        avatar_url: profile.avatar_url,
        initials: getInitials(profile.name || 'Anonymous')
      }
    };
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
};

// Create a new answer
export const createAnswer = async (
  questionId: string,
  content: string,
  user: User
): Promise<Answer | null> => {
  try {
    console.log('Creating answer with data:', {
      question_id: questionId,
      content: content.substring(0, 20) + '...',
      author_id: user.id
    });
    
    // Check if the answers table has votes and is_accepted columns
    const answerData = {
      question_id: questionId,
      content,
      author_id: user.id,
      votes: 0, // Add default value in case the column exists
      is_accepted: false // Add default value in case the column exists
    };
    
    // Try to insert with all fields first
    let result;
    try {
      result = await supabase
        .from('answers')
        .insert([answerData])
        .select()
        .single();
    } catch (insertError) {
      console.error('Error with full insert, trying minimal insert:', insertError);
      // If that fails, try with just the required fields
      const minimalData = {
        question_id: questionId,
        content,
        author_id: user.id
      };
      
      result = await supabase
        .from('answers')
        .insert([minimalData])
        .select()
        .single();
    }
    
    const { data, error } = result;

    if (error) {
      console.error('Error creating answer:', error);
      throw error;
    }

    console.log('Answer created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating answer:', error);
    return null;
  }
};

// Get answers for a question
export const getAnswersByQuestionId = async (questionId: string): Promise<Answer[]> => {
  try {
    console.log('Fetching answers for question ID:', questionId);
    
    const { data, error } = await supabase
      .from('answers')
      .select(`
        *,
        profiles:author_id (name, avatar_url)
      `)
      .eq('question_id', questionId)
      .order('is_accepted', { ascending: false })
      .order('votes', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching answers:', error);
      throw error;
    }

    console.log('Answers fetched successfully, count:', data?.length || 0);
    console.log('Raw answer data:', data);
    
    // Process the data to match our Answer interface
    const processedAnswers = data.map((item: any) => {
      const profile = item.profiles || {};
      
      return {
        ...item,
        // Ensure votes and is_accepted have default values if missing
        votes: item.votes ?? 0,
        is_accepted: item.is_accepted ?? false,
        author: {
          name: profile.name || 'Anonymous',
          avatar_url: profile.avatar_url,
          initials: getInitials(profile.name || 'Anonymous')
        }
      };
    });
    
    console.log('Processed answers:', processedAnswers);
    return processedAnswers;
  } catch (error) {
    console.error('Error fetching answers:', error);
    return [];
  }
};

// Vote on a question
export const voteQuestion = async (
  questionId: string,
  upvote: boolean,
  user: User
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('vote_question', {
      question_id: questionId,
      vote_value: upvote ? 1 : -1,
      user_id: user.id
    });

    if (error) {
      console.error('Error voting on question:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error voting on question:', error);
    return false;
  }
};

// Vote on an answer
export const voteAnswer = async (
  answerId: string,
  upvote: boolean,
  user: User
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('vote_answer', {
      answer_id: answerId,
      vote_value: upvote ? 1 : -1,
      user_id: user.id
    });

    if (error) {
      console.error('Error voting on answer:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error voting on answer:', error);
    return false;
  }
};

// Mark an answer as accepted
export const acceptAnswer = async (
  answerId: string,
  questionId: string,
  user: User
): Promise<boolean> => {
  try {
    // First, verify the user is the question owner
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('author_id') // Changed from user_id to author_id
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      console.error('Error fetching question:', questionError);
      throw questionError || new Error('Question not found');
    }

    if (question.author_id !== user.id) { // Changed from user_id to author_id
      throw new Error('Only the question owner can accept an answer');
    }

    // Reset all answers for this question to not accepted
    const { error: resetError } = await supabase
      .from('answers')
      .update({ is_accepted: false })
      .eq('question_id', questionId);

    if (resetError) {
      console.error('Error resetting accepted answers:', resetError);
      throw resetError;
    }

    // Mark the selected answer as accepted
    const { error: acceptError } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', answerId);

    if (acceptError) {
      console.error('Error accepting answer:', acceptError);
      throw acceptError;
    }

    return true;
  } catch (error) {
    console.error('Error accepting answer:', error);
    return false;
  }
};

// Get popular tags
export const getPopularTags = async (limit = 5): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_popular_tags', { tag_limit: limit });

    if (error) {
      console.error('Error fetching popular tags:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return [];
  }
};
