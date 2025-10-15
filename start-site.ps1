Param()

# Open index.html in the default browser from the script's directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $projectDir 'index.html'

Start-Process $indexPath


