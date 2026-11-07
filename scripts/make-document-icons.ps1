# Regenerate document icons from the font-free SVG source on Windows.
# powershell -ExecutionPolicy Bypass -File scripts/make-document-icons.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
[xml]$svg = Get-Content -Raw -LiteralPath (Join-Path $root 'assets/branding/cymd-document.svg')
$culture = [Globalization.CultureInfo]::InvariantCulture

function New-Canvas([int]$size) {
  $bitmap = New-Object Drawing.Bitmap $size, $size, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([Drawing.Color]::Transparent)
  $graphics.SmoothingMode = 'AntiAlias'
  $graphics.InterpolationMode = 'HighQualityBicubic'
  $graphics.PixelOffsetMode = 'HighQuality'
  return @($bitmap, $graphics)
}

# This SVG deliberately uses only absolute M/L/C/Z commands and solid fills.
$master, $graphics = New-Canvas 1024
foreach ($element in $svg.svg.path) {
  $path = New-Object Drawing.Drawing2D.GraphicsPath
  $tokens = [regex]::Matches($element.d, '[MLCZ]|-?\d+(?:\.\d+)?')
  $cursorX = 0; $cursorY = 0; $index = 0
  while ($index -lt $tokens.Count) {
    $command = $tokens[$index++].Value
    switch ($command) {
      'M' {
        $cursorX = [float]::Parse($tokens[$index++].Value, $culture)
        $cursorY = [float]::Parse($tokens[$index++].Value, $culture)
        $path.StartFigure()
      }
      'L' {
        $nextX = [float]::Parse($tokens[$index++].Value, $culture)
        $nextY = [float]::Parse($tokens[$index++].Value, $culture)
        $path.AddLine($cursorX, $cursorY, $nextX, $nextY)
        $cursorX = $nextX; $cursorY = $nextY
      }
      'C' {
        $points = @(); for ($n = 0; $n -lt 6; $n++) { $points += [float]::Parse($tokens[$index++].Value, $culture) }
        $path.AddBezier($cursorX, $cursorY, $points[0], $points[1], $points[2], $points[3], $points[4], $points[5])
        $cursorX = $points[4]; $cursorY = $points[5]
      }
      'Z' { $path.CloseFigure() }
      default { throw "Unsupported SVG command: $command" }
    }
  }
  $brush = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($element.fill))
  $graphics.FillPath($brush, $path)
  $brush.Dispose(); $path.Dispose()
}
# Composite the original app logo embedded in the SVG, without redrawing it.
foreach ($element in $svg.svg.image) {
  $href = $element.GetAttribute('href')
  if (-not $href.StartsWith('data:image/png;base64,')) { throw 'Expected an embedded PNG logo' }
  $bytes = [Convert]::FromBase64String($href.Substring(22))
  $inputStream = New-Object IO.MemoryStream (,$bytes)
  $logo = [Drawing.Image]::FromStream($inputStream)
  $graphics.DrawImage($logo, [int]$element.x, [int]$element.y, [int]$element.width, [int]$element.height)
  $logo.Dispose(); $inputStream.Dispose()
}
$graphics.Dispose()

function Png-Bytes([int]$size) {
  $bitmap, $graphics = New-Canvas $size
  $graphics.DrawImage($master, 0, 0, $size, $size)
  $graphics.Dispose()
  $stream = New-Object IO.MemoryStream
  $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  $bytes = $stream.ToArray(); $stream.Dispose()
  return ,$bytes
}

$build = Join-Path $root 'build'
[IO.Directory]::CreateDirectory($build) | Out-Null
[IO.File]::WriteAllBytes((Join-Path $build 'cymd.png'), (Png-Bytes 1024))
$sizes = @(16, 20, 24, 32, 40, 48, 64, 128, 256)
$pngs = @{}; foreach ($size in ($sizes + @(512,1024))) { $pngs[$size] = Png-Bytes $size }
$stream = New-Object IO.MemoryStream
$writer = New-Object IO.BinaryWriter $stream
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
foreach ($size in $sizes) {
  $dimension = if ($size -eq 256) { 0 } else { $size }
  $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
  $writer.Write([byte]0); $writer.Write([byte]0)
  $writer.Write([uint16]1); $writer.Write([uint16]32)
  $writer.Write([uint32]$pngs[$size].Length); $writer.Write([uint32]$offset)
  $offset += $pngs[$size].Length
}
foreach ($size in $sizes) { $writer.Write([byte[]]$pngs[$size]) }
$writer.Flush()
[IO.File]::WriteAllBytes((Join-Path $build 'cymd.ico'), $stream.ToArray())
$writer.Dispose(); $stream.Dispose()

# Modern ICNS stores PNG representations, with big-endian container lengths.
function Write-BigEndian($writer, [uint32]$value) {
  $bytes = [BitConverter]::GetBytes($value)
  if ([BitConverter]::IsLittleEndian) { [Array]::Reverse($bytes) }
  $writer.Write($bytes)
}
$types = [ordered]@{icp4=16;icp5=32;icp6=64;ic07=128;ic08=256;ic09=512;ic10=1024}
$length = 8; foreach ($size in $types.Values) { $length += 8 + $pngs[$size].Length }
$stream = New-Object IO.MemoryStream
$writer = New-Object IO.BinaryWriter $stream
$writer.Write([Text.Encoding]::ASCII.GetBytes('icns')); Write-BigEndian $writer $length
foreach ($type in $types.Keys) {
  $bytes = $pngs[$types[$type]]
  $writer.Write([Text.Encoding]::ASCII.GetBytes($type)); Write-BigEndian $writer ($bytes.Length + 8)
  $writer.Write([byte[]]$bytes)
}
$writer.Flush()
[IO.File]::WriteAllBytes((Join-Path $build 'cymd.icns'), $stream.ToArray())
$writer.Dispose(); $stream.Dispose(); $master.Dispose()
Write-Output 'Generated build/cymd.png, build/cymd.ico and build/cymd.icns'

