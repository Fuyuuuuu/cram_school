# 從專案根目錄執行此腳本以啟動後端（例如：.\scripts\start-backend.ps1）
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "backend"))) {
    Write-Host "錯誤：請在專案根目錄 (cram_school) 執行此腳本，或將腳本放在 scripts 資料夾內。"
    exit 1
}
$env:PYTHONPATH = $ProjectRoot
Set-Location $ProjectRoot
Write-Host "PYTHONPATH=$env:PYTHONPATH"
Write-Host "啟動後端：http://localhost:8000  (Ctrl+C 結束)"
python -m uvicorn backend.api.index:app --reload --host 0.0.0.0 --port 8000
