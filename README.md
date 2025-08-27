# Medical Image Renderer PoC

A high-performance medical image rendering application built with Electron, React, TypeScript, and ASP.NET Core, targeting 30+ FPS for 1000x1000 and 2000x2000 image buffers using WebGL2.

## Technology Stack

- **Frontend**: Electron, React, TypeScript
- **Backend**: ASP.NET Core (.NET 8)
- **Rendering**: WebGL2 with custom shaders
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: CSS3

## Architecture

The application consists of:

1. **Electron App** - Windows desktop application wrapper
2. **React Frontend** - WebGL2-based image renderer with real-time performance monitoring
3. **ASP.NET Core Backend** - Local API server for generating medical image buffers
4. **WebGL2 Renderer** - High-performance image rendering with custom shaders

## Prerequisites

- Node.js 18+ 
- .NET 8 SDK
- Windows 10/11 (for Electron packaging)

## Installation & Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Restore .NET dependencies:**
   ```bash
   cd backend
   dotnet restore
   cd ..
   ```

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend together:
```bash
npm run dev-full
```

This will:
- Start the ASP.NET Core backend on `http://localhost:5174`
- Start the Vite dev server on `http://localhost:5173`
- Launch the Electron app

### Manual Development Mode

1. **Start the backend API:**
   ```bash
   npm run start-backend
   ```
   The API will be available at `http://localhost:5174`

2. **Start the frontend (in another terminal):**
   ```bash
   npm run electron-dev
   ```

## Building for Production

```bash
npm run build-electron
```

This will:
1. Build the React frontend
2. Compile the TypeScript for Electron
3. Publish the .NET backend
4. Package everything into a Windows installer

## Performance Testing

The application includes real-time performance monitoring:

- **FPS Counter**: Shows current frames per second
- **Frame Time**: Time to render each frame
- **Render Time**: WebGL rendering time
- **Buffer Update Time**: Time to update image data
- **Memory Usage**: Texture memory consumption

### Test Scenarios

1. **1000x1000 Images**: Should achieve 60+ FPS
2. **2000x2000 Images**: Should achieve 30+ FPS (target)

The application generates dynamic test patterns to simulate medical imaging data.

## API Endpoints

The local backend provides these endpoints:

- `GET /api/image/test/{size}` - Generate test pattern (e.g., `/api/image/test/1000x1000`)
- `GET /api/image/medical/{size}` - Generate medical image simulation
- `POST /api/image/generate` - Generate custom image buffer
- `GET /api/image/performance` - Get generation performance metrics
- `GET /api/image/health` - Health check

## WebGL2 Features

- **Custom Shaders**: Optimized vertex and fragment shaders for medical imaging
- **Real-time Processing**: Brightness, contrast, and gamma adjustments
- **Memory Efficient**: Direct GPU buffer updates
- **Hardware Accelerated**: Utilizes high-performance GPU preference

## Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── webgl/             # WebGL2 renderer and shaders
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── electron/              # Electron main process
├── backend/               # ASP.NET Core API
│   ├── Controllers/       # API controllers
│   ├── Services/          # Business logic
│   └── Models/            # Data models
├── dist/                  # Build output
└── dist-electron/         # Packaged application
```

## Performance Optimization

### WebGL2 Optimizations
- Vertex Array Objects (VAO) for efficient geometry binding
- Texture streaming with minimal state changes
- Fragment shader optimizations for medical image processing
- Hardware-accelerated context with optimal settings

### Backend Optimizations
- Parallel processing for large buffer generation
- Memory-efficient byte array operations
- Asynchronous API endpoints
- Performance metrics tracking

### Frontend Optimizations
- RequestAnimationFrame for smooth rendering
- Efficient React re-renders with Zustand
- Minimal DOM updates
- Optimized canvas resizing

## Medical Device Compliance Notes

This is a Proof of Concept for performance validation. For medical device deployment:

- Add DICOM support for real medical images
- Implement proper error handling and logging
- Add data validation and security measures
- Include medical image processing algorithms
- Ensure compliance with medical device regulations

## Troubleshooting

### Common Issues

1. **WebGL2 Not Available**: Ensure you have a modern GPU with WebGL2 support
2. **Backend Not Starting**: Check that .NET 8 SDK is installed and port 5174 is available
3. **Performance Issues**: Check Windows power settings and GPU drivers

### Performance Debugging

Enable Chrome DevTools in development mode to:
- Monitor GPU memory usage
- Profile WebGL calls
- Analyze frame timing
- Check for memory leaks

## License

MIT License - This is a Proof of Concept for educational and testing purposes.