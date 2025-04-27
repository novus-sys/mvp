# Academic Platform MVP

**Academic Platform** that creates a unified digital environment for India's academic community. It allows students and professors to upload and share academic resources such as research papers, datasets, presentations, and other academic materials. Additionally, it includes advanced features like mentorship matching, achievement-based gamification, and AI-enhanced content discovery to improve academic collaboration.

The application uses the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and integrates **AWS S3** for file storage.

## Features

### **1. User Authentication**
- Users can register, log in, and log out using JWT (JSON Web Tokens).
- Basic user authentication (mock users or a single user for MVP).

### **2. Comprehensive User Profiles**
- Display academic backgrounds, skills, and current projects.
- Facilitate relevant connections between students, educators, and researchers.

### **3. Project Repository**
- A place for students and educators to share ideas, find collaborators, and track research progress.

### **4. Q&A Forum**
- A forum where academic questions can be posted and answered by peers from across institutions.

### **5. Resource Sharing System**
- Allows users to upload and share research papers, datasets, and educational materials.
- Supports file visibility controls (Public/Private).
- Previewable PDFs and images.

### **6. Interest-Based Networking**
- Connects academics working in similar fields using AI-driven recommendations.
- Facilitates better networking and collaboration within academia.

### **7. Achievement-Based Gamification**
- Users earn daily streaks for engaging consistently on the platform.
- Encourages active participation and content sharing.

### **8. Mentorship Matching**
- Matches students with experienced educators based on interests and expertise.
- Promotes learning through mentorship connections.

### **9. Academic Opportunity Board**
- A board where research positions, internships, and project roles can be posted and discovered.(applying to these opportunities not included)
- Facilitates professional growth and academic collaboration.

### **10. AI-Enhanced Content Discovery**
- Suggests relevant projects and academic connections based on user activity and interests.
- Uses AI to surface the most relevant opportunities for users.

### **11. File Upload and Preview**
- Users can upload academic resources (e.g., PDFs, images).
- Supports file visibility control: **Public** or **Private**.
- File upload validation (file size, type).
- PDF and image previews available on the platform.

### **12. Mobile-Responsive UI**
- The platform is designed to be mobile-friendly and optimized for basic web usage.

---

## Tech Stack

- **Frontend**: React.js, React Router, CSS for styling, Axios for HTTP requests
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (for user data and metadata storage)
- **Storage**: Amazon S3 (for storing resources like PDFs, images)
- **Authentication**: JWT (for user authentication)
- **Libraries**:
  - **PDF.js** (for PDF file previews)
  - **Boto3** (for AWS S3 integration)
  - **Mongoose** (for MongoDB interaction)
  - **TensorFlow.js** or **AI Library** (for AI-enhanced content discovery)

---

## Development Approach (Step-by-Step)

### Step 1: Set up the Backend (1.5 hours)

1. **Create Express API**  
   - Set up a basic **Express.js server** with routes for user authentication, file upload, and resource listing.
   - Install dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `aws-sdk`, `dotenv`.

2. **User Authentication**  
   - Create authentication routes: `/register`, `/login`, and middleware for JWT validation.
   - Use **bcryptjs** for hashing passwords.
   - Use **jsonwebtoken (JWT)** for issuing and verifying authentication tokens.

3. **Set up MongoDB**  
   - Set up **MongoDB** using **Mongoose** to store user data and file metadata.
   - Create a schema for users and resource metadata (file name, visibility, uploader, etc.).

4. **AWS S3 Setup**  
   - Set up **AWS S3** for file storage.
   - Generate **pre-signed URLs** for file uploads using AWS SDK.

### Step 2: Set up the Frontend (2.5 hours)

1. **Create React App**  
   - Initialize a new React project using `create-react-app`.
   - Install dependencies: `react-router-dom`, `axios`, `pdfjs-dist`, `react-dropzone`.

2. **Authentication Flow**  
   - Create **login** and **register** components in `src/components/Auth/`.
   - Use **Axios** to make requests to the backend for user login and registration.
   - Store JWT token in local storage or cookies for session management.

3. **File Upload Component**  
   - Create an **upload form** component (`src/components/Upload/`).
   - Use **React Dropzone** for drag-and-drop file upload.
   - Validate file size and type before uploading (PDFs, images only).
   - Use AWS S3 **pre-signed URLs** to upload files directly to the S3 bucket.
   - Include a **visibility dropdown** (Public/Private) for resource visibility.

4. **File Preview Component**  
   - For **PDFs**, integrate **PDF.js** to show the first page of the document.
   - For **images**, display thumbnails directly using `<img>` tags.

5. **Resource List Component**  
   - Create a list view (`src/components/Resources/`) to display all uploaded resources.
   - Include options to filter resources by visibility (Public/Private).
   - Show resource metadata: file name, type, uploader, and visibility status.
   - Allow users to preview or download resources directly from the list.

### Step 3: Implement Visibility Controls (1.5 hours)

1. **Visibility Control**  
   - Implement file visibility control with two options: **Public** and **Private**.
   - By default, all uploaded files will be **Public**.
   - Allow users to toggle between **Public** and **Private** visibility when uploading files.

2. **Store Visibility in Metadata**  
   - Store file visibility in the **MongoDB** database alongside other file metadata.
   - Implement visibility checks when listing resources so users only see files marked as Public or their own Private files.

### Step 4: Implement Previews (1.5 hours)

1. **PDF Previews**  
   - Use **PDF.js** to render a preview of the first page of PDFs in the resource list.

2. **Image Previews**  
   - Use `<img>` tags to display image thumbnails for PNG/JPEG files.

3. **Basic Error Handling**  
   - Implement basic error handling for file uploads (e.g., "File too large", "Invalid file type").
   - Show error messages on the frontend if any issues arise during file upload.

### Step 5: Testing and Bug Fixes (1.5 hours)

1. **Test User Authentication**  
   - Ensure that users can register, log in, and access the platform with valid JWT tokens.

2. **Test File Upload and Previews**  
   - Test file upload functionality, including the visibility controls and preview generation.
   - Ensure that uploaded files are correctly stored in S3 and that their metadata is stored in MongoDB.

3. **Fix UI/UX Issues**  
   - Ensure the platform is mobile-responsive.
   - Test the overall user experience on both desktop and mobile devices.

---

# mvp
