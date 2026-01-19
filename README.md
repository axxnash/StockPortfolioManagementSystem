# Stock Portfolio Management System

A full-stack stock portfolio management application with React frontend and Node.js/Express backend.

## Features

- User authentication (login/register)
- Add stocks to portfolio
- View portfolio dashboard with real-time data
- Analytics and visualization
- Export portfolio data to CSV
- Track profit/loss by stock and broker

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

## Database Setup

1. Create a MySQL database
2. Run the SQL schema from `table schemas.sql` to create the required tables
3. Make sure to add the `quantity` column to the `user_portfolio` table if not already present:

```sql
ALTER TABLE user_portfolio ADD COLUMN quantity DOUBLE AFTER stock_id;
```

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the Frontend directory if you want to customize the API URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Register a new account or login with existing credentials
4. Add stocks to your portfolio using the "Add Stock" page
5. View your portfolio dashboard and analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Stocks
- `GET /api/stocks` - List all available stocks (requires auth)

### Brokers
- `GET /api/brokers` - List all available brokers (requires auth)

### Holdings
- `GET /api/holdings` - List user's holdings (requires auth)
- `POST /api/holdings` - Add a new holding (requires auth)
- `PUT /api/holdings/:id` - Update a holding (requires auth)
- `DELETE /api/holdings/:id` - Delete a holding (requires auth)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics data (requires auth)

## Project Structure

```
stock-website/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication and error handling
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   └── src/             # Server entry point
├── Frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks (auth)
│   │   ├── services/    # API service functions
│   │   └── App.jsx      # Main app component
│   └── ...
└── table schemas.sql    # Database schema
```

## Notes

- The backend uses JWT tokens for authentication
- Token is stored in localStorage on the frontend
- CORS is configured to allow requests from `http://localhost:5173`
- Make sure your MySQL database is running before starting the backend
