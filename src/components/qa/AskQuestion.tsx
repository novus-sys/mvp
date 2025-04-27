
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Tag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your question.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      toast({
        title: "Question posted",
        description: "Your question has been posted successfully.",
      });
      setTitle('');
      setContent('');
      setTags('');
      setIsSubmitting(false);
    }, 1000);
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
