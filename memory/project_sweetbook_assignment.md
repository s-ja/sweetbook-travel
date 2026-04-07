---
name: 스위트북 과제전형 프로젝트 맥락
description: 스위트북 바이브코딩 풀스택 개발자 과제 전형 전반 정보 (마감, 제출, 서비스 방향)
type: project
---

스위트북 Book Print API를 활용한 여행 포토북 서비스 과제 전형 진행 중.

**Why:** 서류 합격 후 과제 전형. 결과물로 면접 진입 여부 결정.
**How to apply:** 작업 시 과제 평가 맥락(심사자 관점)을 항상 고려할 것.

## 마감
- 2026-04-08(화) 23:59
- 제출물: GitHub Public 저장소 URL + 구글폼(서술형 4문항)

## 서비스
- **주제:** 여행 포토북 (TravelBook) — 변경 없이 유지
- **스택:** Next.js 16 App Router (프론트+백엔드 통합)
- **API:** Book Print API Sandbox (api-sandbox.sweetbook.com/v1)
- **필수 API:** Books API + Orders API 모두 사용 중

## 검증 완료한 API 특성 (시행착오 기록)
- cover 템플릿 `4MY2fokVjkeY`: `dateRange`, `spineTitle` 필수 파라미터
- content 템플릿 `3FhSEhJ94c0T`: 파일 필드명이 `files`가 아닌 `photo1`이어야 함
- `SQUAREBOOK_HC`: 최소 24페이지 제약 (미달 시 400 에러)
- finalization: `Content-Length: 0` 헤더 필수 (없으면 411 에러)
- Sandbox/Live base URL 차이 직접 확인
- 템플릿마다 요구 파라미터 달라 → 템플릿 상세 조회(`GET /templates/{uid}`) 후 form-data 맞춰야 했음
