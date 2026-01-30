# PostgreSQL 데이터베이스 생성 및 연결 가이드

## 방법 1: psql 명령어로 데이터베이스 생성 (권장)

### 1단계: PostgreSQL에 접속

PowerShell 또는 명령 프롬프트에서:

```bash
# PostgreSQL이 설치된 경로로 이동 (일반적으로)
cd "C:\Program Files\PostgreSQL\<version>\bin"

# 또는 PATH에 등록되어 있다면 바로 실행
psql -U postgres
```

비밀번호를 입력하세요 (기본값: `postgres` 또는 설치 시 설정한 비밀번호)

### 2단계: 데이터베이스 생성

psql 프롬프트에서:

```sql
-- 데이터베이스 생성
CREATE DATABASE swa_edu;

-- 데이터베이스 확인
\l

-- 생성한 데이터베이스로 연결
\c swa_edu

-- 연결 확인
SELECT current_database();

-- 종료
\q
```

## 방법 2: DBeaver에서 데이터베이스 생성

### 1단계: PostgreSQL 서버에 연결

1. DBeaver에서 **새 데이터베이스 연결** 생성
2. **PostgreSQL** 선택
3. 연결 설정:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `postgres` (기본 데이터베이스)
   - **Username**: `postgres`
   - **Password**: PostgreSQL 설치 시 설정한 비밀번호
4. **Test Connection** 클릭하여 연결 확인
5. **Finish** 클릭

### 2단계: 새 데이터베이스 생성

1. 연결된 `postgres` 데이터베이스를 우클릭
2. **Create** → **Database** 선택
3. 데이터베이스 이름 입력: `swa_edu`
4. **OK** 클릭

### 3단계: 새 데이터베이스에 연결

1. **새 데이터베이스 연결** 생성
2. 연결 설정:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `swa_edu` (새로 생성한 데이터베이스)
   - **Username**: `postgres`
   - **Password**: PostgreSQL 비밀번호
3. **Test Connection** 클릭
4. **Finish** 클릭

## 방법 3: SQL 스크립트로 생성

DBeaver의 SQL Editor에서:

```sql
-- postgres 데이터베이스에 연결한 상태에서 실행
CREATE DATABASE swa_edu
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Korean_Korea.949'
    LC_CTYPE = 'Korean_Korea.949'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 생성 확인
SELECT datname FROM pg_database WHERE datname = 'swa_edu';
```

## 프로젝트 설정 확인

### application.properties 확인

`backend/src/main/resources/application.properties` 파일을 확인하고 필요시 수정:

```properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/swa_edu
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE
```

**중요**: `YOUR_PASSWORD_HERE`를 실제 PostgreSQL 비밀번호로 변경하세요.

## 비밀번호 문제 해결

### 비밀번호를 잊어버린 경우

1. **pg_hba.conf 파일 수정** (PostgreSQL 설정 파일)
   - 위치: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`
   - `md5` 또는 `scram-sha-256`를 `trust`로 변경 (임시)
   - PostgreSQL 서비스 재시작

2. **비밀번호 재설정**
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```

3. **pg_hba.conf를 원래대로 복원** (보안을 위해)

### 비밀번호 확인/변경

psql에서:

```sql
-- 현재 사용자 확인
SELECT current_user;

-- 비밀번호 변경
ALTER USER postgres WITH PASSWORD 'your_new_password';
```

## 연결 테스트

### DBeaver에서 테스트

1. 새 연결 생성
2. **Test Connection** 클릭
3. 성공 메시지 확인

### 백엔드 서버에서 테스트

```bash
cd backend
mvn spring-boot:run
```

서버가 정상적으로 시작되면 데이터베이스 연결이 성공한 것입니다.

## 마이그레이션 실행

데이터베이스가 생성되면 Flyway가 자동으로 마이그레이션을 실행합니다:

1. 백엔드 서버 시작
2. 콘솔에서 Flyway 마이그레이션 로그 확인
3. DBeaver에서 테이블 생성 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## 문제 해결

### "password authentication failed" 오류

1. PostgreSQL 비밀번호 확인
2. `application.properties`의 비밀번호 확인
3. DBeaver 연결 설정의 비밀번호 확인
4. PostgreSQL 서비스가 실행 중인지 확인

### "database does not exist" 오류

1. 데이터베이스가 생성되었는지 확인:
   ```sql
   SELECT datname FROM pg_database;
   ```
2. 데이터베이스 이름이 정확한지 확인 (`swa_edu`)

### "connection refused" 오류

1. PostgreSQL 서비스가 실행 중인지 확인:
   ```bash
   # Windows PowerShell
   Get-Service -Name postgresql*
   ```
2. 포트 5432가 사용 가능한지 확인
3. PostgreSQL 서비스 시작

## 빠른 시작 체크리스트

- [ ] PostgreSQL 설치 및 실행 중
- [ ] `swa_edu` 데이터베이스 생성
- [ ] `application.properties`에 올바른 비밀번호 설정
- [ ] DBeaver에서 연결 테스트 성공
- [ ] 백엔드 서버 시작하여 마이그레이션 실행
- [ ] 테이블 생성 확인
