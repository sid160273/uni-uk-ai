# Vercel Deployment Guide for Uni-UK.AI

## Step 1: Create a Vercel Account

1. **Go to Vercel**
   - Visit: https://vercel.com/signup

2. **Sign up with GitHub** (Recommended)
   - Click "Continue with GitHub"
   - This makes deployment easier as it connects your repos automatically
   - Authorize Vercel to access your GitHub account

   **OR Sign up with Email**
   - Enter your email address
   - Click "Continue"
   - Check your email and click the verification link

3. **Complete your profile**
   - Choose a username
   - Complete any additional setup steps

## Step 2: Deploy Your Project

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new

2. **Import Git Repository**
   - If you connected GitHub: You'll see your repositories
   - Find your `uni` project repository
   - Click "Import"

   **If you don't have it on GitHub yet:**
   - First, create a GitHub repository
   - Push your code to GitHub:
   ```bash
   cd /Users/Sid12/uni
   git remote add origin https://github.com/YOUR_USERNAME/uni-uk-ai.git
   git branch -M main
   git push -u origin main
   ```

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - Click "Deploy"

### Option B: Deploy via Vercel CLI (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate

3. **Deploy**
   ```bash
   cd /Users/Sid12/uni
   vercel
   ```
   - Answer the prompts:
     - Set up and deploy? **Y**
     - Which scope? (Select your account)
     - Link to existing project? **N**
     - Project name: **uni-uk-ai**
     - Directory: **./** (just press Enter)
     - Override settings? **N**

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Add Environment Variables

**CRITICAL**: Your OpenAI API key needs to be added to Vercel

1. **Go to your project in Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `uni-uk-ai` project

2. **Go to Settings → Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" in the sidebar

3. **Add your OpenAI API Key**
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your-actual-openai-api-key-here`
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

4. **Redeploy** (Required after adding env variables)
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

## Step 4: Configure Your Domain (uni-uk.ai)

### If you already own uni-uk.ai:

1. **Add Domain in Vercel**
   - Go to Project → Settings → Domains
   - Enter: `uni-uk.ai`
   - Click "Add"

2. **Configure DNS**
   - Vercel will show you DNS records to add
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the DNS records shown by Vercel:
     - **A Record**: `@` → `76.76.21.21`
     - **CNAME Record**: `www` → `cname.vercel-dns.com`

3. **Wait for DNS Propagation**
   - This can take 5 minutes to 48 hours
   - Vercel will automatically provision SSL certificate

### If you need to purchase uni-uk.ai:

1. **Purchase from domain registrar**
   - Recommended: Namecheap, GoDaddy, or Google Domains
   - Search for "uni-uk.ai"
   - Purchase the domain

2. **Follow steps above to configure DNS**

## Step 5: Verify Deployment

1. **Visit your Vercel deployment URL**
   - After deployment, Vercel gives you a URL like:
   - `https://uni-uk-ai.vercel.app`
   - or
   - `https://uni-uk-ai-yourusername.vercel.app`

2. **Test the site**
   - ✓ Homepage loads
   - ✓ Chat works (tests OpenAI API)
   - ✓ University pages load
   - ✓ Navigation works
   - ✓ AdSense loads (may be blank until approved)

3. **Check build logs**
   - If something doesn't work, check the deployment logs
   - Go to Deployments → Click on deployment → View "Build Logs"

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript has no errors

### Chat doesn't work
- Verify OPENAI_API_KEY is set in environment variables
- Check Function logs in Vercel dashboard

### Domain not working
- Wait up to 48 hours for DNS propagation
- Verify DNS records are correct
- Use https://dnschecker.org to check DNS status

## Your Deployment URLs

After deployment, you'll have:
- **Production**: https://uni-uk.ai (once domain configured)
- **Vercel URL**: https://uni-uk-ai.vercel.app
- **Preview**: Automatic preview URLs for each git push

## Next Steps After Deployment

1. ✓ Submit sitemap to Google Search Console
2. ✓ Verify AdSense implementation
3. ✓ Set up analytics (optional)
4. ✓ Monitor performance in Vercel dashboard
