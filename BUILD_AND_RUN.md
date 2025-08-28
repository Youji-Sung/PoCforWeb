# Medical Image Renderer PoC - 빌드 및 실행 가이드

## 요구사항
- Node.js (v16 이상)
- .NET 8 SDK
- Windows 10/11

## 🚀 빠른 실행 방법

### 방법 1: 배치 파일 사용 (권장)
1. **첫 실행 시**: `start-release.bat` 더블클릭 (빌드 + 실행)
2. **이후 실행 시**: `run-app.bat` 더블클릭 (빠른 실행)  
3. **매우 빠른 실행**: `quick-start.bat` 더블클릭 (빌드 없이 바로 실행)

### 방법 2: 수동 실행
```bash
# 터미널 1: 백엔드 시작
cd backend/bin/Release/net8.0/publish
dotnet MedicalImageApi.dll

# 터미널 2: Electron 앱 시작  
set NODE_ENV=production&& npx electron .
```

## 🛠️ 개발 모드 실행

### 전체 시스템 한 번에 실행
```bash
npm run dev-full
```

### 개별 실행
```bash
# 터미널 1: 백엔드
npm run start-backend

# 터미널 2: 프론트엔드 + Electron
npm run electron-dev
```

## 📦 실행 가능한 앱 빌드

### Windows용 설치 파일 (.exe) 생성
```bash
npm run build-electron
```

빌드 완료 후 `dist/` 폴더에 설치 파일이 생성됩니다.

## 📋 주요 npm 스크립트

- `npm run dev` - Vite 개발 서버 실행
- `npm run build` - 프론트엔드 프로덕션 빌드
- `npm run build-backend` - 백엔드 릴리즈 빌드
- `npm run electron` - Electron 앱 실행
- `npm run build-electron` - Windows용 설치 파일 생성
- `npm run dev-full` - 전체 시스템 개발 모드 실행

## 🔧 주요 포트

- **백엔드 API**: http://localhost:5175
- **프론트엔드 개발 서버**: http://localhost:5180
- **Electron 앱**: 독립 실행

## 🎮 사용법

1. **Play**: 이미지 애니메이션 시작
2. **Pause**: 애니메이션 일시 정지
3. **Stop**: 애니메이션 중지 및 초기화
4. **Resolution**: 1000x1000 또는 2000x2000 선택
5. **V-Sync**: ON (60 FPS) 또는 OFF (무제한 FPS)

## 🐛 문제 해결

### Electron 실행 오류 시
```bash
# TypeScript 재컴파일
npx tsc

# 캐시 정리
npm run build
```

### 백엔드 연결 오류 시
- 백엔드가 포트 5175에서 실행 중인지 확인
- 방화벽 설정 확인
- CORS 설정이 올바른지 확인

## 📁 프로젝트 구조

```
D:\PoC\
├── backend/                 # .NET Core 백엔드
│   ├── Controllers/         # API 컨트롤러
│   ├── Services/           # 비즈니스 로직
│   └── Models/             # 데이터 모델
├── src/                    # React 프론트엔드
│   ├── components/         # React 컴포넌트
│   ├── webgl/             # WebGL 렌더러
│   └── services/          # API 서비스
├── electron/              # Electron 메인 프로세스
└── dist/                  # 빌드 결과물
```

## 🚀 성능 최적화

**Release 모드 성능**:
- 이미지 생성: 1.5-3.0ms
- API 응답: 0.2-0.6ms
- 60+ FPS 렌더링 지원
- BGRA → RGBA 하드웨어 가속 변환