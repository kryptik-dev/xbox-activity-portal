# Xbox Activity Portal - Render Deployment Guide

## Prerequisites
- Tailscale installed and running on your home computer
- Xbox 360 with debugging enabled
- Discord application with RPC client ID

## Step 1: Tailscale Setup
1. Install Tailscale on your home computer
2. Run `tailscale up` and authenticate
3. Note your Tailscale IP (e.g., `100.71.125.83`)

## Step 2: Deploy to Render

### Option A: Deploy Backend Only (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `xbox-activity-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node src/index.js`
   - **Port**: `10000`

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `clientId`: Your Discord client ID
   - `IP`: Your Tailscale IP (e.g., `100.71.125.83`)
   - `showGamertag`: `true`

### Option B: Deploy Frontend + Backend
1. Deploy backend as above
2. Create another web service for frontend
3. Configure frontend:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm run preview`
   - **Environment Variable**: `VITE_API_URL`: Your backend URL

## Step 3: Install Tailscale on Render
1. In your Render service, go to "Environment"
2. Add build command: `curl -fsSL https://tailscale.com/install.sh | sh && cd backend && npm install`
3. Add start command: `tailscaled --tun=userspace-networking --socks5-server=localhost:1055 & cd backend && node src/index.js`

## Step 4: Configure Tailscale
1. Get your Tailscale auth key from [Tailscale Admin Console](https://login.tailscale.com/admin/authkeys)
2. Add environment variable: `TAILSCALE_AUTHKEY`: Your auth key
3. Add to start command: `tailscale up --authkey=$TAILSCALE_AUTHKEY & cd backend && node src/index.js`

## Step 5: Test Connection
1. Deploy your service
2. Check logs for Tailscale connection
3. Test Xbox connection via the web interface

## Troubleshooting
- Ensure Xbox is on and accessible via Tailscale IP
- Check Render logs for connection errors
- Verify Tailscale is running on both ends
- Make sure Discord client ID is correct

## Security Notes
- Keep your Tailscale auth key secure
- Use environment variables for sensitive data
- Monitor Render usage (free tier limits) 