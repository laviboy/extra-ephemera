# Extra Ephemera

A modern real estate and travel platform built with Astro, React, and Supabase.

## Features

- 🏠 **Real Estate Listings** - Browse and create property listings
- ✈️ **Travel Groups** - Discover and join travel experiences
- 👥 **Agent Portal** - Become an agent and manage listings
- 🔐 **Authentication** - Secure user authentication with Supabase
- 📱 **Responsive Design** - Built with Tailwind CSS and Radix UI

## Tech Stack

- **Framework**: Astro 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`sh
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`sh
   cp .env.example .env
   \`\`\`
   
4. Configure your \`.env\` file with:
   - Database connection string
   - Supabase URL and API keys

5. Run database migrations:
   \`\`\`sh
   npm run db:push
   \`\`\`

### Development

Start the development server:
\`\`\`sh
npm run dev
\`\`\`

The site will be available at \`http://localhost:4321\`

### Building for Production

\`\`\`sh
npm run build
npm run preview
\`\`\`

## Available Commands

| Command             | Action                                      |
| :------------------ | :------------------------------------------ |
| \`npm install\`       | Install dependencies                        |
| \`npm run dev\`       | Start dev server at \`localhost:4321\`        |
| \`npm run build\`     | Build production site to \`./dist/\`          |
| \`npm run preview\`   | Preview production build locally            |
| \`npm run db:generate\` | Generate database migrations              |
| \`npm run db:push\`   | Push database schema changes                |
| \`npm run db:studio\` | Open Drizzle Studio for database management |

## Project Structure

\`\`\`
/
├── public/          # Static assets
├── src/
│   ├── components/  # React & Astro components
│   ├── data/        # Static data files
│   ├── db/          # Database schema
│   ├── hooks/       # React hooks
│   ├── layouts/     # Page layouts
│   ├── lib/         # Utilities and clients
│   ├── pages/       # File-based routing
│   ├── stores/      # State management
│   └── styles/      # Global styles
└── drizzle/         # Database migrations
\`\`\`

## License

MIT
