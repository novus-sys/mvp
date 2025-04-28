import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { MentorData } from './mentorship-service';

// Define recommendation score interface
export interface RecommendationScore {
  mentorId: string;
  score: number;
  matchReasons: string[];
}

// Define user interests interface
export interface UserInterests {
  academicInterests: string[];
  researchTopics: string[];
  careerGoals: string[];
  skillsToLearn: string[];
}

/**
 * Get mentor recommendations for a user based on their interests and mentor profiles
 * @param user The current user
 * @param userInterests The user's interests
 * @returns Array of recommended mentors with scores
 */
export const getMentorRecommendations = async (
  user: User,
  userInterests: UserInterests
): Promise<RecommendationScore[]> => {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError || !profiles) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }
    
    // Get mentor data from local storage
    const mentorDataKey = 'thinkbridge_mentor_data';
    let mentorDataMap: Record<string, MentorData> = {};
    
    try {
      const mentorDataStr = localStorage.getItem(mentorDataKey);
      if (mentorDataStr) {
        mentorDataMap = JSON.parse(mentorDataStr);
      }
    } catch (error) {
      console.error('Error reading mentor data from localStorage:', error);
    }
    
    // Get questions posted by mentors to analyze their expertise
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*');
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      // Continue without questions data
    }
    
    // Get answers posted by mentors to analyze their expertise
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*, questions!inner(*)');
    
    if (answersError) {
      console.error('Error fetching answers:', answersError);
      // Continue without answers data
    }
    
    // Calculate recommendation scores for each mentor
    const recommendations: RecommendationScore[] = [];
    
    for (const profile of profiles) {
      // Skip if not a mentor or if it's the current user
      if (!mentorDataMap[profile.id] || profile.id === user.id) {
        continue;
      }
      
      const mentorData = mentorDataMap[profile.id];
      let score = 0;
      const matchReasons: string[] = [];
      
      // 1. Match based on mentor specialization
      if (mentorData.specialization && mentorData.specialization.length > 0) {
        const specializationScore = calculateOverlap(
          mentorData.specialization,
          [
            ...userInterests.academicInterests,
            ...userInterests.researchTopics,
            ...userInterests.skillsToLearn
          ]
        );
        
        score += specializationScore * 3; // Higher weight for specialization
        
        if (specializationScore > 0) {
          matchReasons.push(`Specializes in ${getOverlappingItems(
            mentorData.specialization,
            [
              ...userInterests.academicInterests,
              ...userInterests.researchTopics,
              ...userInterests.skillsToLearn
            ]
          ).join(', ')}`);
        }
      }
      
      // 2. Match based on institution (if available)
      if (profile.institution && user.user_metadata?.institution) {
        if (profile.institution.toLowerCase() === user.user_metadata.institution.toLowerCase()) {
          score += 2;
          matchReasons.push(`From your institution (${profile.institution})`);
        }
      }
      
      // 3. Match based on questions posted by mentor
      if (questions) {
        const mentorQuestions = questions.filter(q => q.author_id === profile.id);
        
        if (mentorQuestions.length > 0) {
          // Extract tags from all mentor questions
          const allTags = mentorQuestions.flatMap(q => q.tags || []);
          
          // Calculate tag overlap with user interests
          const tagScore = calculateOverlap(
            allTags,
            [
              ...userInterests.academicInterests,
              ...userInterests.researchTopics,
              ...userInterests.skillsToLearn
            ]
          );
          
          score += tagScore * 2;
          
          if (tagScore > 0) {
            matchReasons.push(`Posts about ${getOverlappingItems(
              allTags,
              [
                ...userInterests.academicInterests,
                ...userInterests.researchTopics,
                ...userInterests.skillsToLearn
              ]
            ).join(', ')}`);
          }
        }
      }
      
      // 4. Match based on answers provided by mentor
      if (answers) {
        const mentorAnswers = answers.filter(a => a.author_id === profile.id);
        
        if (mentorAnswers.length > 0) {
          // More answers = more experience
          score += Math.min(mentorAnswers.length / 5, 2); // Cap at 2 points
          
          if (mentorAnswers.length >= 5) {
            matchReasons.push(`Active mentor with ${mentorAnswers.length} answers`);
          }
          
          // Extract tags from questions the mentor has answered
          const answeredQuestionTags = mentorAnswers.flatMap(a => a.questions.tags || []);
          
          // Calculate tag overlap with user interests
          const answerTagScore = calculateOverlap(
            answeredQuestionTags,
            [
              ...userInterests.academicInterests,
              ...userInterests.researchTopics,
              ...userInterests.skillsToLearn
            ]
          );
          
          score += answerTagScore * 1.5;
          
          if (answerTagScore > 0) {
            matchReasons.push(`Answers questions about ${getOverlappingItems(
              answeredQuestionTags,
              [
                ...userInterests.academicInterests,
                ...userInterests.researchTopics,
                ...userInterests.skillsToLearn
              ]
            ).join(', ')}`);
          }
        }
      }
      
      // 5. Match based on availability preferences (if any)
      // This would require storing user preferences
      
      // Add to recommendations if score is above threshold
      if (score > 0) {
        recommendations.push({
          mentorId: profile.id,
          score,
          matchReasons: matchReasons.slice(0, 3) // Limit to top 3 reasons
        });
      }
    }
    
    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Error in getMentorRecommendations:', error);
    return [];
  }
};

