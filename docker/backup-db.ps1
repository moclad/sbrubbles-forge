#!/usr/bin/env pwsh
# Backup the PostgreSQL database from the running Docker container.
# Output is written to ./docker/backups/backup-<timestamp>.sql
#
# Usage:
#   .\docker\backup-db.ps1
#   .\docker\backup-db.ps1 -DbName umami_db
#   .\docker\backup-db.ps1 -DbName postgres -OutDir "D:\my-backups"

param(
    [string]$Container = "postgres.sbrubbles",
    [string]$DbName = "postgres",
    [string]$DbUser = $env:POSTGRES_USER ?? "postgres",
    [string]$OutDir = "$PSScriptRoot\backups"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Ensure the output directory exists
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
    Write-Host "Created backup directory: $OutDir"
}

# Verify the container is running
$running = docker inspect --format "{{.State.Running}}" $Container 2>$null
if ($running -ne "true") {
    Write-Error "Container '$Container' is not running. Start it with: docker compose -f docker/docker-compose.yml up -d"
    exit 1
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $OutDir "backup-${DbName}-${timestamp}.sql"

Write-Host "Backing up database '$DbName' from container '$Container'..."

docker exec $Container pg_dump `
    --username $DbUser `
    --no-password `
    --clean `
    --if-exists `
    --create `
    --format plain `
    $DbName | Set-Content -Path $backupFile -Encoding UTF8

if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

$size = (Get-Item $backupFile).Length
Write-Host "Backup complete: $backupFile ($([math]::Round($size / 1KB, 1)) KB)"
