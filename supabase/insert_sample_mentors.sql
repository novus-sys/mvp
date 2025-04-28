-- Create the mentor_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insert sample mentors
DO $$
DECLARE
  mentor_id UUID;
  mentor_data JSONB;
  specializations TEXT[][];
  availability TEXT[];
  institutions TEXT[];
  roles TEXT[];
  i INTEGER;
BEGIN
  -- Define sample data arrays
  specializations := ARRAY[
    ARRAY['Machine Learning', 'Deep Learning', 'Neural Networks'],
    ARRAY['Quantum Computing', 'Quantum Physics', 'Quantum Information'],
    ARRAY['Data Science', 'Big Data', 'Statistical Analysis'],
    ARRAY['Artificial Intelligence', 'Computer Vision', 'Natural Language Processing'],
    ARRAY['Robotics', 'Automation', 'Control Systems'],
    ARRAY['Bioinformatics', 'Computational Biology', 'Genomics'],
    ARRAY['Renewable Energy', 'Sustainable Development', 'Climate Science'],
    ARRAY['Materials Science', 'Nanotechnology', 'Polymer Chemistry'],
    ARRAY['Neuroscience', 'Cognitive Science', 'Brain-Computer Interfaces'],
    ARRAY['Cybersecurity', 'Network Security', 'Cryptography'],
    ARRAY['Internet of Things', 'Embedded Systems', 'Sensor Networks'],
    ARRAY['Blockchain', 'Distributed Systems', 'Cryptocurrency'],
    ARRAY['Virtual Reality', 'Augmented Reality', 'Human-Computer Interaction'],
    ARRAY['Game Theory', 'Economic Modeling', 'Decision Theory'],
    ARRAY['Operations Research', 'Optimization', 'Logistics'],
    ARRAY['Theoretical Physics', 'Astrophysics', 'Cosmology'],
    ARRAY['Molecular Biology', 'Biochemistry', 'Structural Biology'],
    ARRAY['Environmental Science', 'Ecology', 'Conservation Biology'],
    ARRAY['Public Health', 'Epidemiology', 'Health Informatics'],
    ARRAY['Psychology', 'Behavioral Science', 'Mental Health'],
    ARRAY['Sociology', 'Anthropology', 'Cultural Studies'],
    ARRAY['Political Science', 'International Relations', 'Public Policy'],
    ARRAY['Economics', 'Finance', 'Behavioral Economics'],
    ARRAY['History', 'Archaeology', 'Anthropology'],
    ARRAY['Philosophy', 'Ethics', 'Logic'],
    ARRAY['Literature', 'Linguistics', 'Cultural Studies'],
    ARRAY['Education', 'Pedagogy', 'Learning Sciences'],
    ARRAY['Art History', 'Visual Arts', 'Aesthetics'],
    ARRAY['Music Theory', 'Musicology', 'Composition'],
    ARRAY['Architecture', 'Urban Planning', 'Sustainable Design']
  ];
  
  availability := ARRAY[
    'Weekly, 1-hour sessions',
    'Bi-weekly, 2-hour sessions',
    'Monthly intensive sessions',
    'Flexible scheduling',
    'Email consultations',
    'Weekend availability only',
    'Evenings and weekends',
    'Weekday mornings only',
    'By appointment',
    'Regular office hours'
  ];
  
  institutions := ARRAY[
    'Indian Institute of Technology, Delhi',
    'Indian Institute of Technology, Bombay',
    'Indian Institute of Technology, Madras',
    'Indian Institute of Technology, Kanpur',
    'Indian Institute of Technology, Kharagpur',
    'Indian Institute of Science, Bangalore',
    'Jawaharlal Nehru University, Delhi',
    'Delhi University',
    'Banaras Hindu University',
    'Aligarh Muslim University',
    'Jadavpur University',
    'Jamia Millia Islamia',
    'University of Hyderabad',
    'BITS Pilani',
    'National Institute of Technology, Trichy',
    'National Institute of Technology, Warangal',
    'Tata Institute of Fundamental Research',
    'All India Institute of Medical Sciences',
    'Indian Statistical Institute',
    'Chennai Mathematical Institute'
  ];
  
  roles := ARRAY[
    'educator',
    'researcher',
    'educator',
    'researcher',
    'educator',
    'researcher',
    'researcher',
    'researcher',
    'educator',
    'educator',
    'researcher',
    'educator',
    'researcher',
    'educator',
    'researcher',
    'educator',
    'researcher',
    'educator',
    'researcher',
    'educator'
  ];
  
  -- Insert 5 sample mentors
  FOR i IN 1..5 LOOP
    -- Generate a UUID for the mentor
    mentor_id := gen_random_uuid();
    
    -- Insert into profiles table
    INSERT INTO profiles (
      id,
      name,
      email,
      role,
      institution,
      created_at
    ) VALUES (
      mentor_id,
      'Mentor ' || i || ' ' || (
        CASE 
          WHEN i % 3 = 0 THEN 'Sharma'
          WHEN i % 3 = 1 THEN 'Patel'
          ELSE 'Kumar'
        END
      ),
      'mentor' || i || '@example.com',
      roles[1 + (i % array_length(roles, 1))],
      institutions[1 + (i % array_length(institutions, 1))],
      NOW() - (random() * interval '365 days')
    );
    
    -- Create mentor data with bio included
    mentor_data := json_build_object(
      'userId', mentor_id,
      'isMentor', true,
      'specialization', specializations[1 + (i % array_length(specializations, 1))],
      'availability', availability[1 + (i % array_length(availability, 1))],
      'bio', CASE 
        WHEN i % 5 = 0 THEN 'Experienced researcher with expertise in ' || specializations[1 + (i % array_length(specializations, 1))][1] || ' and ' || specializations[1 + (i % array_length(specializations, 1))][2] || '. Published in top journals and conferences.'
        WHEN i % 5 = 1 THEN 'Passionate about mentoring students in ' || specializations[1 + (i % array_length(specializations, 1))][1] || '. Over 10 years of teaching and research experience.'
        WHEN i % 5 = 2 THEN 'Leading expert in ' || specializations[1 + (i % array_length(specializations, 1))][1] || ' with industry and academic experience. Looking to guide motivated students.'
        WHEN i % 5 = 3 THEN 'Dedicated to advancing research in ' || specializations[1 + (i % array_length(specializations, 1))][1] || ' and ' || specializations[1 + (i % array_length(specializations, 1))][3] || '. Open to collaboration and mentorship.'
        ELSE 'Award-winning educator specializing in ' || specializations[1 + (i % array_length(specializations, 1))][1] || '. Committed to helping students achieve their academic goals.'
      END,
      'createdAt', (NOW() - (random() * interval '180 days'))::text,
      'updatedAt', NOW()::text
    );
    
    -- Insert into mentor_data table
    INSERT INTO mentor_data (user_id, data)
    VALUES (mentor_id, mentor_data);
  END LOOP;
