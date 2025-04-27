
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  posted: string;
}

const questions: Question[] = [
  {
    id: '1',
    title: 'What are the best machine learning techniques for natural language processing?',
    preview: 'I\'m working on a research project that analyzes large text datasets and need to implement...',
    tags: ['machine-learning', 'nlp', 'research'],
    votes: 24,
    answers: 7,
    views: 342,
    author: { 
      name: 'Sanjay Mehta',
      initials: 'SM',
    },
    posted: '2 days ago',
  },
  {
    id: '2',
    title: 'How to implement efficient data structures for graph algorithms?',
    preview: 'I\'m comparing different data structures for representing graphs in a network analysis project...',
    tags: ['algorithms', 'data-structures', 'graphs'],
    votes: 18,
    answers: 5,
    views: 216,
    author: { 
      name: 'Priya Sharma',
      initials: 'PS',
    },
    posted: '5 days ago',
  },
  {
    id: '3',
    title: 'Best practices for designing chemistry experiments in resource-limited settings?',
    preview: 'Our university has limited lab equipment and I\'m trying to design experiments that are still effective...',
    tags: ['chemistry', 'experiments', 'education'],
    votes: 31,
    answers: 12,
    views: 490,
    author: { 
      name: 'Rahul Kumar',
      initials: 'RK',
    },
    posted: '1 week ago',
  },
  {
    id: '4',
    title: 'Statistical methods for analyzing qualitative research data in sociology?',
    preview: 'I\'m conducting interviews for my sociology thesis and need guidance on analyzing the qualitative data...',
    tags: ['statistics', 'sociology', 'research-methods'],
    votes: 15,
    answers: 4,
    views: 178,
    author: { 
      name: 'Aisha Patel',
      initials: 'AP',
    },
    posted: '2 weeks ago',
  },
];

const QuestionList = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Questions</h2>
        <Button className="bg-brand-purple hover:bg-brand-purple/90">
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask Question
        </Button>
      </div>
      
      {questions.map((question) => (
        <Card key={question.id} className="hover:border-brand-purple/50 transition-colors">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-brand-orange" />
                  <span className="font-medium">{question.votes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-brand-blue" />
                  <span>{question.answers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{question.views}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">
                  <a href="#" className="hover:text-brand-purple transition-colors">
                    {question.title}
                  </a>
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
                      <AvatarImage src={question.author.avatar} alt={question.author.name} />
                      <AvatarFallback className="bg-brand-purple text-white text-xs">
                        {question.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{question.author.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{question.posted}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-center mt-6">
        <Button variant="outline">Load More Questions</Button>
      </div>
    </div>
  );
};

export default QuestionList;
