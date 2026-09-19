# Génère toutes les icônes de CyMD à partir du logo (image carrée avec un logo rond).
#   powershell -ExecutionPolicy Bypass -File scripts/make-icons.ps1 [-Source chemin.png]
#
# Le cercle est recadré et redessiné avec un bord lissé (supprime les pixels parasites
# autour du logo généré), puis décliné en :
#   build/icon.png     1024 px  (macOS / Linux, electron-builder)
#   build/icon.ico     16 → 256 px (exécutable et installeur Windows)
#   electron/icon.png  256 px   (icône de fenêtre, boîte « À propos »)
#   public/logo.png    128 px   (logo de l'interface, favicon)

param(
  [string]$Source = "assets/branding/cymd-logo-yellow.png",
  # Rayon utile du cercle dans l'image source (en fraction de la demi-largeur) : un peu
  # en retrait du bord pour éliminer la frange irrégulière.
  [double]$InnerRadius = 0.982
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function New-Canvas([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  return @($bmp, $g)
}

$src = New-Object System.Drawing.Bitmap (Resolve-Path $Source).Path

# Centre et rayon du disque : bornes des pixels opaques sur la ligne à 25 % de la hauteur
# (loin des parasites du bord), puis géométrie du cercle.
$y = [int]($src.Height / 4)
$first = -1; $last = -1
for ($x = 0; $x -lt $src.Width; $x++) {
  if ($src.GetPixel($x, $y).A -gt 200) { if ($first -lt 0) { $first = $x }; $last = $x }
}
$cx = ($first + $last) / 2.0
$cy = $src.Height / 2.0
$half = ($last - $first) / 2.0
$dy = $cy - $y
$radius = [math]::Sqrt($half * $half + $dy * $dy)
$r = $radius * $InnerRadius
Write-Host ("Cercle source : centre ({0:N1}, {1:N1}), rayon {2:N1} px, rayon utilisé {3:N1} px" -f $cx, $cy, $radius, $r)

# Image maîtresse 1024 px : fond jaune plein (bouche les trous semi-transparents),
# puis le logo redimensionné, découpé en disque avec un bord anti-crénelé.
$size = 1024
$margin = 8
$rOut = $size / 2 - $margin
$scale = $rOut / $r

$scaled, $gs = New-Canvas $size
$dest = New-Object System.Drawing.RectangleF ([float]($size / 2 - $cx * $scale)), ([float]($size / 2 - $cy * $scale)), ([float]($src.Width * $scale)), ([float]($src.Height * $scale))
$gs.DrawImage($src, $dest)
$gs.Dispose()

$fill = $src.GetPixel([int]$cx, [int]($cy - $r * 0.9))
$master, $g = New-Canvas $size
$disk = New-Object System.Drawing.RectangleF ([float]$margin), ([float]$margin), ([float]($rOut * 2)), ([float]($rOut * 2))
$g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, $fill.R, $fill.G, $fill.B))), $disk)
$texture = New-Object System.Drawing.TextureBrush $scaled
$g.FillEllipse($texture, $disk)
$g.Dispose()
$src.Dispose()

function Save-Resized([System.Drawing.Bitmap]$from, [int]$px, [string]$path) {
  $bmp, $gr = New-Canvas $px
  $gr.DrawImage($from, 0, 0, $px, $px)
  $gr.Dispose()
  New-Item -ItemType Directory -Force (Split-Path -Parent $path) | Out-Null
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force build, public | Out-Null
$master.Save((Join-Path $root 'build/icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Save-Resized $master 256 (Join-Path $root 'electron/icon.png')
Save-Resized $master 128 (Join-Path $root 'public/logo.png')

# Fichier .ico : entrées PNG (valables depuis Windows Vista) de 16 à 256 px.
$sizes = 16, 20, 24, 32, 40, 48, 64, 128, 256
$pngs = foreach ($px in $sizes) {
  $bmp, $gr = New-Canvas $px
  $gr.DrawImage($master, 0, 0, $px, $px)
  $gr.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  , $ms.ToArray()
}
$out = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $out
$w.Write([uint16]0); $w.Write([uint16]1); $w.Write([uint16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $px = $sizes[$i]
  $b = if ($px -ge 256) { 0 } else { $px }
  $w.Write([byte]$b); $w.Write([byte]$b); $w.Write([byte]0); $w.Write([byte]0)
  $w.Write([uint16]1); $w.Write([uint16]32)
  $w.Write([uint32]$pngs[$i].Length); $w.Write([uint32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $w.Write($p) }
$w.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $root 'build/icon.ico'), $out.ToArray())
$master.Dispose()

Get-Item build/icon.png, build/icon.ico, electron/icon.png, public/logo.png | ForEach-Object { "{0,-20} {1,8:N0} octets" -f $_.FullName.Substring($root.Length + 1), $_.Length }
