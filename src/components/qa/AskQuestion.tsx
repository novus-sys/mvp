
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Tag, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { createQuestion } from '@/lib/qa-service';

interface AskQuestionProps {
  onQuestionAdded?: () => void;
}

const AskQuestion = ({ onQuestionAdded }: AskQuestionProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your question.",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to post a question.",
      });
      return;
    }
    
    console.log('Current user:', user);
    console.log('User ID:', user.id);
    
    setIsSubmitting(true);
    
    try {
      // Process tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      console.log('Processed tags:', tagArray);
      
      // Create the question
      console.log('Submitting question with:', { title, content, tagArray, user });
      try {
        const result = await createQuestion(title, content, tagArray, user);
        
        console.log('Question created successfully:', result);
        toast({
          title: "Question posted",
          description: "Your question has been successfully posted.",
        });
        
        // Reset form
        setTitle('');
        setContent('');
        setTags('');
        
        // Notify parent component
        if (onQuestionAdded) {
          onQuestionAdded();
        }
      } catch (createError) {
        console.error('Error from createQuestion:', createError);
        throw createError;
      }
    } catch (error) {
      console.error('Error posting question:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        variant: "destructive",
        title: "Error posting question",
        description: error instanceof Error 
          ? `${error.message}` 
          : "An unknown error occurred while creating your question",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-title">Question Title</Label>
            <Input
              id="question-title"
              placeholder="e.g., How to implement deep learning in Python?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question-content">Question Details</Label>
            <Textarea
              id="question-content"
              placeholder="Provide details about your question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question-tags" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <Input
              id="question-tags"
              placeholder="e.g., machine-learning, python, data-science (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Add up to 5 tags to help others find your question
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={isSubmitting}
            type="submit" 
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {isSubmitting ? "Posting..." : "Post Question"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AskQuestion;
