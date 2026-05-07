# 启动所有服务（后台持久运行）
Write-Host "正在启动所有服务..." -ForegroundColor Green

# 先杀掉旧进程
$ports = @(3000, 5174, 5175)
foreach ($port in $ports) {
    $pid = (netstat -ano | Select-String ":$port.*LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] }) | Select-Object -First 1
    if ($pid) {
        taskkill /F /PID $pid 2>$null
        Write-Host "已关闭端口 $port 的进程 (PID: $pid)" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 2

# 启动后端（3000）
$backendJob = Start-Process -FilePath "cmd" `
    -ArgumentList "/c cd /d c:\公众号任务\backend && npm run dev" `
    -WindowStyle Minimized -PassThru
Write-Host "后端服务启动中... (PID: $($backendJob.Id))" -ForegroundColor Cyan

Start-Sleep -Seconds 6

# 启动 H5（5174）
$h5Job = Start-Process -FilePath "cmd" `
    -ArgumentList "/c cd /d c:\公众号任务\employee-h5 && npm run dev" `
    -WindowStyle Minimized -PassThru
Write-Host "H5服务启动中... (PID: $($h5Job.Id))" -ForegroundColor Cyan

Start-Sleep -Seconds 3

# 启动管理后台（5175）
$adminJob = Start-Process -FilePath "cmd" `
    -ArgumentList "/c cd /d c:\公众号任务\admin-frontend && npm run dev" `
    -WindowStyle Minimized -PassThru
Write-Host "管理后台启动中... (PID: $($adminJob.Id))" -ForegroundColor Cyan

Start-Sleep -Seconds 5

# 检查状态
Write-Host "`n--- 服务状态检查 ---" -ForegroundColor Green
$checkPorts = @(3000, 5174, 5175)
foreach ($port in $checkPorts) {
    $listening = netstat -ano | Select-String ":$port.*LISTENING"
    if ($listening) {
        Write-Host "✅ 端口 $port: 运行中" -ForegroundColor Green
    } else {
        Write-Host "❌ 端口 $port: 未启动" -ForegroundColor Red
    }
}

Write-Host "`n访问地址：" -ForegroundColor White
Write-Host "  H5员工端:   http://localhost:5174" -ForegroundColor White
Write-Host "  管理后台:   http://localhost:5175" -ForegroundColor White
Write-Host "  后端API:    http://localhost:3000" -ForegroundColor White
Write-Host "`n服务已在后台运行，关闭此窗口不会停止服务。" -ForegroundColor Green
