# 프로젝트 구성 리뷰

> 작성일: 2026-02-05
> 대상: .claude/ 디렉토리 구조, CLAUDE.md, Skills, Agents

---

## ✅ 잘 작성된 점

### 1. 명확한 계층 구조
- 4단계 구조가 명확하고 역할이 잘 분리됨
  ```
  CLAUDE.md (전체 방향)
    ↓
  Agent (도메인 분리: BE/FE)
    ↓
  Skills (작업 단위)
    ↓
  References (실전 코드)
  ```

### 2. 일관된 Skill 포맷
- 모든 스킬이 동일한 구조를 따름:
  - YAML frontmatter (name, description, context, agent)
  - 개요 섹션
  - 참조 문서 링크
  - 작성 원칙 (✅ 해야 할 것 / ❌ 하지 말 것)

### 3. 실용적인 References
- 복붙 가능한 코드 템플릿 제공
  - `endpoints.md`: FastAPI CRUD 엔드포인트
  - `page.md`: Next.js 페이지 구조
- Todo 예시로 통일되어 이해하기 쉬움
- 실무에서 바로 사용 가능한 수준

### 4. 명확한 역할 분담
- **be-agent**: `backend/app/` 하위만 수정
- **fe-agent**: `frontend/src/` 하위만 수정
- 영역 침범 금지 명시로 충돌 방지

### 5. 작업 순서 가이드
- BE → FE 순서 명시
- API 먼저, 화면 나중 (합리적인 접근)
- 새 기능 개발 시 일관된 워크플로우 제공

### 6. 권한 관리
- `.claude/settings.json`에 허용/거부/확인 목록 명시
- 위험한 명령어 차단:
  - `rm -rf`
  - `sudo`
  - `git push --force`
  - `git reset --hard`

---

## ⚠️ 부족한 점

### 🔴 중요: 즉시 수정 필요 (P0)

#### 1. db-agent 불일치
**문제**:
- `be-agent.md`에서 db-agent 언급 (46-48줄)
  ```markdown
  2. DB 모델이 필요하면 db-agent에게, FE 연동이 필요하면 fe-agent에게 위임을 요청합니다.
  3. DB의 crud.py 함수는 사용할 수 있지만, models.py 수정은 db-agent 담당입니다.
  ```
- CLAUDE.md에는 `db-agent` 존재하지 않음
- `backend/app/models/` 실제 담당자 불명확

**해결**:
- be-agent.md에서 db-agent 언급 제거
- models도 be-agent 담당으로 명시

#### 2. task.md 누락
**문제**:
- `git_commit/SKILL.md`에서 task.md 업데이트 언급
- 실제 파일 존재하지 않음

**해결**:
- task.md 템플릿 생성 또는
- git_commit 스킬에서 task.md 관련 내용 제거

---

### 🟡 중요: 빠른 시일 내 개선 (P1)

#### 3. Skill 트리거 조건 불명확
**문제**:
- 사용자 명령어와 스킬 매칭 기준 부족
  - "Todo CRUD 만들어줘" → BE-CRUD? FE-CRUD? 둘 다?
  - "에러 나요" → BE-DEBUG? 어떻게 판단?

**해결**:
- CLAUDE.md에 명령어 예시 섹션 추가
  ```markdown
  ### 명령어 예시
  - "Todo API 만들어줘" → be-agent (BE-CRUD)
  - "Todo 화면 만들어줘" → fe-agent (FE-CRUD)
  - "Todo 전체 만들어줘" → be-agent → fe-agent 순차 실행
  - "백엔드 에러 수정해줘" → be-agent (BE-DEBUG)
  ```

#### 4. git_commit 스킬 고립
**문제**:
- CLAUDE.md에 git_commit 언급 없음
- 에이전트 테이블에도 표시 안 됨 (BE/FE 전용 스킬만 표시)

**해결**:
- CLAUDE.md에 공통 스킬 섹션 추가
  ```markdown
  ### 공통 Skills
  | 스킬 | 용도 |
  |------|------|
  | git_commit | progress.md 업데이트 → git add → commit → push |
  ```

#### 5. MEMORY.md 미활용
**현재**: 파일은 존재하나 비어있음

**추천 내용**:
```markdown
# 프로젝트 특성
- SQLite 사용, Alembic 사용 안 함
- 초기 단계이므로 인증/권한 제외
- 외부 라이브러리 최소화 (axios, zustand 등 금지)

# 자주 하는 실수
- backend 실행 시 .venv 활성화 필수
- frontend는 /api/* 프록시 사용, localhost:8000 직접 호출 금지

# 작업 패턴
- 새 CRUD: BE-CRUD → FE-CRUD → git_commit
- 에러 발생 시: BE-DEBUG 또는 직접 수정
```

---

### 🟢 일반: 여유 있을 때 개선 (P2)

#### 6. 에러 처리 프로토콜 부재
**문제**:
- 서브에이전트가 실패하면 어떻게 처리할지 불명확
- 에이전트 간 충돌 해결 방법 없음

