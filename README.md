# EduMate AI 🎓

EduMate AI is an intelligent educational platform that transforms how you interact with YouTube videos. By leveraging the power of Google's Gemini AI, it allows users to ask questions directly about video content, receive accurate, context-aware answers (including mathematical formulas), and track their learning journey.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

-   **📺 YouTube Integration**: Paste any YouTube link or search directly within the dashboard to start learning.
-   **🤖 AI-Powered Q&A**: Ask any question about the video's content and get instant, accurate answers powered by Gemini AI.
-   **🧮 Math Support**: beautifully renders mathematical formulas and complex equations in chat using MathJax.
-   **🕒 Watch History**: Automatically saves your watched videos and questions so you can pick up where you left off.
-   **👤 User Profiles**: Secure authentication with email verification, profile photo management, and secure password resets.
-   **🌗 Dark/Light Mode**: Fully responsive UI with persistent theme preference.
-   **🛡️ Admin Dashboard**: Powerful tools for user management (ban, verify, promote roles) and system analytics.

## 🛠️ Tech Stack

**Frontend:**
-   React.js (Vite)
-   Tailwind CSS
-   React Router DOM
-   Axios
-   Framer Motion (animations)

**Backend:**
-   Node.js & Express.js
-   MongoDB (Mongoose)
-   JWT Authentication
-   Google Gemini AI API
-   Nodemailer (Email OTPs)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+)
-   MongoDB installed locally or a MongoDB Atlas connection string.
-   A Google Gemini API key.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/edumate-ai.git](https://github.com/yourusername/edumate-ai.git)
    cd edumate-ai
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` folder with the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    GEMINI_API_KEY=your_google_gemini_api_key
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_app_password
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    CLIENT_URL=http://localhost:5173
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` folder:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

### Running the App

1.  **Start Backend** (from `backend/` directory):
    ```bash
    npm run dev
    ```
2.  **Start Frontend** (from `frontend/` directory in a new terminal):
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

## 📸 Screenshots

| Dashboard (Dark Mode) | AI Chat with Math |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/400x225?text=Dashboard+Screenshot) | ![Chat Placeholder](https://via.placeholder.com/400x225?text=Chat+Screenshot) |

*(Note: Replace placeholder image links with actual screenshots of your app once deployed)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
