# PowerShell script to start the client-only version
# Only starts the Vite dev server and connects to the main server

# Start the main Vite dev server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'

# Wait a few seconds for the server to start
Start-Sleep -Seconds 3

# Open the app in the default browser
Start-Process 'http://localhost:5174/'