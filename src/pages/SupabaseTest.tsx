import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

const SupabaseTest = () => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>('');

  const testInsert = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "You must be logged in to run this test."
      });
      return;
    }

    setIsLoading(true);
    setResults('');

    try {
      // Log the current user
      console.log('Current user:', user);
      setResults('User ID: ' + user.id + '\n');
      
      // Test 1: Query profiles table
      setResults(prev => prev + '\nTest 1: Querying profiles table...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        setResults(prev => prev + '\n❌ Error querying profile: ' + profileError.message);
      } else {
        setResults(prev => prev + '\n✅ Successfully queried profile: ' + JSON.stringify(profile));
      }
      
      // Test 2: Check questions table structure
      setResults(prev => prev + '\n\nTest 2: Checking questions table structure...');
      const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', { table_name: 'questions' });
      
      if (tableError) {
        setResults(prev => prev + '\n❌ Error checking table: ' + tableError.message);
      } else {
        setResults(prev => prev + '\n✅ Table structure: ' + JSON.stringify(tableInfo));
      }
      
      // Test 3: Simple insert
      setResults(prev => prev + '\n\nTest 3: Testing simple insert...');
      const testTitle = 'Test Question ' + Date.now();
      const { data: insertData, error: insertError } = await supabase
        .from('questions')
        .insert({
          title: testTitle,
          content: 'This is a test question created to diagnose issues.',
          tags: ['test', 'debug'],
          author_id: user.id
        })
        .select();
        
      if (insertError) {
        setResults(prev => prev + '\n❌ Error inserting question: ' + insertError.message);
      } else {
        setResults(prev => prev + '\n✅ Successfully inserted question: ' + JSON.stringify(insertData));
      }
      
      // Test 4: Fetch questions
      setResults(prev => prev + '\n\nTest 4: Fetching questions...');
      const { data: questions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (fetchError) {
        setResults(prev => prev + '\n❌ Error fetching questions: ' + fetchError.message);
      } else {
        setResults(prev => prev + '\n✅ Successfully fetched ' + questions.length + ' questions');
        if (questions.length > 0) {
          setResults(prev => prev + '\nFirst question: ' + JSON.stringify(questions[0]));
        }
      }
      
      // Test 5: Check answers table structure
      setResults(prev => prev + '\n\nTest 5: Checking answers table structure...');
      const { data: answersTableInfo, error: answersTableError } = await supabase.rpc('get_table_info', { table_name: 'answers' });
      
      if (answersTableError) {
        setResults(prev => prev + '\n❌ Error checking answers table: ' + answersTableError.message);
      } else {
        setResults(prev => prev + '\n✅ Answers table structure: ' + JSON.stringify(answersTableInfo));
      }
      
      // Test 6: Insert an answer
      if (questions.length > 0) {
        setResults(prev => prev + '\n\nTest 6: Testing answer insert...');
        const { data: answerInsertData, error: answerInsertError } = await supabase
          .from('answers')
          .insert({
            question_id: questions[0].id,
            content: 'This is a test answer created to diagnose issues. ' + Date.now(),
            author_id: user.id
          })
          .select();
          
        if (answerInsertError) {
          setResults(prev => prev + '\n❌ Error inserting answer: ' + answerInsertError.message);
        } else {
          setResults(prev => prev + '\n✅ Successfully inserted answer: ' + JSON.stringify(answerInsertData));
        }
        
        // Test 7: Fetch answers
        setResults(prev => prev + '\n\nTest 7: Fetching answers...');
        const { data: answers, error: fetchAnswersError } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', questions[0].id)
          .order('created_at', { ascending: false });
          
        if (fetchAnswersError) {
          setResults(prev => prev + '\n❌ Error fetching answers: ' + fetchAnswersError.message);
        } else {
          setResults(prev => prev + '\n✅ Successfully fetched ' + answers.length + ' answers');
          if (answers.length > 0) {
            setResults(prev => prev + '\nFirst answer: ' + JSON.stringify(answers[0]));
          }
        }
      }
    } catch (error) {
      console.error('Test error:', error);
      setResults(prev => prev + '\n❌ Unexpected error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const addResult = (text: string) => {
    setResults(prev => prev + text + '\n');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button 
                onClick={testInsert} 
                disabled={isLoading || !user}
              >
                {isLoading ? 'Testing...' : 'Run Supabase Tests'}
              </Button>
            </div>

            {results && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <pre className="whitespace-pre-wrap text-sm">{results}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

// Helper function to get table info (needs to be created in Supabase)
/*
CREATE OR REPLACE FUNCTION get_table_info(table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'column_name', column_name,
    'data_type', data_type,
    'is_nullable', is_nullable
  ))
  INTO result
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = get_table_info.table_name;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

export default SupabaseTest;
