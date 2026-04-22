#!/usr/bin/env pwsh
# Seed / initialize the PostgreSQL database.
#
# Without arguments: starts Docker services (if needed) and runs Drizzle
# migrations to bring the schema up to date.
#
# With -BackupFile: restores a plain-SQL pg_dump backup produced by
# backup-db.ps1 instead of running migrations.
#
# Usage:
#   .\docker\seed-db.ps1                                  # migrate only
#   .\docker\seed-db.ps1 -BackupFile .\docker\backups\backup-postgres-2026-04-22_10-00-00.sql
#   .\docker\seed-db.ps1 -BackupFile .\docker\backups\backup-postgres-2026-04-22_10-00-00.sql -DbName postgres

param(
    [string]$Container  = "postgres.sbrubbles",
    [string]$DbName     = "postgres",
    [string]$DbUser     = $env:POSTGRES_USER   ?? "postgres",
    [string]$DbPassword = $env:POSTGRES_PASSWORD ?? "mypassword",
    [string]$BackupFile = "",
    [switch]$SkipDocker
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── 1. Ensure services are running ──────────────────────────────────────────
if (-not $SkipDocker) {
    $composeFile = Join-Path $PSScriptRoot "docker-compose.yml"

    Write-Host "Starting Docker services..."
    docker compose -f $composeFile up -d --remove-orphans

    if ($LASTEXITCODE -ne 0) {
        Write-Error "docker compose failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    # Wait until postgres is healthy / accepting connections
    Write-Host "Waiting for PostgreSQL to be ready..."
    $maxWait   = 30   # seconds
    $elapsed   = 0
    $sleepStep = 2

    while ($elapsed -lt $maxWait) {
        $pgReady = docker exec $Container pg_isready -U $DbUser 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PostgreSQL is ready."
            break
        }
        Start-Sleep -Seconds $sleepStep
        $elapsed += $sleepStep
    }

    if ($elapsed -ge $maxWait) {
        Write-Error "PostgreSQL did not become ready within ${maxWait}s."
        exit 1
    }
}

# ─── 2a. Restore from backup ─────────────────────────────────────────────────
if ($BackupFile -ne "") {
    if (-not (Test-Path $BackupFile)) {
        Write-Error "Backup file not found: $BackupFile"
        exit 1
    }

    $resolvedPath = (Resolve-Path $BackupFile).Path
    Write-Host "Restoring '$DbName' from backup: $resolvedPath"

    # Pass the SQL file into psql inside the container via stdin so no file
    # copy to the container is required.
    $env:PGPASSWORD = $DbPassword
    Get-Content $resolvedPath -Raw | docker exec -i $Container psql `
        --username $DbUser `
        --dbname   "postgres" `
        --no-password

    if ($LASTEXITCODE -ne 0) {
        Write-Error "psql restore failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    Write-Host "Restore complete."
    exit 0
}

# ─── 2b. Run Drizzle migrations ───────────────────────────────────────────────
Write-Host "Running Drizzle migrations..."

$repoRoot = Join-Path $PSScriptRoot ".."
Set-Location $repoRoot

pnpm run db:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Error "Drizzle migration failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Database seeded successfully."