**해결**:
- CLAUDE.md에 에러 처리 섹션 추가
  ```markdown
  ### 에러 처리
  1. 서브에이전트 실패 시: 메인 에이전트가 에러 분석 후 재시도
  2. 에이전트 간 충돌 시: 작업 순서 재조정 (BE 우선)
  3. 반복 실패 시: 사용자에게 보고 및 수동 개입 요청
  ```

#### 7. 테스트/검증 단계 부족
**현재**: 작업 완료 → 바로 커밋

**추천**:
```markdown
### 작업 순서 (개선안)
1. BE (be-agent) → BE 테스트 (BE-TEST)
2. FE (fe-agent) → 브라우저 동작 확인
3. git_commit
```

#### 8. References 깊이 불균형
**현황**:
- BE-CRUD/references: 4개 파일 (짧고 코드 중심)
- FE-CRUD/references: 4개 파일 (길고 설명 포함)
- BE-DEBUG/references: 4개 파일 (에러 유형별)

**문제**:
- 어떤 파일은 코드만, 어떤 파일은 설명까지
- 일관성 부족

**해결**:
- 템플릿 표준화
  ```markdown
  # [주제]

  ## 개요
  간단한 설명 (1-2문장)

  ## 코드 예시
  ```코드```

  ## 주의사항
  - 포인트 1
  - 포인트 2
  ```

#### 9. 환경 설정 중복
**문제**:
- CLAUDE.md: Quick Start만 (실행 명령어)
- Porting_guide.md: 상세 설치 가이드
- 분리되어 있어 찾기 어려움

**해결**:
- CLAUDE.md에 설치 섹션 통합
  ```markdown
  ## 설치 (처음 한 번만)

  ### Backend
  ```bash
  cd backend
  python -m venv .venv
  .venv\Scripts\activate
  pip install -r requirements.txt
  ```

  ### Frontend
  ```bash
  cd frontend
  npm install
  ```

  ## 실행
  # ...
  ```

#### 10. 의존성 업데이트 가이드 부족
**누락**:
- requirements.txt 수정 시점
- package.json 수정 시점
- 새 라이브러리 추가 기준

**해결**:
- BE-CRUD, FE-CRUD에 추가
  ```markdown
  ## 외부 라이브러리 추가 시
  1. 초기 단계에서는 최소화 (built-in 우선)
  2. 필요시 사용자 승인 후 추가
  3. requirements.txt / package.json 업데이트
  4. git commit에 의존성 변경 명시
  ```

---

## 📊 종합 평가

| 항목 | 점수 | 비고 |
|------|------|------|
| 구조 설계 | ⭐⭐⭐⭐⭐ | 계층 구조 명확, 역할 분담 우수 |
| 일관성 | ⭐⭐⭐⭐☆ | 스킬 포맷 통일, 일부 불일치(db-agent) |
| 실용성 | ⭐⭐⭐⭐☆ | 코드 템플릿 좋음, 트리거 조건 보완 필요 |
| 완성도 | ⭐⭐⭐☆☆ | task.md 누락, MEMORY.md 미활용 |
| 확장성 | ⭐⭐⭐⭐☆ | 새 스킬 추가 용이, 에러 처리 보완 필요 |

**총평**:
- 전체적으로 잘 설계된 구조
- **db-agent 불일치**와 **task.md 누락** 등 세부 정합성 개선 필요
- 기본 골격은 우수하나, 실전 운영을 위한 디테일 보강 권장

---

## 🎯 우선순위별 개선 체크리스트

### 즉시 수정 (P0)
- [ ] be-agent.md에서 db-agent 언급 제거
- [ ] models.py 관리 주체를 be-agent로 명시
- [ ] task.md 생성 또는 git_commit에서 해당 내용 제거

### 빠른 시일 내 (P1)
- [ ] CLAUDE.md에 명령어 예시 섹션 추가
- [ ] CLAUDE.md에 공통 스킬 테이블 추가 (git_commit)
- [ ] MEMORY.md에 프로젝트 특성 및 작업 패턴 기록

### 여유 있을 때 (P2)
- [ ] CLAUDE.md에 에러 처리 프로토콜 추가
- [ ] References 파일 템플릿 표준화
- [ ] 테스트/검증 단계를 작업 순서에 명시
- [ ] CLAUDE.md에 설치 가이드 통합
- [ ] 의존성 업데이트 가이드 추가

---

## 📝 추가 제안

### 문서화 개선
- [ ] 각 스킬에 실행 결과 예시 추가 (Before/After)
- [ ] 자주 묻는 질문(FAQ) 섹션 추가
- [ ] 트러블슈팅 가이드 작성

### 자동화 개선
- [ ] git_commit 시 자동으로 progress.md 업데이트
- [ ] BE 작업 후 자동으로 Swagger UI 링크 제공
- [ ] FE 작업 후 자동으로 localhost:3000 페이지 경로 제공

### 품질 개선
- [ ] BE-TEST 스킬 활용 가이드 강화
- [ ] 코드 리뷰 체크리스트 추가
- [ ] 성능 최적화 가이드 추가

---

**작성자**: Claude Sonnet 4.5
**검토 대상 버전**: 2026-02-05 초기 구조
