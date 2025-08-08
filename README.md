# 🍉 Fruit Ninja - Multiplayer Game

A real-time multiplayer fruit ninja game with room-based gameplay, built with NestJS backend and Pixi.js frontend. Players can create or join rooms, slice fruits together, and compete for the highest score.

![Game Preview](https://img.shields.io/badge/Status-Active-green)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-Pixi.js-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-yellow)

## Features

### Multiplayer Gameplay
- **Room System**: Create or join game rooms with unique codes
- **Real-time Leaderboard**: Live score tracking for all players
- **Room Owner Controls**: Room creator can start/restart games
- **Player Management**: Dynamic player list with owner status
- **2-Minute Game Sessions**: Timed matches with countdown

### Core Gameplay
- **Real-time Matrix**: 100x100 grid updated at 24 FPS
- **Slicing Mechanics**: Mouse/touch slicing with visual effects
- **Particle Effects**: Visual feedback for sliced fruits
- **Score System**: Points based on fruit type and difficulty
- **Timer System**: 2-minute game sessions with countdown

### Fruit Types
- **Apple** 🍎: Common, balanced (speed: 0.8, score: 5)
- **Orange** 🍊: Medium rare, large (speed: 1.0, score: 8)
- **Banana** 🍌: Rare, fast (speed: 1.2, score: 10)
- **Cherry** 🍒: Very rare, fastest (speed: 1.8, score: 15)
- **Watermelon** 🍉: Super rare, largest (speed: 0.4, score: 20)

### Technical Features
- **Responsive Design**: Auto-scales for all devices
- **Performance Optimized**: Efficient rendering and updates
- **Health Dashboard**: Real-time server monitoring
- **Social Media Ready**: Meta tags and preview images
- **Mobile Optimized**: Touch controls and PWA support

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Backend Setup
\`\`\`bash
cd backend
npm install
npm run start:dev
\`\`\`
**Backend runs on:** http://localhost:3000

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`
**Frontend runs on:** http://localhost:5000

### 3. Open Game
Navigate to http://localhost:5000 in your browser

## Project Structure

\`\`\`
fruit-ninja/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── game/           # Game logic
│   │   │   ├── fruit.entity.ts       # Fruit class
│   │   │   ├── fruit.types.ts        # Type definitions
│   │   │   ├── matrix/               # Matrix service
│   │   │   ├── room/                 # Room management
│   │   │   ├── events/               # Event bus service
│   │   │   └── fruit-worker/         # Game loop service
│   │   ├── gateway/        # WebSocket gateway
│   │   └── app.controller.ts         # REST API & Health
│   └── package.json
│
├── frontend/               # Frontend
│   ├── src/               # Source files
│   │   ├── game.js        # Game page logic
│   │   ├── landing.js     # Landing page logic
│   │   ├── renderer.js    # Pixi.js rendering
│   │   ├── socket.js      # Socket management
│   │   └── style.css      # Shared styles
│   ├── assets/            # Images and icons
│   ├── landing.html       # Landing page
│   ├── game.html          # Game room page
│   ├── health.html        # Health dashboard
│   └── index.html         # Entry point
│
└── README.md              # This file
\`\`\`

## Game Flow

1. **Landing Page**
   - Enter username
   - Create new room or join existing
   - View server health dashboard

2. **Waiting Room**
   - See room code
   - View connected players
   - Room owner can start game

3. **Game Session**
   - 2-minute timed matches
   - Real-time score updates
   - Live leaderboard
   - Slice fruits for points
   - Visual effects and feedback

4. **Game End**
   - Final scores displayed
   - Winner announcement
   - Option to restart (room owner)

## Health Dashboard

Monitor server health and game statistics:
- Active rooms and players
- Server uptime and memory usage
- Room-specific statistics
- Real-time fruit counts
- System performance metrics

## API Endpoints

### Health Check
\`\`\`bash
GET /health
# Returns: { status, uptime, memory, game stats }
\`\`\`

### Room Management
\`\`\`bash
# Room operations handled via WebSocket:
- create_room
- join_room
- start_game
- slice (for fruit slicing)
\`\`\`

## Development

### Running in Development
\`\`\`bash
# Backend (with hot reload)
cd backend
npm run start:dev

# Frontend (with live reload)
cd frontend
npm run dev
\`\`\`

### Building for Production
\`\`\`bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
\`\`\`

## Deployment

### Environment Variables
\`\`\`bash
# Backend
PORT=3000
NODE_ENV=production

# Frontend
BACKEND_URL=wss://your-backend-url
\`\`\`

## Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open Pull Request

## Future Enhancements

- [x] Player interaction (slicing fruits)
- [x] Score system and leaderboards
- [x] Multiplayer support
- [x] Mobile touch controls
- [x] Particle effects
- [ ] Sound effects and music
- [ ] Multiple difficulty levels
- [ ] Fruit combo systems
- [ ] Power-ups and special effects

## Support

- **Issues**: Open a GitHub issue
- **Documentation**: Check inline code comments
- **Health**: Visit the /health dashboard

---

**Built with ❤️ using NestJS, Pixi.js, and Socket.io**