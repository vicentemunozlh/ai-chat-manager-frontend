# AI Chat Manager Dashboard

A comprehensive React dashboard for managing AI chatbot conversations with real-time analytics and chat functionality.

## Features

### 📊 Dashboard Pages

1. **Resumen (Summary)**
   - KPI cards showing conversation metrics
   - Interactive line chart for conversation volume
   - Real-time statistics display

2. **Conversaciones (Conversations)**
   - Complete conversation management interface
   - Advanced filtering options (status, rating, date range)
   - Real-time chat interface for creating and viewing conversations
   - Table view with conversation details

3. **Analytics**
   - Rating distribution bar charts
   - Channel distribution pie charts
   - Performance analysis of prompts
   - Detailed KPI breakdowns

4. **Configuración (Configuration)**
   - User profile management
   - Prompt creation and management
   - API configuration display
   - Active prompt selection

### 🚀 Technical Features

- **React 19** with TypeScript
- **React Router** for navigation
- **Recharts** for data visualization
- **WebSocket integration** for real-time chat
- **Responsive design** with modern UI
- **Modular component architecture**
- **Type-safe development**

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar
│   └── ChatInterface.tsx # Real-time chat component
├── pages/               # Main dashboard pages
│   ├── Dashboard.tsx    # Resumen page
│   ├── Conversaciones.tsx # Conversations management
│   ├── Analytics.tsx    # Analytics and charts
│   └── Configuracion.tsx # Configuration settings
├── hooks/               # Custom React hooks
│   └── useWebSocket.ts  # WebSocket management
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types
├── utils/               # Utility functions
│   └── index.ts         # Helper functions
└── App.tsx              # Main application component
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Phoenix/Elixir backend running (for full functionality)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Backend Integration

This frontend is designed to work with a Phoenix/Elixir backend. To connect:

1. Update the API base URL in `src/utils/index.ts`
2. Configure WebSocket URL in `src/hooks/useWebSocket.ts`
3. Implement authentication if needed

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Backend API Endpoints Expected

The frontend expects these REST API endpoints:

- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation
- `GET /api/analytics` - Get analytics data
- `GET /api/prompts` - List prompts
- `POST /api/prompts` - Create prompt
- `PUT /api/prompts/:id` - Update prompt

## WebSocket Events

Expected WebSocket events for real-time functionality:

- `new_conversation` - New conversation started
- `message` - New message in conversation
- `conversation_end` - Conversation ended
- `rating_update` - Rating added to conversation

## Customization

### Adding New Pages

1. Create new page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Layout.tsx`

### Styling

The application uses custom CSS with design system principles:

- CSS variables for consistent theming
- Responsive design patterns
- Modern UI components
- Accessible color schemes

