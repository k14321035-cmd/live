# IndexNow URL Submission Script for Code Tutorium
# Run: powershell -ExecutionPolicy Bypass -File submit-indexnow.ps1

$host_domain = "codetutorium.com"
$key         = "4333ccd7f5df4f928fa4ae847c61845a"
$keyLocation = "https://$host_domain/4333ccd7f5df4f928fa4ae847c61845a.txt"

# All site URLs (matches sitemap.xml)
$urls = @(
    "https://$host_domain/",
    "https://$host_domain/about",
    "https://$host_domain/contact",
    "https://$host_domain/learning-paths.html",
    "https://$host_domain/privacy",
    "https://$host_domain/terms",
    "https://$host_domain/web-compiler.html",
    "https://$host_domain/multi-language-compiler.html",
    "https://$host_domain/lessons/python",
    "https://$host_domain/lessons/c++",
    "https://$host_domain/lessons/html",
    "https://$host_domain/lessons/css",
    "https://$host_domain/lessons/java",
    "https://$host_domain/lessons/javascript",
    "https://$host_domain/lessons/c",
    "https://$host_domain/lessons/cc",
    "https://$host_domain/lessons/typescript",
    "https://$host_domain/lessons/go",
    "https://$host_domain/lessons/rust",
    "https://$host_domain/lessons/kotlin",
    "https://$host_domain/lessons/swift",
    "https://$host_domain/lessons/php",
    "https://$host_domain/lessons/sql",
    "https://$host_domain/lessons/r",
    "https://$host_domain/lessons/dart",
    "https://$host_domain/lessons/ruby",
    "https://$host_domain/lessons/matlab",
    "https://$host_domain/lessons/visualbasic",
    "https://$host_domain/lessons/shell",
    "https://$host_domain/lessons/ethicalhacking",
    "https://$host_domain/lessons/bash"
)

$body = @{
    host        = $host_domain
    key         = $key
    keyLocation = $keyLocation
    urlList     = $urls
} | ConvertTo-Json

Write-Host "Submitting $($urls.Count) URLs to IndexNow..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.indexnow.org/IndexNow" `
                                  -Method Post `
                                  -Body $body `
                                  -ContentType "application/json; charset=utf-8"

    Write-Host "SUCCESS: URLs submitted!" -ForegroundColor Green
    Write-Host "Response: $response"
} catch {
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "HTTP $statusCode" -ForegroundColor Red
    } else {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Verify at: https://www.bing.com/webmasters/indexnow" -ForegroundColor Yellow
