Add-Type -AssemblyName System.Drawing
$base = 'D:\Atividades da faculdade\JOGO ESTILO ZELDA'
$path = Join-Path $base 'Assets\\jogador\\Samurai\\IDLE.png'
if (-Not (Test-Path $path)) {
    Write-Host "MISSING $path"
    exit 1
}
$img = [System.Drawing.Bitmap]::FromFile($path)
$w = $img.Width
$h = $img.Height
$cols = [int]($w / $h)
Write-Host "Width" $w "Height" $h "Frames" $cols
for ($f = 0; $f -lt $cols; $f++) {
    $x0 = $f * $h
    $top = $h
    $bottom = -1
    $left = -1
    $right = -1
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = $x0; $x -lt $x0 + $h; $x++) {
            $c = $img.GetPixel($x, $y)
            if ($c.A -gt 10) {
                if ($y -lt $top) { $top = $y }
                if ($y -gt $bottom) { $bottom = $y }
                if ($left -eq -1 -or $x -lt $left) { $left = $x }
                if ($right -eq -1 -or $x -gt $right) { $right = $x }
            }
        }
    }
    Write-Host "Frame" $f "Top" $top "Bottom" $bottom "Height" ($bottom - $top + 1) "Left" ($left - $x0) "Right" ($right - $x0)
}
$img.Dispose()
