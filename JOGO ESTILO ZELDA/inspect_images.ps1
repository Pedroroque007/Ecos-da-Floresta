Add-Type -AssemblyName System.Drawing
$base='D:\Atividades da faculdade\JOGO ESTILO ZELDA'
$files=@(
    'Assets\\jogador\\CharacterPack-Version1\\CharacterPack-Version1\\Character-Weapon\\Character-Idle-1.png',
    'Assets\\jogador\\CharacterPack-Version1\\CharacterPack-Version1\\Character-Weapon\\Character-Idle-2.png',
    'Assets\\jogador\\CharacterPack-Version1\\CharacterPack-Version1\\Character-Weapon\\Character-run-weapon.png',
    'Assets\\jogador\\CharacterPack-Version1\\CharacterPack-Version1\\Character-Weapon\\Character-jump.png',
    'Assets\\jogador\\CharacterPack-Version1\\CharacterPack-Version1\\Character-Weapon\\Character-falling.png'
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
