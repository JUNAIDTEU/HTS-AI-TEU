# PowerShell script to start all servers for TEU-AI-HTS-BOT
# Starts the database server, API server, Vite dev server, and memory server
# Opens the app in the default browser

# Start the memory server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd memory-bank; python -m http.server 8001'

# Start the database server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'node dbServer.js'

# Start the API server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm start'

# Start the main Vite dev server
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'

# Wait a few seconds for the servers to start
Start-Sleep -Seconds 5

# Open the app in the default browser
Start-Process 'http://localhost:5174/'
