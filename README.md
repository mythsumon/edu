# Education Program Status Dashboard

A dashboard to view the status of educational programs by region for Gyeonggi Future Chimae.

## Features

- **KPI Dashboard**: Total programs, progress rate, completed programs, participating institutions
- **Regional Progress Status**: Visualization of education progress rates for 6 regions via cards and map
- **Special Item Progress Rates**: Progress rates for books/wallpapers, 50 sessions, special classes
- **Program List**: Searchable program list table
- **Detail View Buttons**: Links to attendance sheets, activity logs, teaching material confirmations
- **Multilingual Support**: Korean/English language switching

## Tech Stack

- Next.js 15.5.3
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Ant Design 5.26.7
- Lucide React 0.537.0
- Zustand 5.0.7
- React Hook Form 7.62.0
- Zod 4.0.15

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Documentation

For detailed information about using and developing the dashboard, please refer to:

- [User Guide](USER_GUIDE.md) - Comprehensive guide for using the dashboard
- [Documentation Index](docs/index.md) - Overview of all available documentation

## Project Structure

```
/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 페이지
│   ├── globals.css        # 전역 스타일
│   └── [feature]/         # 기능별 페이지 디렉토리
├── components/            # 컴포넌트 구조
│   ├── layout/           # 레이아웃 컴포넌트 (Header, Footer)
│   ├── page/             # 페이지별 특화 컴포넌트
│   └── shared/           # 공유 컴포넌트
│       ├── common/       # 기본 UI 컴포넌트 (Button, Input, etc.)
│       ├── ui/           # 복합 UI 컴포넌트
│       └── utils/        # 유틸리티 컴포넌트
├── entities/             # 데이터 엔티티 및 비즈니스 로직
│   ├── [feature]/        # 기능별 엔티티
│   │   ├── [feature]-types.ts      # 타입 정의
│   │   ├── [feature]-query.ts      # 조회 로직
│   │   ├── [feature]-mutation.ts   # 변경 로직
│   │   ├── [feature]-dummy.ts      # 더미 데이터
│   │   └── index.ts               # 내보내기
│   ├── endpoints.ts      # API 엔드포인트 정의
│   └── index.ts          # 전체 엔티티 내보내기
├── hooks/                # 커스텀 훅
├── libs/                 # 외부 라이브러리 설정
├── locales/              # 다국어 지원
│   ├── kr/translation.json
│   └── en/translation.json
├── providers/            # Context Providers
├── assets/               # 정적 자산
│   ├── fonts/           # 폰트 파일
│   └── imgs/            # 이미지 및 아이콘
├── docs/                 # Documentation files
└── package.json
```

## Key Features Explanation

### Filtering
- Year/Month selection dropdowns
- Filter reset button
- Regional filtering (by clicking regional cards)

### Interaction
- Map synchronization when regional cards are clicked
- Tooltips displayed when hovering over map areas
- Program list search functionality
- Pagination

### Responsive Design
- Desktop: 4-column KPI cards, 3-column regional grid
- Tablet: 2-column layout
- Mobile: 1-column layout

### Multilingual Support
- Language toggle button in the top right corner of the header
- Supports Korean (default) and English
- Language preference is saved in browser storage