/**
 * Calculate the overlap between two arrays of strings
 * @param array1 First array
 * @param array2 Second array
 * @returns Overlap score (0-1)
 */
const calculateOverlap = (array1: string[], array2: string[]): number => {
  if (!array1 || !array2 || array1.length === 0 || array2.length === 0) {
    return 0;
  }
  
  // Normalize strings for comparison
  const normalizedArray1 = array1.map(item => item.toLowerCase());
  const normalizedArray2 = array2.map(item => item.toLowerCase());
  
  // Count exact matches
  const exactMatches = normalizedArray1.filter(item => 
    normalizedArray2.includes(item)
  ).length;
  
  // Count partial matches (one string contains the other)
  const partialMatches = normalizedArray1.filter(item => 
    !normalizedArray2.includes(item) && 
    normalizedArray2.some(other => 
      other.includes(item) || item.includes(other)
    )
  ).length;
  
  // Calculate score (exact matches count more than partial)
  return exactMatches + (partialMatches * 0.5);
};

/**
 * Get the overlapping items between two arrays
 * @param array1 First array
 * @param array2 Second array
 * @returns Array of overlapping items
 */
const getOverlappingItems = (array1: string[], array2: string[]): string[] => {
  if (!array1 || !array2 || array1.length === 0 || array2.length === 0) {
    return [];
  }
  
  // Normalize strings for comparison
  const normalizedArray1 = array1.map(item => item.toLowerCase());
  const normalizedArray2 = array2.map(item => item.toLowerCase());
  
  // Get exact matches
  const exactMatches = normalizedArray1.filter(item => 
    normalizedArray2.includes(item)
  );
  
  // Get partial matches
  const partialMatches = normalizedArray1.filter(item => 
    !normalizedArray2.includes(item) && 
    normalizedArray2.some(other => 
      other.includes(item) || item.includes(other)
    )
  );
  
  // Return original case of matching items
  return [...exactMatches, ...partialMatches].map(match => 
    array1.find(item => item.toLowerCase() === match) || match
  );
};

/**
 * Extract interests from user profile and activity
 * @param userId The user ID
 * @returns User interests
 */
export const extractUserInterests = async (userId: string): Promise<UserInterests> => {
  const interests: UserInterests = {
    academicInterests: [],
    researchTopics: [],
    careerGoals: [],
    skillsToLearn: []
  };
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    } else if (profile) {
      // Extract interests from profile fields
      if (profile.bio) {
        // Simple keyword extraction from bio
        const bioKeywords = extractKeywords(profile.bio);
        interests.academicInterests.push(...bioKeywords);
      }
      
      // Extract from skills if available
      if (profile.skills && Array.isArray(profile.skills)) {
        interests.skillsToLearn.push(...profile.skills);
      }
    }
    
    // Get user's questions to extract interests
    const { data: userQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('author_id', userId);
    
    if (questionsError) {
      console.error('Error fetching user questions:', questionsError);
    } else if (userQuestions && userQuestions.length > 0) {
      // Extract tags from user questions
      const allTags = userQuestions.flatMap(q => q.tags || []);
      interests.academicInterests.push(...allTags);
      
      // Extract keywords from question content
      const questionKeywords = userQuestions
        .flatMap(q => extractKeywords(q.content))
        .filter(keyword => keyword.length > 3); // Filter out short words
      
      interests.researchTopics.push(...questionKeywords);
    }
    
    // Deduplicate interests
    interests.academicInterests = [...new Set(interests.academicInterests)];
    interests.researchTopics = [...new Set(interests.researchTopics)];
    interests.careerGoals = [...new Set(interests.careerGoals)];
    interests.skillsToLearn = [...new Set(interests.skillsToLearn)];
    
    return interests;
  } catch (error) {
    console.error('Error in extractUserInterests:', error);
    return interests;
  }
};

/**
 * Extract keywords from text
 * @param text The text to extract keywords from
 * @returns Array of keywords
 */
const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // Common academic fields and topics
  const academicKeywords = [
    'computer science', 'machine learning', 'artificial intelligence', 'data science',
    'mathematics', 'physics', 'chemistry', 'biology', 'engineering',
    'research', 'academic', 'study', 'education', 'learning',
    'thesis', 'dissertation', 'publication', 'journal', 'conference',
    'algorithm', 'theory', 'analysis', 'experiment', 'methodology'
  ];
  
  // Extract matching keywords
  const foundKeywords = academicKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return foundKeywords;
};
