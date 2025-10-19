# 🚀 DEPLOYMENT GUIDE - NFT Certificate Contract

## ⚠️ BEFORE YOU START

You need:
1. **MetaMask wallet** with a test account
2. **Base Sepolia ETH** (free from faucet)
3. **5 minutes** of your time

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### Step 1: Get Base Sepolia ETH (2 minutes)

1. Go to: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Connect your MetaMask wallet
3. Click "Send me ETH"
4. Wait 30 seconds for confirmation
5. Check your wallet - you should have 0.1 ETH

### Step 2: Get Your Private Key (1 minute)

**⚠️ IMPORTANT: Use a TEST wallet, not your real wallet!**

1. Open MetaMask
2. Click the 3 dots → Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key

### Step 3: Configure Environment (1 minute)

1. Open `blockchain/.env` file
2. Replace `your_private_key_here` with your actual private key:
   ```
   PRIVATE_KEY=0x1234567890abcdef...
   ```
3. Save the file

### Step 4: Deploy Contract (1 minute)

```bash
cd blockchain
npx hardhat run scripts/deploy-certificate.js --network baseSepolia
```

**Expected output:**
```
Deploying DeFi Certificate NFT Contract...
✅ DeFiCertificate deployed to: 0x1234...5678
Waiting for block confirmations...
✅ Contract verified on Basescan
📝 Deployment info saved to deployments/
🎉 Deployment complete!
```

### Step 5: Update Environment Variables (1 minute)

Copy the contract address from the output above.

**Update `agent/.env`:**
```env
CERTIFICATE_CONTRACT_ADDRESS=0x1234...5678
MINTER_PRIVATE_KEY=0x1234567890abcdef...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

**Update `frontend/.env`:**
```env
NEXT_PUBLIC_CERTIFICATE_CONTRACT=0x1234...5678
```

---

## ✅ VERIFICATION

### Check on Block Explorer:
1. Go to: https://sepolia.basescan.org
2. Search for your contract address
3. You should see:
   - ✅ Contract created
   - ✅ Source code verified
   - ✅ Contract name: DeFiCertificate

### Test Minting (Optional):
```bash
cd agent
npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3001/education/mint-nft \
  -H "Content-Type: application/json" \
  -d '{"certificateId":"test","address":"0xYourAddress"}'
```

---

## 🎯 WHAT IF SOMETHING GOES WRONG?

### Error: "insufficient funds"
- **Solution**: Get more Base Sepolia ETH from the faucet

### Error: "invalid private key"
- **Solution**: Make sure you copied the full private key (starts with 0x)

### Error: "network not found"
- **Solution**: Make sure you're in the `blockchain` folder

### Error: "contract verification failed"
- **Solution**: That's OK! The contract is still deployed and working

---

## 🎉 SUCCESS!

Once deployed, your NFT certificate contract is:
- ✅ Live on Base Sepolia testnet
- ✅ Ready to mint certificates
- ✅ Viewable on Basescan
- ✅ Integrated with your backend

---

## 🔒 SECURITY NOTES

1. **Never commit your `.env` file** - It's in `.gitignore`
2. **Use a test wallet** - Don't use your real wallet with funds
3. **Keep your private key safe** - Don't share it with anyone
4. **This is testnet** - No real money involved

---

## 📞 NEED HELP?

If you get stuck:
1. Check the error message carefully
2. Make sure you have Base Sepolia ETH
3. Verify your private key is correct
4. Try restarting the terminal

---

## 🚀 NEXT STEPS

After deployment:
1. ✅ Update environment variables
2. ✅ Restart your backend server
3. ✅ Test minting a certificate
4. ✅ Record your demo video!

**Your NFT certificate system is now LIVE!** 🎓
