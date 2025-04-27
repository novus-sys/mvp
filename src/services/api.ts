import api from '@/lib/api';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  members: User[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  tags: string[];
  uploadedBy: User;
  createdAt: string;
}

// Question types
export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: User;
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

// Opportunity types
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  type: string;
  deadline: string;
  link: string;
  postedBy: User;
  createdAt: string;
}

// API Functions

// Auth
export const authAPI = {
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: (userData: any) => {
    return api.post('/auth/register', userData);
  },
  getCurrentUser: () => {
    return api.get('/auth/me');
  },
};

// Projects
export const projectsAPI = {
  getAll: () => {
    return api.get('/projects');
  },
  getById: (id: string) => {
    return api.get(`/projects/${id}`);
  },
  create: (projectData: Partial<Project>) => {
    return api.post('/projects', projectData);
  },
  update: (id: string, projectData: Partial<Project>) => {
    return api.put(`/projects/${id}`, projectData);
  },
  delete: (id: string) => {
    return api.delete(`/projects/${id}`);
  },
  joinProject: (id: string) => {
    return api.post(`/projects/${id}/join`);
  },
  leaveProject: (id: string) => {
    return api.post(`/projects/${id}/leave`);
  },
};

// Resources
export const resourcesAPI = {
  getAll: () => {
    return api.get('/resources');
  },
  getById: (id: string) => {
    return api.get(`/resources/${id}`);
  },
  upload: (formData: FormData) => {
    return api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id: string) => {
    return api.delete(`/resources/${id}`);
  },
};

// Q&A Forum
export const forumAPI = {
  getAllQuestions: () => {
    return api.get('/questions');
  },
  getQuestionById: (id: string) => {
    return api.get(`/questions/${id}`);
  },
  createQuestion: (questionData: Partial<Question>) => {
    return api.post('/questions', questionData);
  },
  updateQuestion: (id: string, questionData: Partial<Question>) => {
    return api.put(`/questions/${id}`, questionData);
  },
  deleteQuestion: (id: string) => {
    return api.delete(`/questions/${id}`);
  },
  addAnswer: (questionId: string, answerData: { content: string }) => {
    return api.post(`/questions/${questionId}/answers`, answerData);
  },
  updateAnswer: (questionId: string, answerId: string, answerData: { content: string }) => {
    return api.put(`/questions/${questionId}/answers/${answerId}`, answerData);
  },
  deleteAnswer: (questionId: string, answerId: string) => {
    return api.delete(`/questions/${questionId}/answers/${answerId}`);
  },
};

// Opportunities
export const opportunitiesAPI = {
  getAll: () => {
    return api.get('/opportunities');
  },
  getById: (id: string) => {
    return api.get(`/opportunities/${id}`);
  },
  create: (opportunityData: Partial<Opportunity>) => {
    return api.post('/opportunities', opportunityData);
  },
  update: (id: string, opportunityData: Partial<Opportunity>) => {
    return api.put(`/opportunities/${id}`, opportunityData);
  },
  delete: (id: string) => {
    return api.delete(`/opportunities/${id}`);
  },
};
