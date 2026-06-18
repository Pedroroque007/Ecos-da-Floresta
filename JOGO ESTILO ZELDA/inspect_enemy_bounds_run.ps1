Add-Type -AssemblyName System.Drawing
$base = 'D:\Atividades da faculdade\JOGO ESTILO ZELDA'
$path = Join-Path $base 'Assets\\jogador\\Samurai\\RUN.png'
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
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = $x0; $x -lt $x0 + $h; $x++) {
            $c = $img.GetPixel($x, $y)
            if ($c.A -gt 10) {
                if ($y -lt $top) { $top = $y }
                if ($y -gt $bottom) { $bottom = $y }
            }
        }
    }
    Write-Host "Frame" $f "Top" $top "Bottom" $bottom "Height" ($bottom - $top + 1)
}
$img.Dispose()
