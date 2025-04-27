-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE
);

-- Create RLS policies for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Everyone can view questions
CREATE POLICY "Questions are viewable by everyone" 
ON questions FOR SELECT USING (true);

-- Only authenticated users can insert questions
CREATE POLICY "Authenticated users can create questions" 
ON questions FOR INSERT TO authenticated USING (true);

-- Users can update their own questions
CREATE POLICY "Users can update their own questions" 
ON questions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete their own questions" 
ON questions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Everyone can view answers
CREATE POLICY "Answers are viewable by everyone" 
ON answers FOR SELECT USING (true);

-- Only authenticated users can insert answers
CREATE POLICY "Authenticated users can create answers" 
ON answers FOR INSERT TO authenticated USING (true);

-- Users can update their own answers
CREATE POLICY "Users can update their own answers" 
ON answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete their own answers" 
ON answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create function to update question updated_at timestamp when an answer is added
CREATE OR REPLACE FUNCTION update_question_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions SET updated_at = NOW() WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when an answer is added
CREATE TRIGGER update_question_timestamp
AFTER INSERT ON answers
FOR EACH ROW
EXECUTE FUNCTION update_question_timestamp();
