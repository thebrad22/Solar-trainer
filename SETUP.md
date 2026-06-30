# Solar Trainer — Setup Guide

## What you need first
- Node.js installed (nodejs.org — download the LTS version)
- A GitHub account (github.com — free)
- A Vercel account (vercel.com — free, sign up with GitHub)
- An Anthropic API key (console.anthropic.com → API Keys)

---

## Step 1 — Add your API key

1. In this folder, find the file called `.env.example`
2. Make a copy of it and rename the copy to `.env`
3. Open `.env` and replace `paste-your-key-here` with your actual Anthropic API key
4. Save it

Your `.env` file should look like this:
  VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

The `.gitignore` file will keep this key from being uploaded to GitHub.

---

## Step 2 — Test it on your computer

Open Terminal (Mac) or Command Prompt (Windows), navigate to this folder, and run:

  npm install
  npm run dev

Then open your browser and go to:  http://localhost:5173

If the app loads and you can start a roleplay, you're ready to deploy.

The **Energy Community Checker** tab calls a small server function at `/api/geocode`. Plain
`npm run dev` does not run that function, so the checker won't work until you deploy to Vercel
(Step 4) — or, for local testing, install the Vercel CLI (`npm i -g vercel`) and run `vercel dev`
instead of `npm run dev`.

---

## Step 3 — Put it on GitHub

1. Go to github.com → click + → New repository
2. Name it `solar-trainer`, set to Public, click Create
3. Back in Terminal, run these one at a time:

  git init
  git add .
  git commit -m "first commit"
  git branch -M main
  git remote add origin https://github.com/YOURUSERNAME/solar-trainer.git
  git push -u origin main

Replace YOURUSERNAME with your GitHub username.

---

## Step 4 — Deploy on Vercel

1. Go to vercel.com and click Add New Project
2. Find solar-trainer in the list and click Import
3. Before clicking Deploy, scroll to Environment Variables and add:
     Name:  VITE_ANTHROPIC_API_KEY
     Value: your actual API key (same one from your .env file)
4. Click Deploy

Vercel gives you a live URL in about 60 seconds. Send that to anyone.

---

## Step 5 — Updating the app later

Whenever you make changes, just run:

  git add .
  git commit -m "what you changed"
  git push

Vercel automatically redeploys. Your friends' link stays the same.

---

## Troubleshooting

App loads but AI doesn't respond:
→ Your API key is missing or wrong in Vercel
→ Go to Vercel → your project → Settings → Environment Variables → check it's there
→ Then Deployments → three dots on latest deploy → Redeploy

Blank white screen:
→ Press F12 in your browser, look at the Console tab for red errors
→ Usually means something wasn't saved correctly in App.jsx

`npm install` fails:
→ Node.js didn't install correctly — reinstall from nodejs.org and restart Terminal

Energy Community Checker says "Connection error" or doesn't return results:
→ This only works when deployed on Vercel (or running `vercel dev` locally) — see Step 2 above
→ Double-check the address includes city and state
