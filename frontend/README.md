# Expense Manager Frontend

A comprehensive expense management frontend built with React, TailwindCSS, and modern web technologies.

## Features

- 🔐 **Secure Authentication** - JWT-based login/signup with role management
- 🎨 **Modern UI** - Clean, responsive design with TailwindCSS
- 🏢 **Company Management** - Automatic company creation with currency detection
- 👥 **User Roles** - Admin, Manager, and Employee role system
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

## Color Scheme

- **Primary**: Emerald Green (#10b981)
- **Accent**: Emerald 400 (#34d399)
- **Hover**: Emerald 600 (#059669)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm test\` - Launches the test runner
- \`npm run build\` - Builds the app for production
- \`npm run eject\` - Ejects from Create React App (one-way operation)

## Project Structure

\`\`\`
src/
├── api/           # API configuration and endpoints
├── components/    # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── routes/        # Route configuration
├── styles/        # Global styles and Tailwind config
└── utils/         # Utility functions and constants
\`\`\`

## Authentication Flow

1. **Signup**: User provides personal and company information
2. **Company Creation**: System automatically creates company with currency detection
3. **Admin Assignment**: First user becomes admin with full privileges
4. **JWT Tokens**: Secure token-based authentication

## Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=Expense Manager
REACT_APP_VERSION=1.0.0
\`\`\`

## API Integration

The frontend integrates with a FastAPI backend expecting these endpoints:

- \`POST /auth/login\` - User authentication
- \`POST /auth/signup\` - User registration
- \`GET /auth/countries\` - Available countries with currencies
- \`GET /auth/me\` - Current user information

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.