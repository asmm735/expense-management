try {
    Write-Output "--- Ports and node processes ---"
    netstat -aon | findstr :5000
    netstat -aon | findstr :3000
    tasklist /FI "IMAGENAME eq node.exe"

    $ErrorActionPreference = 'Stop'
    $email = 'test.user@example.com'
    $password = 'Password123!'

    Write-Output "--- Attempt signup ---"
    try {
        $signupBody = @{ name='Test User'; companyName='Test Co'; email=$email; password=$password; country='US' }
        $signup = Invoke-RestMethod -Uri http://localhost:5000/auth/signup -Method Post -ContentType 'application/json' -Body ($signupBody | ConvertTo-Json)
        Write-Output "Signup response: $(ConvertTo-Json $signup -Depth 5)"
        $token = $signup.access_token
    } catch {
        Write-Output "Signup failed: $($_.Exception.Message)"
        Write-Output "Attempting login..."
        $loginBody = @{ email=$email; password=$password }
        $login = Invoke-RestMethod -Uri http://localhost:5000/auth/login -Method Post -ContentType 'application/json' -Body ($loginBody | ConvertTo-Json)
        Write-Output "Login response: $(ConvertTo-Json $login -Depth 5)"
        $token = $login.access_token
    }

    if (-not $token) { throw 'No token obtained from auth' }
    Write-Output "Token length: $($token.Length)"

    Write-Output "--- Create expense ---"
    $expense = @{ description='Auto test expense'; category='Meals'; date=(Get-Date).ToString('yyyy-MM-dd'); paid_by='Personal Card'; amount='15.75'; currency='USD'; remarks='Auto-submitted via script'; status='Waiting approval' }
    $created = Invoke-RestMethod -Uri http://localhost:5000/expenses -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body ($expense | ConvertTo-Json)
    Write-Output "Created expense: $(ConvertTo-Json $created -Depth 5)"

    Write-Output "--- List my expenses ---"
    $list = Invoke-RestMethod -Uri http://localhost:5000/expenses/my -Method Get -Headers @{ Authorization = "Bearer $token" }
    Write-Output "Expenses: $(ConvertTo-Json $list -Depth 5)"
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
}
