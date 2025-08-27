# GitHub Analytics Dashboard

A full-stack web application for tracking and analyzing GitHub repository metrics with beautiful charts and insights.

## Features

### 🎯 Dual Mode System

- **Guest Mode**: Add individual repositories and track their stats without authentication
- **Connected Mode**: Connect your GitHub account to automatically sync all your repositories

### 📊 Analytics Dashboard

- Real-time repository statistics (stars, forks, issues, contributors)
- Interactive charts using Recharts
- Time-series data visualization
- Repository comparison charts
- Responsive design for all devices

### 🚀 Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite for fast development
- TailwindCSS for styling
- Zustand for state management
- Recharts for data visualization
- React Router for navigation

**Backend:**

- NestJS + TypeScript
- TypeORM for database management
- PostgreSQL database
- GitHub API integration
- OAuth authentication

**Infrastructure:**

- Docker Compose for database
- pgAdmin for database management

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- GitHub Personal Access Token (optional, for higher API limits)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd github-analytics-dashboard
npm run install:all
```

### 2. Start Database

```bash
npm run db:up
```

This will start:

- PostgreSQL on port 5432
- pgAdmin on port 5050 (admin@admin.com / admin)

### 3. Environment Setup

#### Backend (.env in server/ directory)

```bash
cd server
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=github_analytics

# GitHub API Configuration (optional)
GITHUB_TOKEN=your_github_personal_access_token_here

# GitHub OAuth (for connected mode)
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Frontend (.env in client/ directory)

```bash
cd client
cp env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run server:dev  # Backend on port 3000
npm run client:dev  # Frontend on port 5173
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

## Usage

### Guest Mode

1. Switch to "Guest Mode" using the toggle in the header
2. Enter repository names in format `owner/repo` (e.g., `facebook/react`)
3. View real-time statistics and charts
4. Data is stored locally in the database

### Connected Mode

1. Switch to "Connected Mode"
2. Click "Connect GitHub" to authenticate
3. Your repositories will be automatically synced
4. View comprehensive analytics for all your repos

## API Endpoints

### Guest Mode

- `POST /repos/guest` - Add repository for tracking
- `GET /repos/guest/stats` - Get all guest repository stats
- `GET /repos/guest/:name/stats` - Get stats for specific repository

### Connected Mode

- `GET /repos/auth/url` - Get GitHub OAuth URL
- `POST /repos/auth/callback` - Handle OAuth callback
- `GET /repos/user` - Get user repositories
- `POST /repos/user/sync` - Sync repositories from GitHub
- `GET /repos/user/stats` - Get all user repository stats

### Health Check

- `GET /repos/health` - API health status

## Development

### Project Structure

```
github-analytics-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Shared utilities
│   │   └── config/        # Configuration files
│   └── package.json
├── docker-compose.yml      # Database services
└── package.json            # Root package.json
```

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run client:dev         # Start frontend only
npm run server:dev         # Start backend only

# Database
npm run db:up              # Start database services
npm run db:down            # Stop database services
npm run db:reset           # Reset database (removes all data)

# Build
npm run build:all          # Build both frontend and backend
npm run install:all        # Install dependencies for all packages
```

### Database Schema

#### Users Table

- `id` - Primary key
- `github_id` - GitHub user ID
- `username` - GitHub username
- `email` - GitHub email
- `access_token` - OAuth access token
- `created_at`, `updated_at` - Timestamps

#### Repositories Table

- `id` - Primary key
- `github_id` - GitHub repository ID
- `name` - Repository name
- `full_name` - Full repository name (owner/repo)
- `description` - Repository description
- `html_url` - GitHub URL
- `stargazers_count` - Number of stars
- `forks_count` - Number of forks
- `open_issues_count` - Number of open issues
- `language` - Primary programming language
- `user_id` - Foreign key to users table
- `created_at`, `updated_at` - Timestamps

#### Repo Stats Table

- `id` - Primary key
- `repo_name` - Repository name
- `stars` - Current star count
- `forks` - Current fork count
- `issues` - Current issue count
- `contributors` - Number of contributors
- `repository_id` - Foreign key to repositories table
- `timestamp` - When stats were recorded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
