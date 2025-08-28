# Medical Image Renderer PoC

A high-performance medical image rendering application built with Electron, React, TypeScript, and ASP.NET Core. This PoC successfully implements C# WPF-compatible BGRA image buffer generation and real-time WebGL2 rendering, achieving 60+ FPS performance with Play/Pause/Stop controls and dynamic pattern visualization.

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

### Quick Start (One-Click Execution) ⭐

**For immediate use:**
```batch
WORKING-start.bat
```
Double-click this file to automatically build and run the complete application.

**Alternative batch files:**
- `start-release.bat` - Full build and run (first time setup)
- `run-app.bat` - Quick run with conditional building
- `quick-start.bat` - Fastest run (no building)

### Development Mode

**Full development environment:**
```bash
npm run dev-full
```

**Manual development:**
1. **Backend API:**
   ```bash
   npm run start-backend
   # Runs on http://localhost:5175
   ```

2. **Frontend (separate terminal):**
   ```bash
   npm run electron-dev
   # Dev server on http://localhost:5180
   ```

## Building for Production

### Manual Release Build
```bash
# 1. Build frontend
npm run build

# 2. Build backend  
npm run build-backend

# 3. Compile TypeScript
npx tsc

# 4. Run in production mode
set NODE_ENV=production&& npx electron .
```

### Automated Build (Batch Files)
```batch
build-app.bat
```

**Note:** `npm run build-electron` currently has electron-builder issues. Use batch files for reliable building.

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

- `GET /api/image/test/{size}` - Generate C# WPF-compatible BGRA test pattern
- `GET /api/image/medical/{size}` - Generate medical image simulation  
- `POST /api/image/generate` - Generate custom image buffer
- `POST /api/image/play` - Start image animation
- `POST /api/image/pause` - Pause image animation
- `POST /api/image/stop` - Stop and reset animation
- `GET /api/image/status` - Get playback status and frame counter
- `GET /api/image/performance` - Get generation performance metrics
- `GET /api/image/health` - Health check

**Backend Performance (Release Mode):**
- Image generation: 1.5-3.0ms 
- API response: 0.2-0.6ms
- Frame counter-based animation matching C# WPF original

## WebGL2 Features

- **BGRA to RGBA Conversion**: Automatic channel swapping for C# WPF compatibility
- **Base64 Decode Pipeline**: Proper handling of backend JSON-serialized byte arrays
- **Custom Shaders**: Simplified fragment shader preserving original BGRA patterns
- **Real-time Processing**: Dynamic brightness, contrast, and gamma effects
- **Memory Efficient**: Direct GPU texture updates with minimal processing
- **Hardware Accelerated**: High-performance GPU context with optimal settings
- **Multi-Resolution Support**: 1000x1000 and 2000x2000 with dynamic quad geometry

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

## Key Implementation Details

### C# WPF Pattern Matching
- **Frame Counter Logic**: Identical algorithm from original C# ImageBufferModel
- **BGRA Format**: Native Windows bitmap format preserved throughout pipeline  
- **Grid Pattern Movement**: Bottom-right to top-left animation as per original
- **Color Calculation**: Exact pixel-by-pixel mathematical compatibility

### Data Flow Architecture
1. **Backend**: Generates BGRA byte[] → JSON serializes to base64 string
2. **Frontend**: Receives base64 → decodes to Uint8Array → BGRA to RGBA conversion
3. **WebGL**: Updates texture with converted RGBA data → renders with simplified shader
4. **Animation**: Frame counter increments only during 'playing' state → periodic buffer updates

### Performance Optimizations Implemented
- **Release Mode**: All builds optimized for production deployment
- **Texture Streaming**: Minimal state changes with direct buffer updates
- **Animation Control**: Proper RequestAnimationFrame vs setTimeout handling
- **Memory Management**: Efficient Uint8Array operations with BGRA/RGBA conversion

## Troubleshooting

### Fixed Issues
1. **"Error launching app"** - Fixed TypeScript compilation and NODE_ENV detection
2. **"Cannot find main.js"** - Added proper `npx tsc` compilation step  
3. **"No visual pattern changes"** - Resolved base64 decode and BGRA conversion pipeline
4. **CORS errors** - Added port 5180 to backend CORS policy

### Current Status ✅
- **Electron App**: Successfully launches in production mode
- **Backend API**: All endpoints functional with 1.5-3ms response times  
- **WebGL Rendering**: BGRA patterns visible with 60+ FPS performance
- **Play/Pause/Stop**: Full playback control with frame counter synchronization

### Quick Fixes
If `WORKING-start.bat` fails:
1. Ensure .NET 8 SDK is installed: `dotnet --version`
2. Verify Node.js version: `node --version` (should be 16+)
3. Check port availability: Backend needs 5175, frontend needs 5180
4. Run `npx tsc` manually if compilation fails

## License

MIT License - This is a Proof of Concept for educational and testing purposes.