END $$;

-- Create sample questions and answers for mentors
DO $$
DECLARE
  mentor_ids UUID[];
  question_id UUID;
  question_tags TEXT[][];
  question_titles TEXT[];
  question_contents TEXT[];
  answer_contents TEXT[];
  i INTEGER;
  j INTEGER;
  random_mentor UUID;
BEGIN
  -- Get all mentor IDs
  SELECT array_agg(user_id) INTO mentor_ids FROM mentor_data;
  
  -- Define sample question data
  question_tags := ARRAY[
    ARRAY['machine-learning', 'neural-networks', 'deep-learning'],
    ARRAY['quantum-computing', 'physics', 'algorithms'],
    ARRAY['data-science', 'statistics', 'big-data'],
    ARRAY['artificial-intelligence', 'nlp', 'computer-vision'],
    ARRAY['robotics', 'control-systems', 'automation']
  ];
  
  question_titles := ARRAY[
    'Best approach for implementing a neural network for image classification?',
    'Understanding quantum entanglement in computing applications',
    'Statistical methods for analyzing large datasets',
    'Current state of NLP research and future directions',
    'Optimal control algorithms for autonomous robots'
  ];
  
  question_contents := ARRAY[
    'I am working on an image classification project and need advice on the best neural network architecture to use. Should I go with CNNs or transformer-based models?',
    'I am trying to understand how quantum entanglement can be leveraged in practical computing applications. Can someone explain the current state of research?',
    'What are the most robust statistical methods for analyzing datasets with millions of entries? I am particularly interested in techniques that handle missing data well.',
    'I would like to know about the current state of NLP research and where the field is headed. What are the most promising approaches beyond transformer models?',
    'What are the current best practices for implementing optimal control algorithms in autonomous robots? I am particularly interested in approaches that work well in unstructured environments.'
  ];
  
  answer_contents := ARRAY[
    'For image classification, CNNs remain the workhorse but transformer-based models like Vision Transformer (ViT) are showing excellent results. If you have limited data, a ResNet or EfficientNet architecture might be more practical.',
    'Quantum entanglement is being leveraged in several ways: quantum key distribution for secure communication, quantum teleportation protocols, and as a resource in quantum algorithms.',
    'For large datasets with millions of entries, distributed computing frameworks like Spark combined with techniques like multiple imputation or MICE for missing data are effective.',
    'Beyond transformer models, the field is moving toward multimodal models that combine language with vision, audio, and other modalities. Retrieval-augmented generation (RAG) is showing promise.',
    'For autonomous robots in unstructured environments, model predictive control (MPC) combined with reinforcement learning is showing excellent results. Adaptive control approaches that can handle uncertainty are crucial.'
  ];
  
  -- Create 5 sample questions with answers from mentors
  FOR i IN 1..5 LOOP
    -- Skip if no mentors exist
    IF array_length(mentor_ids, 1) IS NULL THEN
      EXIT;
    END IF;
    
    -- Select a random mentor to ask the question
    random_mentor := mentor_ids[1 + (i % array_length(mentor_ids, 1))];
    
    -- Create question
    INSERT INTO questions (
      title,
      content,
      author_id,
      tags,
      created_at
    ) VALUES (
      question_titles[1 + (i % array_length(question_titles, 1))],
      question_contents[1 + (i % array_length(question_contents, 1))],
      random_mentor,
      question_tags[1 + (i % array_length(question_tags, 1))],
      NOW() - (random() * interval '180 days')
    ) RETURNING id INTO question_id;
    
    -- Add 1-2 answers from different mentors
    FOR j IN 1..1 + (i % 2) LOOP
      -- Skip if not enough mentors
      IF j >= array_length(mentor_ids, 1) THEN
        EXIT;
      END IF;
      
      -- Select a different mentor to answer
      random_mentor := mentor_ids[1 + ((i + j) % array_length(mentor_ids, 1))];
      
      -- Create answer
      INSERT INTO answers (
        question_id,
        content,
        author_id,
        created_at,
        votes
      ) VALUES (
        question_id,
        answer_contents[1 + ((i + j) % array_length(answer_contents, 1))],
        random_mentor,
        NOW() - (random() * interval '90 days'),
        floor(random() * 10)::integer
      );
    END LOOP;
  END LOOP;
END $$;