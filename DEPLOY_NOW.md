# 🚀 Deploy NOW - Quick Guide

## ✅ Your Code is Ready!

Both frontend and backend build successfully. Time to deploy!

---

## 📦 Step 1: Push to GitHub (5 min)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "DeFi Guardian AI - ADK-TS Hackathon 2025"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/defi-guardian-ai.git
git branch -M main
git push -u origin main
```

---

## 🚂 Step 2: Deploy Backend to Railway (5 min)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Add variables":
   ```
   GEMINI_API_KEY=your_gemini_key_here
   ```
6. In Settings:
   - Root Directory: `agent`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. Click "Deploy"
8. **Copy your Railway URL** (e.g., `https://defi-guardian-production.up.railway.app`)

---

## ▲ Step 3: Deploy Frontend to Vercel (5 min)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   NEXT_PUBLIC_AGENT_API_URL=https://your-backend.railway.app
   ```
   (Use the Railway URL from Step 2!)
7. Click "Deploy"
8. **Copy your Vercel URL** (e.g., `https://defi-guardian.vercel.app`)

---

## ✅ Step 4: Test Your Deployment

### Test Backend:
```bash
curl https://your-backend.railway.app/agent/status
```

Should return:
```json
{"name":"DeFiGuardianAI","active":true,"conversationLength":0}
```

### Test Frontend:
1. Visit your Vercel URL
2. Click "Connect Wallet"
3. Try chatting with AI
4. Check portfolio

---

## 📝 Step 5: Update README

Add your live URLs to README.md:

```markdown
## 🌐 Live Demo

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **GitHub**: https://github.com/YOUR_USERNAME/defi-guardian-ai
```

Commit and push:
```bash
git add README.md
git commit -m "Add live demo links"
git push
```

---

## 🎬 Step 6: Record Demo Video

Now that it's live, record your demo:

1. Open your Vercel URL
2. Start screen recording (OBS/Loom)
3. Show:
   - Connect wallet
   - View portfolio
   - Transfer tokens
   - Chat with AI
   - Show Etherscan transaction
4. Upload to YouTube
5. Add link to README

---

## 📤 Step 7: Submit to Hackathon

Go to hackathon submission form and enter:

**Project Name:** DeFi Guardian AI

**Description:** AI-powered DeFi portfolio management platform built with ADK-TS framework. Features real blockchain transactions, multi-chain support, and FREE AI integration using Google Gemini.

**GitHub:** https://github.com/YOUR_USERNAME/defi-guardian-ai

**Live Demo:** https://your-app.vercel.app

**Demo Video:** https://youtube.com/watch?v=YOUR_VIDEO

**Track:** Track 3 - Web3 Use Cases

**Bonus Tracks:** 
- Most Practical Real-World Use Case
- Best Technical Implementation
- Best Improvement to ADK-TS

---

## 🎉 You're Done!

Your project is:
- ✅ Built and tested
- ✅ Deployed and live
- ✅ Documented
- ✅ Ready to win!

**Good luck! 🏆**

---

## 🆘 Troubleshooting

### Railway Build Fails
- Check `agent/package.json` has:
  ```json
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
  ```

### Vercel Build Fails
- Make sure environment variables are set
- Check `NEXT_PUBLIC_AGENT_API_URL` points to Railway

### Backend Not Responding
- Check GEMINI_API_KEY is set in Railway
- Check logs in Railway dashboard

### Frontend Can't Connect
- Verify `NEXT_PUBLIC_AGENT_API_URL` is correct
- Check CORS is enabled in backend (it is!)

---

**Need help? Check DEPLOYMENT.md for detailed instructions.**
