# PostgreSQL 비밀번호 설정 가이드

## 방법 1: 비밀번호 설정 (권장)

### Windows에서 PostgreSQL 비밀번호 설정

#### Step 1: pg_hba.conf 파일 수정 (임시로 인증 우회)

1. **pg_hba.conf 파일 찾기**
   - 일반 위치: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`
   - 또는 PostgreSQL 설치 경로의 `data` 폴더

2. **파일 편집** (관리자 권한 필요)
   - 메모장을 관리자 권한으로 실행
   - pg_hba.conf 파일 열기

3. **인증 방식 변경** (임시)
   - 다음 줄을 찾으세요:
     ```
     # IPv4 local connections:
     host    all             all             127.0.0.1/32            scram-sha-256
     ```
   - 또는:
     ```
     host    all             all             127.0.0.1/32            md5
     ```
   - `scram-sha-256` 또는 `md5`를 `trust`로 변경:
     ```
     host    all             all             127.0.0.1/32            trust
     ```

4. **PostgreSQL 서비스 재시작**
   ```powershell
   # PowerShell (관리자 권한)
   Restart-Service postgresql-x64-<version>
   ```
   또는 Windows 서비스 관리자에서 PostgreSQL 서비스 재시작

#### Step 2: 비밀번호 설정

1. **psql 접속** (이제 비밀번호 없이 접속 가능)
   ```bash
   psql -U postgres
   ```

2. **비밀번호 설정**
   ```sql
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```
   (또는 원하는 비밀번호로 변경)

3. **pg_hba.conf 복원** (보안을 위해)
   - 다시 `scram-sha-256` 또는 `md5`로 변경
   - PostgreSQL 서비스 재시작

#### Step 3: application.properties 업데이트

`backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=postgres
```

## 방법 2: 비밀번호 없이 사용 (개발 환경만)

### pg_hba.conf 영구 변경

1. **pg_hba.conf 파일 수정**
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   
   # IPv6 local connections:
   host    all             all             ::1/128                 trust
   ```

2. **PostgreSQL 서비스 재시작**

3. **application.properties에서 비밀번호 제거**
   ```properties
   # 비밀번호 필드를 비워두거나 주석 처리
   # spring.datasource.password=
   ```

   **주의**: 이 방법은 보안상 위험하므로 개발 환경에서만 사용하세요.

## 방법 3: Windows 서비스에서 비밀번호 확인

PostgreSQL이 Windows 서비스로 설치된 경우:

1. **서비스 관리자 열기**
   - `Win + R` → `services.msc`

2. **PostgreSQL 서비스 찾기**
   - 이름: `postgresql-x64-<version>` 또는 유사한 이름

3. **로그온 정보 확인**
   - 서비스 우클릭 → 속성 → 로그온 탭
   - 여기서 사용자 계정 정보 확인 가능

## 방법 4: 기본 비밀번호 시도

일부 PostgreSQL 설치에서는 기본 비밀번호가 설정되어 있을 수 있습니다:

- `postgres`
- `admin`
- `password`
- `root`
- 빈 비밀번호 (없음)

## 빠른 해결 방법 (가장 쉬움)

### 1. pg_hba.conf를 trust로 변경

```powershell
# PowerShell (관리자 권한)
# pg_hba.conf 파일 경로 (버전에 따라 다름)
$pgHbaPath = "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"

# 파일 내용 읽기
$content = Get-Content $pgHbaPath

# 인증 방식 변경
$content = $content -replace 'scram-sha-256', 'trust'
$content = $content -replace 'md5', 'trust'

# 파일 저장
$content | Set-Content $pgHbaPath

# PostgreSQL 서비스 재시작
Restart-Service postgresql-x64-16
```

### 2. psql로 접속하여 비밀번호 설정

```bash
psql -U postgres

# SQL 실행
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### 3. pg_hba.conf 복원

```powershell
# 다시 scram-sha-256로 변경
$content = Get-Content $pgHbaPath
$content = $content -replace 'trust', 'scram-sha-256'
$content | Set-Content $pgHbaPath
Restart-Service postgresql-x64-16
```

## DBeaver 연결 설정

비밀번호를 설정한 후:

1. **새 연결 생성**
2. **Main 탭**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `postgres` (또는 `swa_edu`)
   - Username: `postgres`
   - **Password**: 설정한 비밀번호 입력
   - **Save password** 체크

3. **Test Connection** 클릭

## 문제 해결

### "pg_hba.conf 파일을 찾을 수 없음"

PostgreSQL 설치 경로 확인:
```powershell
Get-Service | Where-Object {$_.Name -like "*postgresql*"}
```

또는:
```powershell
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_hba.conf"
```

### "권한이 없음"

메모장을 **관리자 권한으로 실행**:
1. 시작 메뉴에서 "메모장" 검색
2. 우클릭 → "관리자 권한으로 실행"
3. pg_hba.conf 파일 열기

### "서비스를 재시작할 수 없음"

Windows 서비스 관리자에서 수동 재시작:
1. `Win + R` → `services.msc`
2. PostgreSQL 서비스 찾기
3. 우클릭 → 다시 시작

## 체크리스트

- [ ] pg_hba.conf 파일 위치 확인
- [ ] 인증 방식을 `trust`로 변경 (임시)
- [ ] PostgreSQL 서비스 재시작
- [ ] psql로 접속하여 비밀번호 설정
- [ ] pg_hba.conf를 `scram-sha-256`로 복원
- [ ] PostgreSQL 서비스 재시작
- [ ] application.properties에 비밀번호 설정
- [ ] DBeaver에서 연결 테스트
- [ ] 백엔드 서버 시작하여 연결 확인
