AI Media Launcher 설치 매뉴얼

이 문서는 AI Media Launcher를 설치하고 실행하는 방법을 단계별로 안내합니다.

1.  Node.js 설치 AI Media Launcher는 Node.js 환경에서 실행됩니다. 먼저 Node.js를 설치해야 합니다.

1)  아래 링크를 클릭해 Node.js 다운로드 페이지로 이동합니다.

    https://nodejs.org/ko/download

2)  운영체제에 맞는 LTS 버전을 다운로드합니다.
3)  설치 파일을 실행하고 안내에 따라 설치를 완료합니다.

2.  소스 코드 다운로드

1)  GitHub 저장소로 이동합니다

    https://github.com/gyette-ai/AI-media-launcher

2)  우측 상단의 Code 버튼 클릭
3)  Download ZIP 선택
4)  ZIP 파일의 압축을 원하는 위치에 해제합니다.

3.  터미널 실행 및 명령어 입력

3.1 Windows에서 터미널 열기
1) 압축을 푼 폴더로 이동합니다. 
2) 폴더 빈 공간에서 Shift + 마우스 오른쪽 클릭 
3) “PowerShell 창 여기서 열기” 또는
“터미널에서 열기” 선택 (또는 주소창에 cmd 입력 후 Enter)

*프로그램 설치가 재대로 되지 않을 경우 터미널을 관리자 권한으로 실행 바람*

3.2 프로그램 설치 및 빌드

1) 필요한 패키지 설치 npm install
2) 프로그램 빌드 (실행 파일 생성) npm run build

• 빌드가 완료되면 release 폴더에 설치 파일이 생성됩니다. 예: AI Media
Launcher Setup 1.0.0.exe

4.  참고 사항 • npm 명령어가 작동하지 않는다면 Node.js가 제대로 설치되지
    않았을 수 있습니다. 설치 후 컴퓨터를 재부팅하고 다시 시도하세요.
