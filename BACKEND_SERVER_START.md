# 백엔드 서버 시작 가이드

## 문제
`ERR_CONNECTION_REFUSED` 에러가 발생하는 경우, 백엔드 서버가 실행되지 않았습니다.

## 해결 방법

### 1. 백엔드 서버 시작

#### 방법 A: Maven 사용 (권장)
```bash
cd backend
mvn spring-boot:run
```

#### 방법 B: IDE에서 실행
1. IntelliJ IDEA 또는 Eclipse에서 `SwaEduApplication.java` 파일 열기
2. `main` 메서드에서 실행 (Run 버튼 클릭)

#### 방법 C: JAR 파일 실행
```bash
cd backend
mvn clean package
java -jar target/swa-edu-*.jar
```

### 2. 서버 확인

서버가 정상적으로 시작되면 다음 메시지가 표시됩니다:
```
Started SwaEduApplication in X.XXX seconds
```

서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 3. 필수 사전 요구사항

#### PostgreSQL 데이터베이스
- 데이터베이스가 실행 중이어야 합니다
- 연결 정보: `localhost:5432/swa_edu`
- 사용자: `postgres` / 비밀번호: `postgres`

#### 데이터베이스 마이그레이션
- Flyway가 자동으로 마이그레이션을 실행합니다
- `admin_region` 테이블이 생성되어 있어야 합니다

### 4. 포트 확인

백엔드 서버 포트는 `application.properties`에서 확인할 수 있습니다:
```properties
# 기본 포트: 8080
```

포트가 다른 경우, 프론트엔드의 `.env` 파일에서 설정:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:YOUR_PORT
```

### 5. 문제 해결

#### 포트가 이미 사용 중인 경우
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

#### 데이터베이스 연결 실패
- PostgreSQL이 실행 중인지 확인
- `application.properties`의 데이터베이스 설정 확인

#### 마이그레이션 실패
- 데이터베이스가 존재하는지 확인
- Flyway 마이그레이션 파일이 올바른지 확인

## 빠른 시작 체크리스트

- [ ] PostgreSQL 실행 중
- [ ] 데이터베이스 `swa_edu` 생성됨
- [ ] 백엔드 디렉토리로 이동 (`cd backend`)
- [ ] Maven 실행 (`mvn spring-boot:run`)
- [ ] 서버 시작 확인 (콘솔 메시지 확인)
- [ ] 브라우저에서 `http://localhost:8080` 접속 테스트

## 추가 정보

- 백엔드 서버는 Java 21이 필요합니다
- Maven이 설치되어 있어야 합니다
- 자세한 설정은 `backend/src/main/resources/application.properties` 참조
