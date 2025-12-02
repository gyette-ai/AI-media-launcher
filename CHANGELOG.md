# Changelog

All notable changes to this project will be documented in this file.

## [v1.1.0-optimized] - 2025-12-03

### Optimized
- **Backend Performance**: Implemented caching for static system information (CPU Model, GPU Model, Total RAM) to significantly reduce CPU usage during system stats polling.
- **Frontend Load Time**: Applied Lazy Loading to the `PerformanceDialog` component, reducing the initial bundle size and startup time.
- **Rendering Efficiency**: Memoized `SortableLauncherItem` components to prevent unnecessary re-renders of the entire grid during drag-and-drop interactions.

## [v1.1.0] - 2025-12-02

### Added
- **Performance Monitor**: Added a real-time system status panel displaying CPU, RAM, and GPU usage.
    - Features a floating glassmorphism design.
    - Includes a toggle button in the title bar.
    - Auto-closes when navigating away from the launcher view.
- **Custom Icon Support**: Implemented full support for user-uploaded custom icons for launcher items.
    - Added a secure `media://` protocol to load local image files safely.
    - Fixed issues with Windows drive letter path resolution.

### Changed
- **UI Refinements**:
    - Improved animations for dialog entry and exit using Framer Motion.
    - Enhanced the visual design of the "Add New" button.
    - Adjusted panel transparency and blur effects for a more premium look.

### Fixed
- **GPU Detection**: Fixed an issue where NVIDIA GPUs were not correctly reporting usage and temperature (implemented `nvidia-smi` fallback).
- **Animation Bugs**: Resolved issues where the performance panel would disappear without an exit animation.
- **Build System**: Fixed syntax errors and build configuration issues to ensure stable production builds.

## [v1.0.0] - 2025-11-24

### Initial Release
- Basic Launcher Grid with Drag and Drop support.
- File Explorer integration.
- Context Menu system (Right-click actions).
- Category Management.
- Basic App and URL adding functionality.

---

# 변경 기록 (Changelog - Korean)

이 프로젝트의 모든 주요 변경 사항은 이 파일에 문서화됩니다.

## [v1.1.0-optimized] - 2025-12-03

### 최적화 (Optimized)
- **백엔드 성능**: 시스템 통계 폴링 중 CPU 사용량을 줄이기 위해 정적 시스템 정보(CPU 모델, GPU 모델, 총 RAM) 캐싱을 구현했습니다.
- **프론트엔드 로딩 시간**: `PerformanceDialog` 컴포넌트에 지연 로딩(Lazy Loading)을 적용하여 초기 번들 크기 및 시작 시간을 단축했습니다.
- **렌더링 효율성**: 드래그 앤 드롭 상호작용 중 전체 그리드의 불필요한 재렌더링을 방지하기 위해 `SortableLauncherItem` 컴포넌트에 메모이제이션(Memoization)을 적용했습니다.

## [v1.1.0] - 2025-12-02

### 추가됨 (Added)
- **성능 모니터**: CPU, RAM, GPU 사용량을 보여주는 실시간 시스템 상태 패널을 추가했습니다.
    - 플로팅 글래스모피즘(Glassmorphism) 디자인을 적용했습니다.
    - 타이틀 바에 토글 버튼을 포함했습니다.
    - 런처 화면에서 벗어날 때 패널이 자동으로 닫히도록 설정했습니다.
- **커스텀 아이콘 지원**: 사용자가 업로드한 커스텀 아이콘을 완벽하게 지원하도록 구현했습니다.
    - 로컬 이미지 파일을 안전하게 로드하기 위해 보안 `media://` 프로토콜을 추가했습니다.
    - Windows 드라이브 문자 경로가 올바르게 인식되지 않던 문제를 수정했습니다.

### 변경됨 (Changed)
- **UI 개선**:
    - Framer Motion을 사용하여 다이얼로그의 진입 및 종료 애니메이션을 개선했습니다.
    - "새로 추가" 버튼의 시각적 디자인을 강화했습니다.
    - 더 고급스러운 느낌을 주기 위해 패널의 투명도와 블러 효과를 조정했습니다.

### 수정됨 (Fixed)
- **GPU 감지**: NVIDIA GPU가 사용량과 온도를 올바르게 보고하지 않는 문제를 수정했습니다 (`nvidia-smi` 폴백 기능 구현).
- **애니메이션 버그**: 성능 패널이 종료 애니메이션 없이 즉시 사라지는 문제를 해결했습니다.
- **빌드 시스템**: 안정적인 배포를 위해 문법 오류 및 빌드 설정 문제를 수정했습니다.

## [v1.0.0] - 2025-11-24

### 초기 릴리스 (Initial Release)
- 드래그 앤 드롭을 지원하는 기본 런처 그리드.
- 파일 탐색기 통합.
- 컨텍스트 메뉴 시스템 (우클릭 기능).
- 카테고리 관리 기능.
- 기본 앱 및 URL 추가 기능.
