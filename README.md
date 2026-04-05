# TravelBook — 여행을 책으로

소중한 여행의 순간들을 아름다운 포토북으로 간직하세요.
사진을 업로드하고 추억을 기록하면, 세상에 하나뿐인 나만의 여행 포토북이 완성됩니다.

Book Print API([api.sweetbook.com](https://api.sweetbook.com))를 활용한 여행 포토북 주문 웹 애플리케이션입니다.

---

## 서비스 소개

| 항목 | 내용 |
|------|------|
| 서비스 | 여행 사진을 업로드하면 실제 인쇄·배송되는 포토북을 주문할 수 있는 서비스 |
| 타겟 고객 | 여행 사진을 의미있게 보관하고 싶은 개인 여행자 |
| 주요 기능 | 사진 업로드 + 날짜·소제목·메모 입력 → 포토북 주문 원스톱 플로우 |

---

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 API Key 입력

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 환경변수

`.env.example` 파일을 복사하여 `.env.local`을 만들고 아래 값을 설정하세요.

```env
SWEETBOOK_API_KEY=your_sandbox_api_key_here
SWEETBOOK_API_URL=https://api-sandbox.sweetbook.com/v1
```

> API Key는 [api.sweetbook.com](https://api.sweetbook.com) 파트너 포털에서 발급받을 수 있습니다.
> Sandbox 환경에서는 실제 인쇄·배송이 이루어지지 않습니다.

---

## 빠른 테스트 (더미 데이터)

API 연동 전체 플로우를 즉시 테스트할 수 있도록 더미 이미지와 데이터를 제공합니다.

### 테스트 이미지 위치

```
public/dummy/images/
├── cover-front.png   # 앞표지용 (주황색)
├── cover-back.png    # 뒷표지용 (파란색)
├── content-01.png    # 내지 1장 — 제주 도착
├── content-02.png    # 내지 2장 — 렌터카 출발
├── ...
└── content-24.png    # 내지 24장 — 제주와 작별
```

### 테스트 순서

1. **앞표지**: `cover-front.png` 업로드
2. **뒷표지**: `cover-back.png` 업로드
3. **내지 사진**: `content-01.png` ~ `content-24.png` 24장 업로드
   - 각 사진의 날짜·소제목·메모는 `public/dummy/dummy-travel-data.json` 참고
4. **포토북 제목**: 예) `2026 제주도 여행`
5. **여행자 이름**: 예) `홍길동`
6. **여행 기간**: 2026.03.15 ~ 2026.03.18
7. **배송 정보** 입력 후 **포토북 주문하기** 클릭

### 더미 데이터 JSON

`public/dummy/dummy-travel-data.json`에 24장 내지의 날짜·소제목·메모 텍스트가 포함되어 있습니다.
제주도 3박 4일 여행 테마로 구성되었습니다.

```json
{
  "meta": {
    "title": "2026 제주도 여행",
    "travelerName": "여행자",
    "dateFrom": "2026-03-15",
    "dateTo": "2026-03-18"
  },
  "contents": [
    {
      "index": 1,
      "date": "3.15",
      "title": "첫째 날\n제주 도착",
      "diaryText": "긴 비행 끝에 드디어 제주에 도착했다..."
    }
  ]
}
```

---

## 사용한 API 목록

| API | 용도 |
|-----|------|
| `POST /books` | 포토북 객체 생성 |
| `POST /books/{bookUid}/cover` | 앞·뒷표지 이미지 및 템플릿 설정 |
| `POST /books/{bookUid}/contents` | 내지 사진 1장씩 추가 (최소 24페이지) |
| `POST /books/{bookUid}/finalization` | 포토북 확정 (이후 변경 불가) |
| `POST /orders` | 주문 생성 및 배송 정보 등록 |

사용한 템플릿 UID:

| 구분 | UID | 이름 |
|------|-----|------|
| 표지 | `4MY2fokVjkeY` | cover 템플릿 (SQUAREBOOK_HC) |
| 내지 | `3FhSEhJ94c0T` | 내지a_contain (일기장B 테마) |

---

## AI 도구 사용 내역

| AI 도구 | 활용 내용 |
|---------|----------|
| Claude Code | 전체 개발 (API 라우트, UI 설계, 빌드 오류 해결, 더미 데이터 생성) |
| v0 (Vercel) | 초기 UI 프로토타입 생성 |

---

## 설계 의도

**왜 여행 포토북을 선택했는가?**
Book Print API의 핵심 가치는 "디지털 콘텐츠를 실물 책으로 만드는 것"입니다.
여행 사진은 SNS에 올리거나 스마트폰에 묻혀 있기 쉽지만, 포토북으로 만들면 영구적으로 간직할 수 있습니다.
1인 파트너 관점에서 가장 명확한 수요와 완결된 플로우를 가진 서비스라고 판단했습니다.

**비즈니스 가능성**
- 여행 시장은 꾸준한 수요가 있으며, 포토북은 선물용으로도 활용 가능
- 추후 AI 자동 캡션 생성, 지도 연동 등 기능 확장 여지가 큼

**더 시간이 있었다면**
- 카카오 우편번호 API 연동
- 주문 상태 조회 페이지 (Webhook 기반)
- 사진 드래그&드롭 순서 변경
- AI 기반 여행 일기 자동 생성

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일 | Tailwind CSS v4, shadcn/ui |
| 백엔드 | Next.js API Routes (서버에서 API Key 관리) |
| Book Print API | Sweetbook Book Print API (Sandbox) |
