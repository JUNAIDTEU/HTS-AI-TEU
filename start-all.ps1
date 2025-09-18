# PowerShell script to start all servers for TEU-AI-HTS-BOT
# Starts the main Vite dev server and a memory server if available
# Opens the app in the default browser

# Start the memory server (edit the command below if needed)
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd memory-bank; python -m http.server 8001'  # Change this line if your memory server is different

# Start the main Vite dev server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'

# Wait a few seconds for the server to start
Start-Sleep -Seconds 3

# Open the app in the default browser
Start-Process 'http://localhost:5173/'
