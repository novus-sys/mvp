-- Create profiles table (extends the auth.users table)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'researcher', 'educator', 'admin')),
  institution TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for projects (will add more after project_members is created)
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Project creators can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create project_members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Project members are viewable by everyone"
  ON project_members FOR SELECT
  USING (true);

CREATE POLICY "Project owners can add members"
  ON project_members FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_members.project_id AND role = 'owner'
  ) OR auth.uid() = user_id);

CREATE POLICY "Project owners can update member roles"
  ON project_members FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_members.project_id AND role = 'owner'
  ));

CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_members.project_id AND role = 'owner'
  ) OR auth.uid() = user_id);

-- Now add the remaining policies for projects that depend on project_members
CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = id AND role = 'owner'
  ));

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = id AND role = 'owner'
  ));

-- Create project_tasks table
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Project tasks are viewable by everyone"
  ON project_tasks FOR SELECT
  USING (true);

CREATE POLICY "Project members can insert tasks"
  ON project_tasks FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_tasks.project_id AND role IN ('owner', 'member')
  ));

CREATE POLICY "Project members can update tasks"
  ON project_tasks FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_tasks.project_id AND role IN ('owner', 'member')
  ));

CREATE POLICY "Project owners can delete tasks"
  ON project_tasks FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_tasks.project_id AND role = 'owner'
  ));

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Resource owners can update their resources"
  ON resources FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Resource owners can delete their resources"
  ON resources FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Question authors can update their questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Question authors can delete their questions"
  ON questions FOR DELETE
  USING (auth.uid() = author_id);

-- Create answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Answers are viewable by everyone"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post answers"
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Answer authors can update their answers"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Answer authors can delete their answers"
  ON answers FOR DELETE
  USING (auth.uid() = author_id);

-- Create opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  link TEXT,
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Opportunities are viewable by everyone"
  ON opportunities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Opportunity posters can update their opportunities"
  ON opportunities FOR UPDATE
  USING (auth.uid() = posted_by);

CREATE POLICY "Opportunity posters can delete their opportunities"
  ON opportunities FOR DELETE
  USING (auth.uid() = posted_by);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets
-- Note: This needs to be done in the Supabase dashboard or using the Supabase CLI
-- INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'User Avatars');
-- INSERT INTO storage.buckets (id, name) VALUES ('resources', 'Academic Resources');

-- Set up storage policies
-- Note: This needs to be done in the Supabase dashboard or using the Supabase CLI
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
-- CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');
-- CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'avatars');

-- CREATE POLICY "Resource files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
-- CREATE POLICY "Anyone can upload a resource" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resources');
-- CREATE POLICY "Users can update their own resources" ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'resources');
-- CREATE POLICY "Users can delete their own resources" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'resources');
