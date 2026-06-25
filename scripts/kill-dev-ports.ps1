# Kill stale Next.js dev servers on Windows (fixes 404 / missing module errors)
$ports = 3000, 3001
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object { $_.OwningProcess } |
    Select-Object -Unique |
    ForEach-Object {
      $proc = Get-Process -Id $_ -ErrorAction SilentlyContinue
      if ($proc -and ($proc.ProcessName -match "node|next")) {
        Write-Host "Stopping PID $_ ($($proc.ProcessName)) on port $port"
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
      }
    }
}
Start-Sleep -Seconds 2
Write-Host "Ports 3000/3001 cleared. Run: npm run dev"
