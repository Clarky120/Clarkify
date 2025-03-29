# BFF (Backend For Frontend) Service

A dedicated Express server that handles API requests for the frontend application.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/example` - Get all examples
- `GET /api/example/:id` - Get example by ID

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
```

## Project Structure

```
/bff
  ├── /src
  │    ├── /controllers   # Request handlers
  │    ├── /middleware    # Express middleware
  │    ├── /routes        # API routes
  │    └── server.ts      # Server entry point
  ├── .env                # Environment variables
  ├── package.json        # Project dependencies
  └── tsconfig.json       # TypeScript configuration
```
