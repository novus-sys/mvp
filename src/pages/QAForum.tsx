
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AskQuestion from '@/components/qa/AskQuestion';
import QuestionList from '@/components/qa/QuestionList';
import { QuestionFilter } from '@/lib/qa-service';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getPopularTags } from '@/lib/qa-service';

const QAForum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('newest');
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<QuestionFilter>({ sortBy: 'newest' });
  const { user } = useSupabaseAuth();
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch popular tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getPopularTags(5);
      setPopularTags(tags);
    };
    
    fetchTags();
  }, []);
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(prev => ({ ...prev, searchQuery }));
    setIsSearching(!!searchQuery);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: string) => {
    setActiveFilter(filterType);
    
    let newFilter: QuestionFilter = {};
    
    // Apply tag filters if any are selected
    if (selectedTags.length > 0) {
      newFilter.tags = selectedTags;
    }
    
    // Apply search query if present
    if (searchQuery) {
      newFilter.searchQuery = searchQuery;
    }
    
    // Apply specific filters based on selection
    switch (filterType) {
      case 'newest':
        newFilter.sortBy = 'newest';
        break;
      case 'top':
        newFilter.sortBy = 'votes';
        break;
      case 'unanswered':
        newFilter.sortBy = 'unanswered';
        break;
      case 'my-questions':
        newFilter.userQuestions = true;
        break;
      case 'my-answers':
        newFilter.userAnswers = true;
        break;
      default:
        newFilter.sortBy = 'newest';
    }
    
    setFilter(newFilter);
  };
  
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Update filter when selected tags change
  useEffect(() => {
    setFilter(prev => ({
      ...prev,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    }));
  }, [selectedTags]);
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
                <AskQuestion onQuestionAdded={() => handleFilterChange(activeFilter)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Academic Q&A Forum</h2>
          <form onSubmit={handleSearch} className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        {selectedTags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Filtered by:</span>
              {selectedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 cursor-pointer"
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedTags([])}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="hidden md:block col-span-1 space-y-4">
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Popular Topics</h3>
              <div className="space-y-2">
                {popularTags.length > 0 ? (
                  popularTags.map(tag => (
                    <Button 
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => handleTagSelect(tag)}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {tag}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No topics found</p>
                )}
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Question Type</h3>
              <div className="space-y-2">
                <Button 
                  variant={activeFilter === 'newest' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleFilterChange('newest')}
                >
                  Newest Questions
                </Button>
                <Button 
                  variant={activeFilter === 'top' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleFilterChange('top')}
                >
                  Top Questions
                </Button>
                <Button 
                  variant={activeFilter === 'unanswered' ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => handleFilterChange('unanswered')}
                >
                  Unanswered
                </Button>
                {user && (
                  <>
                    <Button 
                      variant={activeFilter === 'my-questions' ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => handleFilterChange('my-questions')}
                    >
                      Your Questions
                    </Button>
                    <Button 
                      variant={activeFilter === 'my-answers' ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => handleFilterChange('my-answers')}
                    >
                      Answered by You
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <QuestionList 
              filter={filter} 
              title={isSearching ? "Search Results" : undefined}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QAForum;
