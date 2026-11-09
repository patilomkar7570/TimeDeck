$ErrorActionPreference = 'Stop'
$Repo = 'patilomkar7570/TimeDeck'
$Description = 'Explore global time with live city clocks, interactive time-zone comparisons, and effortless date and time conversions in one beautiful, local-first PWA.'
$Tag = 'v1.0.0'

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found. Install Git and GitHub CLI (https://cli.github.com/), then retry."
  }
}

Require-Command 'git'
Require-Command 'gh'
Set-Location (Split-Path -Parent $PSScriptRoot)

gh auth status
if ($LASTEXITCODE -ne 0) {
  throw "GitHub CLI is not authenticated. Run 'gh auth login' and then retry."
}

if (-not (Test-Path '.git')) {
  git init
  if ($LASTEXITCODE -ne 0) { throw 'git init failed.' }
}
git branch -M main
if ($LASTEXITCODE -ne 0) { throw 'Could not set the main branch.' }

# Configure a GitHub no-reply identity only when this local project has no identity set.
$gitName = git config user.name
$gitEmail = git config user.email
if ([string]::IsNullOrWhiteSpace($gitName)) { git config user.name 'Omkar' }
if ([string]::IsNullOrWhiteSpace($gitEmail)) { git config user.email '329106345+patilomkar7570@users.noreply.github.com' }

git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
$hasHead = $true
git rev-parse --verify HEAD *> $null
if ($LASTEXITCODE -ne 0) { $hasHead = $false }
git diff --cached --quiet
$hasStagedChanges = ($LASTEXITCODE -ne 0)
if (-not $hasHead -or $hasStagedChanges) {
  git commit -m 'release: TimeDeck v1.0.0'
  if ($LASTEXITCODE -ne 0) { throw 'git commit failed.' }
}

$tagExists = $false
git rev-parse -q --verify "refs/tags/$Tag" *> $null
if ($LASTEXITCODE -eq 0) { $tagExists = $true }
if (-not $tagExists) {
  git tag -a $Tag -m 'TimeDeck v1.0.0'
  if ($LASTEXITCODE -ne 0) { throw 'Could not create the release tag.' }
}

# Create the repository if it does not yet exist; otherwise push to the existing one.
gh repo view $Repo --json name *> $null
$repoExists = ($LASTEXITCODE -eq 0)
$expectedHttps = "https://github.com/$Repo.git"
$origin = git remote get-url origin 2>$null
$hasOrigin = ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($origin))
if ($hasOrigin -and $origin -notmatch 'github\.com[:/]patilomkar7570/TimeDeck(\.git)?$') {
  throw "The existing origin remote points to '$origin', not $expectedHttps. Remove or correct it before publishing; the script will not push to an unrelated repository."
}

if (-not $repoExists) {
  if ($hasOrigin) {
    throw "The target GitHub repository does not exist, but this folder already has an origin remote ($origin). Remove it before creating the new TimeDeck repository."
  }
  gh repo create $Repo --public --source . --remote origin --push --description $Description
  if ($LASTEXITCODE -ne 0) { throw 'GitHub repository creation or initial push failed.' }
} else {
  if (-not $hasOrigin) {
    git remote add origin $expectedHttps
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure the origin remote.' }
  }
  git push --set-upstream origin main
  if ($LASTEXITCODE -ne 0) { throw 'Could not push main to GitHub.' }
}

git push origin $Tag
if ($LASTEXITCODE -ne 0) { throw 'Could not push the release tag.' }

gh repo edit $Repo --description $Description --homepage 'https://patilomkar7570.github.io/TimeDeck/'
if ($LASTEXITCODE -ne 0) { throw 'Could not update the repository description, website or topics.' }

gh release view $Tag --repo $Repo *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Release $Tag already exists on GitHub; repository and tag are pushed."
} else {
  gh release create $Tag --repo $Repo --title 'TimeDeck v1.0.0' --notes-file RELEASE_NOTES.md
  if ($LASTEXITCODE -ne 0) { throw 'The GitHub release could not be created.' }
}

Write-Host ''
Write-Host "Published: https://github.com/$Repo"
Write-Host "Release:   https://github.com/$Repo/releases/tag/$Tag"
