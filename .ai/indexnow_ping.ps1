# IndexNow ping — notifies Bing / DuckDuckGo / Yandex / Yahoo of all live URLs.
# Fully autonomous, no account required. Run after every git push that changes content.
# Usage:  powershell -ExecutionPolicy Bypass -File .ai\indexnow_ping.ps1

$ErrorActionPreference = "Stop"
$host_   = "btcson66-rgb.github.io"
$key     = "12f0a1e3ab8d45ea94b4344a1d979bc0d8e0de30ffb5451ebcd9d5061bab5cbd"
$keyLoc  = "https://$host_/freelance-tools/$key.txt"

# Read all <loc> URLs from the sitemap
$sitemap = Join-Path $PSScriptRoot "..\sitemap.xml"
$urls = Select-String -Path $sitemap -Pattern "<loc>(.*?)</loc>" -AllMatches |
        ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value }
Write-Output "Found $($urls.Count) URLs in sitemap"

$body = @{
    host        = $host_
    key         = $key
    keyLocation = $keyLoc
    urlList     = @($urls)
} | ConvertTo-Json

# IndexNow is a shared protocol: pinging one participating engine propagates to the rest,
# but we hit the two primary endpoints directly for redundancy.
$endpoints = @(
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow"
)
foreach ($ep in $endpoints) {
    try {
        $r = Invoke-WebRequest -Uri $ep -Method Post -Body $body `
             -ContentType "application/json; charset=utf-8" -UseBasicParsing
        Write-Output "$ep -> HTTP $($r.StatusCode) $($r.StatusDescription)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Output "$ep -> HTTP $code (200/202 = accepted; 422 = key/URL mismatch)"
    }
}
