# 🚀 GitHub Analytics Dashboard

A full-stack web application for tracking and visualizing GitHub repository metrics and performance over time. Built with modern technologies including React, TypeScript, NestJS, and PostgreSQL.

## ✨ Features

- **📊 Real-time Analytics**: Track stars, forks, issues, and contributors for GitHub repositories
- **🔄 Automated Updates**: Daily cron jobs to fetch latest repository statistics
- **📈 Beautiful Charts**: Interactive visualizations using Recharts
- **🎨 Modern UI**: Responsive design with TailwindCSS
- **🔒 Secure API**: Input validation and error handling
- **📱 Mobile Friendly**: Responsive design across all devices

## 🏗️ Architecture

```
github-analytics-dashboard/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # NestJS + TypeScript backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Shared utilities
│   │   ├── config/        # Configuration files
│   │   └── main.ts        # Application entry point
│   └── package.json
├── docker-compose.yml      # PostgreSQL + pgAdmin setup
└── package.json           # Root package.json with scripts
```

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router v6** for navigation
- **Recharts** for data visualization
- **Axios** for HTTP requests

### Backend

- **NestJS** with TypeScript
- **TypeORM** for database operations
- **PostgreSQL** as the primary database
- **Zod** for schema validation
- **Nest Schedule** for cron jobs
- **Axios** for GitHub API calls

### Infrastructure

- **Docker Compose** for local development
- **PostgreSQL 15** for data storage
- **pgAdmin** for database management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd github-analytics-dashboard
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Set Up Environment Variables

#### Backend (.env file in server/ directory)

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

# GitHub API Configuration
GITHUB_TOKEN=your_github_personal_access_token_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Frontend (.env file in client/ directory)

```bash
cd client
cp env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start the Database

```bash
npm run db:up
```

This will start:

- PostgreSQL on port 5432
- pgAdmin on port 5050 (admin@admin.com / admin)

### 5. Start the Development Servers

#### Option A: Start Both Frontend and Backend

```bash
npm run dev
```

#### Option B: Start Separately

```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run client:dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

## 📖 API Endpoints

### Health Check

- `GET /api/health` - Service health status

### Repositories

- `GET /api/repos` - List all tracked repositories
- `POST /api/repos` - Add a new repository to track
- `GET /api/repos/:name/stats` - Get stats for a specific repository
- `GET /api/repos/stats` - Get stats for all repositories
- `GET /api/repos/tracked/list` - List tracked repository names

## 🔧 Development

### Available Scripts

#### Root Level

```bash
npm run dev              # Start both frontend and backend
npm run client:dev       # Start React development server
npm run server:dev       # Start NestJS development server
npm run db:up            # Start PostgreSQL and pgAdmin
npm run db:down          # Stop database services
npm run build            # Build both frontend and backend
npm run lint             # Run linting on both projects
npm run format           # Format code in both projects
```

#### Frontend (client/)

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

#### Backend (server/)

```bash
npm run start:dev        # Start in watch mode
npm run build            # Build for production
npm run start:prod       # Start production server
npm run lint             # Run ESLint
npm run test             # Run tests
```

### Database Management

#### Access PostgreSQL

```bash
# Using psql
psql -h localhost -U postgres -d github_analytics

# Using pgAdmin
# Open http://localhost:5050
# Login: admin@admin.com / admin
# Add server: localhost:5432, postgres/postgres
```

#### Reset Database

```bash
npm run db:down
npm run db:up
```

## 🎯 Usage

### Adding a Repository

1. Navigate to the dashboard
2. Enter repository name in format: `owner/repo` (e.g., `facebook/react`)
3. Click "Add Repo"
4. The system will fetch current stats and start tracking

### Viewing Analytics

- **Overview Cards**: See total counts for all tracked repositories
- **Stars Comparison**: Bar chart comparing repository popularity
- **Time Series**: Track metrics over time for selected repositories
- **Repository Distribution**: Pie chart showing repository breakdown
- **Recent Activity**: Latest updates and changes

### Automated Updates

The system automatically fetches new statistics daily at midnight using cron jobs. This ensures your dashboard always shows the latest data.

## 🔒 Security

- Input validation using class-validator and Zod
- CORS configuration for frontend-backend communication
- Environment variable management
- Error handling and logging

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all environment variables are properly set for production:

- Database connection details
- GitHub API token
- CORS origins
- Port configuration

### Docker Deployment

The application can be containerized using the existing Docker setup or by creating production Docker images.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed

- Ensure Docker is running
- Check if PostgreSQL container is up: `docker ps`
- Verify environment variables in `.env`

#### GitHub API Rate Limits

- Add a GitHub personal access token to increase rate limits
- Check the health endpoint for current rate limit status

#### Frontend Can't Connect to Backend

- Verify backend is running on port 3000
- Check CORS configuration
- Ensure `VITE_API_URL` is set correctly

#### Build Errors

- Clear node_modules and reinstall: `npm run install:all`
- Check TypeScript version compatibility
- Verify all dependencies are installed

### Getting Help

- Check the logs: `npm run db:logs`
- Review the health endpoint: `GET /api/health`
- Check browser console for frontend errors
- Review server logs for backend errors

## 📊 Performance

- **Frontend**: Optimized with Vite and React 18
- **Backend**: Efficient database queries with TypeORM
- **Database**: Indexed queries for fast data retrieval
- **Caching**: In-memory tracking of repository data

---

**Happy coding! 🎉**

For more information, check out the individual README files in the `client/` and `server/` directories.
