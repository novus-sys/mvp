import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  getQuestionById, 
  getAnswersByQuestionId, 
  createAnswer, 
  voteQuestion,
  voteAnswer,
  acceptAnswer,
  deleteQuestion,
  Question,
  Answer
} from '@/lib/qa-service';
import { cn } from '@/lib/utils';

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch question and answers
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      console.log('Fetching data for question ID:', id);
      setIsLoading(true);
      try {
        const questionData = await getQuestionById(id);
        console.log('Question data fetched:', questionData);
        
        if (questionData) {
          setQuestion(questionData);
          
          console.log('Fetching answers for question ID:', id);
          const answersData = await getAnswersByQuestionId(id);
          console.log('Answers data fetched:', answersData);
          setAnswers(answersData);
          console.log('Answers state set with data length:', answersData.length);
        } else {
          console.error('Question not found');
          toast({
            variant: "destructive",
            title: "Question not found",
            description: "The question you're looking for doesn't exist or has been removed."
          });
          navigate('/qa');
        }
      } catch (error) {
        console.error('Error fetching question details:', error);
        toast({
          variant: "destructive",
          title: "Error loading question",
          description: "There was a problem loading the question details."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  // Handle answer submission
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting answer...');
    
    if (!answerContent.trim()) {
      console.log('Answer content is empty');
      toast({
        variant: "destructive",
        title: "Empty answer",
        description: "Please write something before submitting your answer."
      });
      return;
    }
    
    if (!user) {
      console.log('User not logged in');
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to post an answer."
      });
      return;
    }
    
    if (!id) {
      console.log('Question ID is missing');
      return;
    }
    
    console.log('Proceeding with answer submission for question ID:', id);
    setIsSubmitting(true);
    try {
      console.log('Calling createAnswer with content length:', answerContent.length);
      const result = await createAnswer(id, answerContent, user);
      
      if (result) {
        console.log('Answer created successfully:', result);
        toast({
          title: "Answer posted",
          description: "Your answer has been posted successfully."
        });
        
        // Refresh answers
        console.log('Refreshing answers list...');
        const updatedAnswers = await getAnswersByQuestionId(id);
        console.log('Setting updated answers:', updatedAnswers);
        setAnswers(updatedAnswers);
        
        // Refresh question to update answer count
        console.log('Refreshing question data...');
        const updatedQuestion = await getQuestionById(id, true);
        if (updatedQuestion) {
          setQuestion(updatedQuestion);
        }
        
        // Clear form
        setAnswerContent('');
      } else {
        console.error('Failed to post answer, result was null');
        throw new Error('Failed to post answer');
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      toast({
        variant: "destructive",
        title: "Error posting answer",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle voting on question
  const handleQuestionVote = async (upvote: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to vote."
      });
      return;
    }
    
    if (!question || !id) return;
    
    try {
      const success = await voteQuestion(id, upvote, user);
      
      if (success) {
        // Refresh question without incrementing view count
        const updatedQuestion = await getQuestionById(id, true); // Skip view increment
        if (updatedQuestion) {
          setQuestion(updatedQuestion);
        }
        
        toast({
          title: "Vote recorded",
          description: `You ${upvote ? 'upvoted' : 'downvoted'} this question.`
        });
      }
    } catch (error) {
      console.error('Error voting on question:', error);
      toast({
        variant: "destructive",
        title: "Error voting",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  // Handle voting on answer
  const handleAnswerVote = async (answerId: string, upvote: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to vote."
      });
      return;
    }
    
    if (!id) return;
    
    try {
      const success = await voteAnswer(answerId, upvote, user);
      
      if (success) {
        // Refresh answers
        const updatedAnswers = await getAnswersByQuestionId(id);
        setAnswers(updatedAnswers);
        
        // Refresh question without incrementing view count
        const updatedQuestion = await getQuestionById(id, true); // Skip view increment
        if (updatedQuestion) {
          setQuestion(updatedQuestion);
        }
        
        toast({
          title: "Vote recorded",
          description: `You ${upvote ? 'upvoted' : 'downvoted'} this answer.`
        });
      }
    } catch (error) {
      console.error('Error voting on answer:', error);
      toast({
        variant: "destructive",
        title: "Error voting",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  // Handle deleting the question
  const handleDeleteQuestion = async () => {
    if (!user || !question || !id) return;
    
    // Check if user is the question owner
    if (question.author_id !== user.id) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You can only delete your own questions."
      });
      return;
    }
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const success = await deleteQuestion(id, user);
      
      if (success) {
        toast({
          title: "Question deleted",
          description: "Your question has been successfully deleted."
        });
        navigate('/qa');
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        variant: "destructive",
        title: "Error deleting question",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle accepting an answer
  const handleAcceptAnswer = async (answerId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to accept an answer."
      });
      return;
    }
    
    if (!question || !id) return;
    
    // Check if user is the question owner
    if (question.author_id !== user.id) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only the question owner can accept an answer."
      });
      return;
    }
    
    try {
      const success = await acceptAnswer(id, answerId, user);
      
      if (success) {
        // Refresh answers
        const updatedAnswers = await getAnswersByQuestionId(id);
        setAnswers(updatedAnswers);
        
        // Refresh question without incrementing view count
        const updatedQuestion = await getQuestionById(id, true); // Skip view increment
        if (updatedQuestion) {
          setQuestion(updatedQuestion);
        }
        
        toast({
          title: "Answer accepted",
          description: "You've marked this answer as accepted."
        });
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast({
        variant: "destructive",
        title: "Error accepting answer",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  if (isLoading || !question) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/qa')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Q&A Forum
          </Button>
          
          <Card>
            <CardContent className="p-8 flex justify-center items-center">
              {isLoading ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Loading question...</p>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">Question Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    The question you're looking for doesn't exist or has been removed.
                  </p>
                  <Button onClick={() => navigate('/qa')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Q&A Forum
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Question card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/qa')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Questions
                </Button>
                
                {/* Delete button - only shown to question owner */}
                {user && question.author_id === user.id && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteQuestion}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Question
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-brand-purple/10 hover:text-brand-purple"
                  onClick={() => handleQuestionVote(true)}
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
                <span className="font-medium text-lg">{question.votes}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleQuestionVote(false)}
                >
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Question content */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span>Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{question.views} views</span>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none mb-4">
                  <p>{question.content}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary hover:bg-secondary/80">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={question.author?.avatar_url} alt={question.author?.name} />
                    <AvatarFallback className="bg-brand-purple text-white">
                      {question.author?.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{question.author?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Answers section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>
          
          {answers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  No answers yet. Be the first to answer this question!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {answers.map((answer, index) => {
                console.log(`Rendering answer ${index}:`, answer);
                return (
                  <Card 
                    key={answer.id} 
                    className={cn(
                      "border", 
                      answer.is_accepted && "border-green-500 bg-green-50 dark:bg-green-950/20"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-brand-purple/10 hover:text-brand-purple"
                            onClick={() => handleAnswerVote(answer.id, true)}
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </Button>
                          <span className="font-medium text-lg">{answer.votes || 0}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleAnswerVote(answer.id, false)}
                          >
                            <ThumbsDown className="h-5 w-5" />
                          </Button>
                          
                          {/* Accept answer button (only shown to question owner) */}
                          {user && question.author_id === user.id && (
                            <Button 
                              variant={answer.is_accepted ? "default" : "outline"} 
                              size="icon" 
                              className={cn(
                                "h-8 w-8 rounded-full mt-2",
                                answer.is_accepted 
                                  ? "bg-green-500 hover:bg-green-600 text-white" 
                                  : "hover:border-green-500 hover:text-green-500"
                              )}
                              onClick={() => handleAcceptAnswer(answer.id)}
                              disabled={answer.is_accepted}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                          
                          {/* Show accepted indicator for non-owners */}
                          {answer.is_accepted && (!user || question.author_id !== user.id) && (
                            <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center mt-2">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        
                        {/* Answer content */}
                        <div className="flex-1">
                          <div className="prose prose-sm max-w-none mb-4">
                            <p>{answer.content}</p>
                          </div>
                          
                          {answer.is_accepted && (
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm p-2 rounded-md mb-4 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              This answer was accepted by the question author
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-6">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={answer.author?.avatar_url} alt={answer.author?.name} />
                              <AvatarFallback className="bg-brand-blue text-white">
                                {answer.author?.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{answer.author?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Answered {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Post answer form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleSubmitAnswer}>
                <Textarea 
                  placeholder="Write your answer here..." 
                  className="min-h-[150px] mb-4"
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  className="bg-brand-purple hover:bg-brand-purple/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Post Your Answer
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to answer this question.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  Log In to Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default QuestionDetail;
