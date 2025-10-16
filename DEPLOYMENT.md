# 🚀 Deployment Guide

## Quick Deployment (30 minutes)

### 1. Deploy Backend to Railway (10 min)

#### A. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### B. Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository
3. Click "Add variables"
4. Add environment variable:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   PORT=3001
   ```
5. In Settings:
   - Root Directory: `agent`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Click "Deploy"
7. Wait 2-3 minutes
8. Copy your Railway URL (e.g., `https://your-app.railway.app`)

---

### 2. Deploy Frontend to Vercel (10 min)

#### A. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"

#### B. Deploy Frontend
1. Import your GitHub repository
2. Framework Preset: **Next.js**
3. Root Directory: `frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   NEXT_PUBLIC_AGENT_API_URL=https://your-backend.railway.app
   ```
   (Use the Railway URL from step 1)
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your app is live! 🎉

---

### 3. Test Deployment

#### A. Test Backend
```bash
curl https://your-backend.railway.app/agent/status
```

Should return:
```json
{"name":"DeFiGuardianAI","active":true,"conversationLength":0}
```

#### B. Test Frontend
1. Visit your Vercel URL
2. Click "Connect Wallet"
3. Try a feature
4. Verify it works!

---

## Alternative: Deploy Backend to Render

### If Railway doesn't work:

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your repository
5. Settings:
   - Name: `defi-guardian-backend`
   - Root Directory: `agent`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add Environment Variable:
   ```
   GEMINI_API_KEY=your_key
   ```
7. Click "Create Web Service"
8. Copy your Render URL
9. Update Vercel environment variable

---

## Troubleshooting

### Backend Issues

**Problem:** Build fails
**Solution:** Check that `agent/package.json` has build script:
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
}
```

**Problem:** Agent not responding
**Solution:** Check GEMINI_API_KEY is set correctly

### Frontend Issues

**Problem:** Build fails
**Solution:** Make sure environment variables are set

**Problem:** Can't connect to backend
**Solution:** Check NEXT_PUBLIC_AGENT_API_URL is correct

---

## Post-Deployment Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Wallet connection works
- [ ] Can view portfolio
- [ ] Can chat with AI
- [ ] Token transfer works
- [ ] All features accessible

---

## Update README

After deployment, update README.md with your live URLs:

```markdown
## 🌐 Live Demo

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **Demo Video**: [Your YouTube Link]
```

---

## Smart Contracts (Optional)

If you want to deploy contracts:

```bash
cd blockchain
npm install
echo "PRIVATE_KEY=your_metamask_private_key" > .env
npm run deploy:sepolia
```

Then update contract addresses in frontend components.

---

## 🎉 You're Live!

Your DeFi Guardian AI is now accessible to anyone!

Share your links:
- In hackathon submission
- On social media
- With judges

Good luck! 🚀
