---
name: 과제 보강 우선순위 인사이트
description: orders/estimate 연결, README 증거 보강, 프레이밍 개선 — 마감 전 최우선 작업 목록
type: feedback
---

외부 채팅 세션에서 받은 핵심 인사이트. 당장 작업하지 않고 다음 세션에서 반영 예정.

**Why:** "더 큰 서비스"보다 핵심 흐름 검증 + 증거 + 범위 설명이 심사 점수에 직결됨.
**How to apply:** 다음 작업 세션 시작 시 아래 항목을 먼저 처리할 것.

## 1. orders/estimate 실제 UI 연결 [최우선]

**현재 문제:**
- `src/app/api/orders/estimate/route.ts`는 존재하지만 UI에서 호출하지 않음
- 가격이 클라이언트에서 `basePrice + photos.length * 500`으로 하드코딩 계산됨
- README 사용 API 목록에도 estimate가 없음

**해야 할 것:**
- finalization 완료 후, 주문 생성 전에 `POST /api/orders/estimate` 호출
- 실제 API가 반환한 `totalAmount`, `shippingFee`, `productAmount`를 UI에 표시
- "예상 가격" 카드를 API 실측값으로 교체 (크레딧 부족 여부 `creditSufficient`도 체크)
- README 사용 API 목록에 `POST /orders/estimate` 추가

## 2. README 프레이밍 개선

핵심 문장 삽입:
> "TravelBook는 단순 사진 업로드 서비스가 아니라, 각 내지에 날짜·소제목·메모를 페이지 단위로 입력해 여행 순서를 편집한 뒤 실물 포토북 주문까지 연결하는 서비스다. 부가 기능을 넓히기보다 Book Print API의 핵심 생명주기(책 생성 → 표지 → 내지 반복 → 최종화 → 주문)를 실제로 끝까지 검증하는 데 범위를 고정했다."

## 3. README 증거 섹션 추가

최소 4개 스크린샷/캡처:
1. 입력 화면 (Step 1 — 표지+내지 업로드 완성 상태)
2. 24장 충족 상태 (배지 green)
3. 주문 완료 화면 (orderUid 표시)
4. 터미널/로그 한 컷 (선택)

## 4. README에 "검증한 API 특성" 섹션 추가

시행착오 기록을 README에 명시적으로 노출:
- cover 템플릿 필수 파라미터 (dateRange, spineTitle)
- content 파일 필드명 (photo1, files 아님)
- SQUAREBOOK_HC 최소 24페이지 제약
- finalization Content-Length: 0
- sandbox/live URL 차이
- 템플릿 상세 조회 필요성
