# Build the frontend and start the server
Write-Host "Building frontend..." -ForegroundColor Green
npm run build

Write-Host "Starting server..." -ForegroundColor Green
node server.js

# The server will be accessible at http://localhost:3000