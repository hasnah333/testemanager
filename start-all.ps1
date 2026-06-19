# ═══════════════════════════════════════════════════════════════
#  Demarre TOUT le stack Test Manager (MySQL + Backend + Frontend)
#  Chaque service est lance en processus detache (survit a la fermeture).
#  Double-cliquez ce fichier (ou : clic droit > Executer avec PowerShell)
#  pour (re)demarrer l'application a tout moment.
# ═══════════════════════════════════════════════════════════════

$root = 'C:\Users\Hasna\OneDrive\Desktop\projectpfee'

function Test-Port($port) {
    [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}
function Start-Detached($cmdLine) {
    Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdLine } | Out-Null
}

# ── MySQL (XAMPP) ──
if (Test-Port 3306) {
    Write-Host "MySQL    : deja actif"
} else {
    Write-Host "MySQL    : demarrage..."
    Start-Detached '"c:\xampp\mysql\bin\mysqld.exe" --defaults-file="c:\xampp\mysql\bin\my.ini"'
    for ($i = 0; $i -lt 20 -and -not (Test-Port 3306); $i++) { Start-Sleep 2 }
    Write-Host $(if (Test-Port 3306) { "MySQL    : OK" } else { "MySQL    : ECHEC" })
}

# ── Backend (jar) ──
if (Test-Port 8081) {
    Write-Host "Backend  : deja actif"
} else {
    Write-Host "Backend  : demarrage..."
    Start-Detached "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\start-backend.ps1`""
    for ($i = 0; $i -lt 45 -and -not (Test-Port 8081); $i++) { Start-Sleep 2 }
    Write-Host $(if (Test-Port 8081) { "Backend  : OK" } else { "Backend  : ECHEC" })
}

# ── Microservice IA (FastAPI) ──
if (Test-Port 8000) {
    Write-Host "IA       : deja actif"
} else {
    Write-Host "IA       : demarrage..."
    Start-Detached "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\start-severity-ai.ps1`""
    for ($i = 0; $i -lt 30 -and -not (Test-Port 8000); $i++) { Start-Sleep 2 }
    Write-Host $(if (Test-Port 8000) { "IA       : OK" } else { "IA       : ECHEC" })
}

# ── Frontend (Vite) ──
if (Test-Port 3000) {
    Write-Host "Frontend : deja actif"
} else {
    Write-Host "Frontend : demarrage..."
    Start-Detached "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$root\start-frontend.ps1`""
    for ($i = 0; $i -lt 30 -and -not (Test-Port 3000); $i++) { Start-Sleep 2 }
    Write-Host $(if (Test-Port 3000) { "Frontend : OK" } else { "Frontend : ECHEC" })
}

Write-Host ""
Write-Host "════════════════════════════════════"
Write-Host ("  MySQL 3306    : " + $(if (Test-Port 3306) { "ACTIF" } else { "ARRETE" }))
Write-Host ("  Backend 8081  : " + $(if (Test-Port 8081) { "ACTIF" } else { "ARRETE" }))
Write-Host ("  IA 8000       : " + $(if (Test-Port 8000) { "ACTIF" } else { "ARRETE" }))
Write-Host ("  Frontend 3000 : " + $(if (Test-Port 3000) { "ACTIF" } else { "ARRETE" }))
Write-Host "════════════════════════════════════"
Write-Host ""
Write-Host "  Application : http://localhost:3000"
Write-Host ""
