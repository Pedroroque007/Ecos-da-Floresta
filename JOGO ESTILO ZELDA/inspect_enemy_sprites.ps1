Add-Type -AssemblyName System.Drawing
$base = 'D:\Atividades da faculdade\JOGO ESTILO ZELDA'
$files = @(
    'Assets\\jogador\\Samurai\\IDLE.png',
    'Assets\\jogador\\Samurai\\RUN.png',
    'Assets\\jogador\\Samurai\\HURT.png',
    'Assets\\jogador\\Samurai\\ATTACK 1.png'
)
foreach ($f in $files) {
    $p = Join-Path $base $f
    if (-Not (Test-Path $p)) {
        Write-Host "MISSING $p"
        continue
    }
    $img = [System.Drawing.Image]::FromFile($p)
    Write-Host "$($img.Width)x$($img.Height) $f"
    $img.Dispose()
}
