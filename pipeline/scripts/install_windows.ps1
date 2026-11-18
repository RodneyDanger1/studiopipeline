# Studio Pipeline controller setup for Windows 11.
# Re-check every winget id with: winget search <name>
# Confirm each download is from the project named here before you run it.
$ErrorActionPreference = "Stop"

winget install -e --id Python.Python.3.12
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Gyan.FFmpeg
winget install -e --id BlenderFoundation.Blender
winget install -e --id KDE.Krita
winget install -e --id Inkscape.Inkscape
winget install -e --id Rustlang.Rustup

New-Item -ItemType Directory -Force -Path C:\Studio\refs | Out-Null
git clone --depth 1 https://github.com/opentoonz/opentoonz C:\Studio\refs\opentoonz
git clone --depth 1 https://github.com/tahoma2d/tahoma2d C:\Studio\refs\tahoma2d
git clone --depth 1 https://github.com/storytold/effectcraft C:\Studio\refs\effectcraft
git clone --depth 1 https://github.com/storytold/filmcraft C:\Studio\refs\filmcraft
git clone --depth 1 https://github.com/smyrgeorge/artcraft-toolbox C:\Studio\refs\artcraft-toolbox

Write-Host "Clones are for study. Build ArtCraft only from those repos with Rust 1.95+."
Write-Host "Python packages: python -m pip install pillow pyyaml jsonschema numpy pytest"
Write-Host "Draw: python -m studio draw examples\ep01_s001.json --out C:\Studio\vault\EP01_S001 --mp4 C:\Studio\deliverables\EP01_S001.mp4"
Write-Host "Then: python -m studio doctor"
