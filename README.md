# Fruit Ninja - Real-time Matrix Game

A real-time fruit ninja game with a NestJS backend and Pixi.js frontend. Fruits spawn from the bottom and move upward with realistic physics, displayed on a 100x100 matrix grid.

![Game Preview](https://img.shields.io/badge/Status-Active-green)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-Pixi.js-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-yellow)

## Features

### Core Gameplay
- **Real-time Matrix**: 100x100 grid updated at 24 FPS
- **Varied Fruit Types**: 5 different fruits with unique properties
- **Physics Simulation**: Realistic gravity and movement
- **WebSocket Communication**: Live updates between backend and frontend

### Fruit Types
- **Apple**: Slow, common (speed: 0.8)
- **Orange**: Normal speed (speed: 1.0)
- **Banana**: Faster, larger (speed: 1.2, radius: 3)
- **Cherry**: Very fast, small, rare (speed: 1.8, radius: 1)
- **Watermelon**: Very slow, large, rare (speed: 0.4, radius: 4)

### Technical Features
- **Responsive Design**: Auto-scales to any screen size
- **Performance Optimized**: Efficient rendering and updates
- **Real-time Stats**: FPS counter and fruit tracking
- **API Control**: REST endpoints for game manipulation

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
**Backend runs on:** http://localhost:3000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
**Frontend runs on:** http://localhost:3050

### 3. Open Game
Navigate to http://localhost:3050 in your browser

## Project Structure

```
fruit-ninja/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── game/           # Game logic
│   │   │   ├── fruit.entity.ts       # Fruit class
│   │   │   ├── fruit.types.ts        # Type definitions
│   │   │   ├── matrix/               # Matrix service
│   │   │   └── fruit-worker/         # Game loop service
│   │   ├── gateway/        # WebSocket gateway
│   │   └── app.controller.ts         # REST API
│   └── package.json
│
├── frontend/               # Pixi.js Frontend
│   ├── index.html          # Single-page application
│   ├── server.js           # Express server
│   └── package.json
│
└── README.md              # This file
```

## Game Architecture

### Backend (NestJS)
- **FruitWorkerService**: Main game loop running at 24 FPS
- **MatrixService**: Manages 100x100 grid state
- **GameGateway**: WebSocket communication
- **Fruit Entity**: Object-oriented fruit with physics

### Frontend (Pixi.js)
- **Real-time Rendering**: Canvas-based fruit visualization
- **WebSocket Client**: Receives matrix updates
- **Responsive Design**: Auto-scaling graphics
- **Performance Monitoring**: FPS and stats tracking

### Data Flow
```
Backend Game Loop (24 FPS)
    ↓
Matrix Service (Update grid)
    ↓
WebSocket Gateway (Broadcast)
    ↓ 
Frontend (Render fruits)
```

## Configuration

### Game Settings
```typescript
// Backend: fruit-worker.service.ts
GAME_FPS = 24              // Game update rate
SPAWN_RATE = 0.05          // Fruit spawn probability
GRAVITY_EFFECT = -0.005    // Speed decay for upward movement

// Frontend: index.html
MATRIX_SIZE = 100          // Grid dimensions
CELL_SIZE = 5              // Pixels per cell
FRUIT_RADIUS = 2           // Visual fruit size
```

### Fruit Configuration
```typescript
// Each fruit type has:
{
  name: string,            // Display name
  symbol: string,          // Emoji symbol
  speed: number,           // Movement speed
  score: number,           // Point value
  radius: number,          // Collision size
  rarity: number           // Spawn probability (0-1)
}
```

## API Endpoints

### Game Statistics
```bash
GET /fruits/stats
# Returns: { totalFruits, fruitsByType, averageSpeed }
```

### Speed Control
```bash
# Apply global speed multiplier
POST /fruits/speed/global
Content-Type: application/json
{ "multiplier": 2.0 }

# Boost specific fruit type
POST /fruits/speed/boost  
Content-Type: application/json
{ "fruitName": "Cherry", "multiplier": 3.0 }
```

## How to Play

1. **Start**: Fruits spawn from the bottom of the screen
2. **Movement**: Fruits move upward with realistic physics
3. **Variety**: Different fruit types have different speeds and sizes
4. **Physics**: Fruits slow down as they move up (gravity effect)
5. **Challenge**: Catch fast fruits before they disappear

## Development

### Running in Development Mode

**Backend (with hot reload):**
```bash
cd backend
npm run start:dev
```

**Frontend (with auto-restart):**
```bash
cd frontend  
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
```

### Testing
```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Linting (disabled for development)
npm run lint
```

## Debugging

### Backend Debugging
- Check console for fruit spawn logs
- Use API endpoints to inspect game state
- Monitor WebSocket connections

### Frontend Debugging
- Open browser DevTools console
- Check WebSocket connection status (top-left indicator)
- Monitor FPS counter and fruit count

### Common Issues

**Connection Problems:**
- Ensure backend is running on port 3000
- Check CORS settings in gateway
- Verify WebSocket connectivity

**Performance Issues:**
- Monitor FPS counter
- Check browser console for errors
- Reduce matrix size if needed

**Rendering Issues:**
- Verify Pixi.js compatibility
- Check emoji font support
- Monitor text rendering performance

## Deployment

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]

# Frontend Dockerfile  
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3050
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Backend
PORT=3000
NODE_ENV=production

# Frontend  
PORT=3050
BACKEND_URL=ws://localhost:3000
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- [ ] Player interaction (clicking to slice fruits)
- [ ] Score system and leaderboards
- [ ] Sound effects and music
- [ ] Particle effects for sliced fruits
- [ ] Multiple difficulty levels
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] Fruit combo systems
- [ ] Power-ups and special effects

## Support

- **Issues**: Open a GitHub issue
- **Documentation**: Check inline code comments
- **Performance**: Monitor browser console for debugging info

---

**Built with ❤️ using NestJS, Pixi.js, and Socket.io** 