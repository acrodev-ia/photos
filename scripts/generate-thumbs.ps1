# Génère les miniatures d'accueil (max 800 px de large, JPEG qualité 80).
# Usage : powershell -File scripts/generate-thumbs.ps1

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$maxWidth = 800
$quality = 80L

$covers = @(
  "images/action_vtt/XS105758.jpg"
  "images/action_vtt_nb/DSCF9134.jpg"
  "images/action_file/DSCF5022.jpg"
  "images/action_divers/DSCF7492.jpg"
  "images/nature_animaux/DSCF7007.jpg"
  "images/nature_insectes/DSCF7971.jpg"
  "images/nature_flore/DSCF1793.jpg"
  "images/nature_eau/DSCF5652.jpg"
  "images/paysage_montagnes/DSCF8794.jpg"
  "images/paysage_mer/DSCF6649.jpg"
  "images/paysage_sunset/DSCF4130.jpg"
  "images/paysage_automne/XS105858.jpg"
  "images/paysage_divers/DSCF4275.jpg"
  "images/paysage_urbain/DSCF1773.jpg"
  "images/divers_nuit/DSCF5363.jpg"
  "images/divers_bivouac/DSCF3036.jpg"
)

function Get-OrientedBitmap([System.Drawing.Image]$img) {
  $bitmap = New-Object System.Drawing.Bitmap $img
  $orientation = 1
  try {
    $orientation = $img.GetPropertyItem(0x0112).Value[0]
  } catch { }

  switch ($orientation) {
    2 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
    3 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
    4 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipY) }
    5 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
    6 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
    7 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
    8 { $bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
  }

  return $bitmap
}

function Save-Jpeg([System.Drawing.Bitmap]$bitmap, [string]$path, [long]$jpegQuality) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter (
    [System.Drawing.Imaging.Encoder]::Quality,
    $jpegQuality
  )
  $bitmap.Save($path, $codec, $params)
}

foreach ($relative in $covers) {
  $sourcePath = Join-Path $root $relative
  if (-not (Test-Path $sourcePath)) {
    Write-Warning "Introuvable : $relative"
    continue
  }

  $thumbRelative = $relative -replace "^images/", "images/thumbs/"
  $thumbPath = Join-Path $root $thumbRelative
  $thumbDir = Split-Path $thumbPath -Parent
  if (-not (Test-Path $thumbDir)) {
    New-Item -ItemType Directory -Path $thumbDir | Out-Null
  }

  $bytes = [System.IO.File]::ReadAllBytes($sourcePath)
  $stream = New-Object System.IO.MemoryStream(,$bytes)
  $source = [System.Drawing.Image]::FromStream($stream)
  $oriented = Get-OrientedBitmap $source

  $ratio = if ($oriented.Width -gt $maxWidth) { $maxWidth / $oriented.Width } else { 1 }
  $newWidth = [Math]::Max(1, [int][Math]::Round($oriented.Width * $ratio))
  $newHeight = [Math]::Max(1, [int][Math]::Round($oriented.Height * $ratio))

  $thumb = New-Object System.Drawing.Bitmap $newWidth, $newHeight
  $graphics = [System.Drawing.Graphics]::FromImage($thumb)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.DrawImage($oriented, 0, 0, $newWidth, $newHeight)

  Save-Jpeg $thumb $thumbPath $quality

  $sourceKb = [Math]::Round((Get-Item $sourcePath).Length / 1KB)
  $thumbKb = [Math]::Round((Get-Item $thumbPath).Length / 1KB)
  Write-Output ("{0}  {1} KB -> {2} KB  ({3}x{4})" -f $relative, $sourceKb, $thumbKb, $newWidth, $newHeight)

  $graphics.Dispose()
  $thumb.Dispose()
  $oriented.Dispose()
  $source.Dispose()
  $stream.Dispose()
}
