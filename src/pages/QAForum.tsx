
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AskQuestion from '@/components/qa/AskQuestion';
import QuestionList from '@/components/qa/QuestionList';

const QAForum = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-indigo-900 text-white rounded-lg p-8 mb-8 bg-[url('https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Share & grow the world's knowledge!</h1>
            <p className="text-lg opacity-90 mb-8">
              The question and answer community designed to help academics connect, share knowledge, and collaborate.
            </p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-900 hover:bg-white/90">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask a Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AskQuestion />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Academic Q&A Forum</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search questions..." className="pl-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="hidden md:block col-span-1 space-y-4">
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Popular Topics</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Machine Learning
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Data Science
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Research Methodology
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Quantum Computing
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Renewable Energy
                </Button>
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Question Type</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Newest Questions
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Top Questions
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Unanswered
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Your Questions
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Answered by You
                </Button>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <QuestionList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QAForum;
