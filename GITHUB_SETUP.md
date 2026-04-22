# Host on GitHub Pages (Free Forever)

## Step-by-Step (5 Minutes)

### 1. Create a GitHub Account
- Go to https://github.com/signup
- Sign up with your email (free)

### 2. Create a New Repository
- Click the **+** button (top right) → **New repository**
- Name it: `lucky-nexus`
- Make it **Public**
- Click **Create repository**

### 3. Upload the Files
- On your new repo page, click **"uploading an existing file"**
- Drag ALL files from the `source` folder into the upload area
- OR use this faster method:
  - Click **"<> Code"** tab
  - Click **"Add file"** → **"Upload files"**
  - Drag the entire folder contents
- Click **Commit changes**

### 4. Enable GitHub Pages
- Go to **Settings** tab (top of repo)
- Click **Pages** in the left sidebar
- Under **Source**, select **GitHub Actions**
- Done! The workflow file is already included

### 5. Trigger First Deploy
- Go to **Actions** tab (top of repo)
- Click the **"Deploy to GitHub Pages"** workflow
- Click **Run workflow** → **Run workflow**
- Wait 2-3 minutes for the build

### 6. Your Permanent URL
- Go back to **Settings** → **Pages**
- Your URL will be: `https://YOURUSERNAME.github.io/lucky-nexus/`
- This URL is **permanent and free forever**

### 7. Install on Your Phone
- Open your URL on your phone's browser
- **Android Chrome**: Menu → Add to Home screen → Install
- **iPhone Safari**: Share button → Add to Home Screen
- Works like a native app, fully offline!

---

## Updating Predictions

The app has 26 years of data built-in. To add NEW draws after they happen:

### Option A: Manual (In the App)
1. Open the app on your phone/computer
2. Scroll to **"Add Latest Draw Result"**
3. Enter the winning numbers from nationallottery.co.za
4. AI recalculates everything instantly

### Option B: Update Source Data
1. After a new draw, download the updated predictions.json
2. Upload it to your repo's `dist/` folder
3. Commit the change
4. GitHub Actions auto-redeploys

---

## What You Get
- **Permanent URL** that never expires
- **Works on any device** (phone, tablet, computer)
- **Fully offline** after first load
- **6 AI models** running in the browser
- **Free forever** - GitHub Pages costs nothing
