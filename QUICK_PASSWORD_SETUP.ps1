# PostgreSQL 비밀번호 설정 스크립트
# 관리자 권한으로 실행하세요

Write-Host "PostgreSQL 비밀번호 설정 스크립트" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# PostgreSQL 설치 경로 찾기
$postgresPaths = @(
    "C:\Program Files\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL"
)

$pgHbaPath = $null
foreach ($basePath in $postgresPaths) {
    if (Test-Path $basePath) {
        $pgHbaFile = Get-ChildItem $basePath -Recurse -Filter "pg_hba.conf" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($pgHbaFile) {
            $pgHbaPath = $pgHbaFile.FullName
            Write-Host "pg_hba.conf 파일을 찾았습니다: $pgHbaPath" -ForegroundColor Yellow
            break
        }
    }
}

if (-not $pgHbaPath) {
    Write-Host "오류: pg_hba.conf 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "PostgreSQL이 설치되어 있는지 확인하세요." -ForegroundColor Red
    Write-Host ""
    Write-Host "수동으로 찾기:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL 설치 경로의 data 폴더를 찾으세요" -ForegroundColor Yellow
    Write-Host "2. 일반 위치: C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf" -ForegroundColor Yellow
    exit 1
}

# 백업 생성
$backupPath = "$pgHbaPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $pgHbaPath $backupPath
Write-Host "백업 생성: $backupPath" -ForegroundColor Green

# 파일 내용 읽기
$content = Get-Content $pgHbaPath

# 인증 방식 변경 (trust로)
$originalContent = $content
$content = $content -replace 'scram-sha-256', 'trust'
$content = $content -replace 'md5', 'trust'

# 변경사항이 있는지 확인
if ($content -eq $originalContent) {
    Write-Host "경고: 파일 내용이 변경되지 않았습니다. 이미 trust로 설정되어 있거나 다른 형식일 수 있습니다." -ForegroundColor Yellow
} else {
    # 파일 저장
    $content | Set-Content $pgHbaPath -Encoding UTF8
    Write-Host "pg_hba.conf 파일이 업데이트되었습니다 (trust 모드)" -ForegroundColor Green
}

# PostgreSQL 서비스 찾기 및 재시작
$postgresServices = Get-Service | Where-Object {$_.Name -like "*postgresql*"}
if ($postgresServices) {
    Write-Host ""
    Write-Host "PostgreSQL 서비스를 찾았습니다:" -ForegroundColor Green
    $postgresServices | ForEach-Object {
        Write-Host "  - $($_.Name) ($($_.DisplayName))" -ForegroundColor Cyan
    }
    
    Write-Host ""
    $restart = Read-Host "PostgreSQL 서비스를 재시작하시겠습니까? (Y/N)"
    if ($restart -eq 'Y' -or $restart -eq 'y') {
        foreach ($service in $postgresServices) {
            Write-Host "서비스 재시작 중: $($service.Name)..." -ForegroundColor Yellow
            Restart-Service $service.Name -ErrorAction SilentlyContinue
            if ($?) {
                Write-Host "  ✓ 재시작 완료" -ForegroundColor Green
            } else {
                Write-Host "  ✗ 재시작 실패 (관리자 권한이 필요할 수 있습니다)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "경고: PostgreSQL 서비스를 찾을 수 없습니다." -ForegroundColor Yellow
    Write-Host "수동으로 PostgreSQL 서비스를 재시작하세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Green
Write-Host "1. psql로 접속: psql -U postgres" -ForegroundColor Cyan
Write-Host "2. 비밀번호 설정: ALTER USER postgres WITH PASSWORD 'postgres';" -ForegroundColor Cyan
Write-Host "3. 이 스크립트를 다시 실행하여 pg_hba.conf를 원래대로 복원하세요" -ForegroundColor Cyan
Write-Host ""
Write-Host "또는 application.properties에서 비밀번호를 제거하고 trust 모드를 계속 사용할 수 있습니다." -ForegroundColor Yellow
