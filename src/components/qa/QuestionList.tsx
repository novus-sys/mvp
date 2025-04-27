
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getQuestions, Question as QuestionType, QuestionFilter } from '@/lib/qa-service';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AskQuestion from './AskQuestion';


const QuestionList = ({ 
  filter = {}, 
  title = "Recent Questions",
  showAskButton = true
}: { 
  filter?: QuestionFilter, 
  title?: string,
  showAskButton?: boolean
}) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [isAskDialogOpen, setIsAskDialogOpen] = useState(false);
  
  const limit = 5;

  useEffect(() => {
    console.log('Filter or page changed, fetching questions:', { filter, page });
    setPage(0); // Reset to first page when filter changes
    fetchQuestions();
  }, [JSON.stringify(filter)]); // Use JSON.stringify to detect all filter changes
  
  useEffect(() => {
    if (page > 0) { // Only fetch for pagination changes, not initial load
      console.log('Page changed, fetching more questions:', page);
      fetchQuestions();
    }
  }, [page]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const offset = page * limit;
      const fetchedQuestions = await getQuestions(
        { ...filter, limit, offset },
        user
      );
      
      if (page === 0) {
        setQuestions(fetchedQuestions);
      } else {
        setQuestions(prev => [...prev, ...fetchedQuestions]);
      }
      
      setHasMore(fetchedQuestions.length === limit);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (id: string) => {
    navigate(`/qa/question/${id}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleQuestionAdded = () => {
    // Reset to page 0 and fetch questions again
    setPage(0);
    fetchQuestions();
    setIsAskDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAskButton && (
          <Dialog open={isAskDialogOpen} onOpenChange={setIsAskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AskQuestion onQuestionAdded={handleQuestionAdded} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {isLoading && page === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      ) : questions.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No questions found</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask the First Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AskQuestion onQuestionAdded={handleQuestionAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      ) : (
        <>
          {questions.map((question) => (
            <Card 
              key={question.id} 
              className="hover:border-brand-purple/50 transition-colors cursor-pointer" 
              onClick={() => handleQuestionClick(question.id)}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                  <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-brand-orange" />
                      <span className="font-medium">{question.votes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-brand-blue" />
                      <span>{question.answers_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{question.views}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium hover:text-brand-purple transition-colors">
                      {question.title}
                    </h3>
                    <p className="text-muted-foreground mt-1">{question.preview}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary hover:bg-secondary/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={question.author?.avatar_url} alt={question.author?.name} />
                          <AvatarFallback className="bg-brand-purple text-white text-xs">
                            {question.author?.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{question.author?.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Questions'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionList;
