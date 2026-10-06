# SETUP GUIDE for Kartu Review Pintar

## 1️⃣ Prerequisites

- **Node.js** (v18 or higher) and **npm** (or **yarn**). Verify with:
  ```bash
  node -v
  npm -v
  ```
- **Git** installed and configured with your credentials.
- **Firebase CLI** (`npm i -g firebase-tools`). Make sure you are logged in with the Google account that owns the Firebase project:
  ```bash
  firebase login
  ```
- Access to the GitHub repository `https://github.com/verraIsHere/kartu-review-pintar.git`.

---

## 2️⃣ Clone the repository (fresh copy)

```bash
# Change to your working directory
cd "C:\belajarku\Belajar Laravel"

# If the folder already exists, remove it (or rename it) because we will force‑reset the history.
# **⚠️ This will delete any uncommitted local changes**
rm -rf kartu-review-pintar

# Clone the official repo
git clone https://github.com/verraIsHere/kartu-review-pintar.git
```

> The above creates a fresh copy with the exact commit history from the remote.

---

## 3️⃣ Set the **origin** remote to your personal GitHub fork (optional)

If you want to push to your own fork, create it on GitHub first, then:

```bash
cd kartu-review-pintar

git remote rename origin upstream   # keep the original as upstream

git remote add origin https://github.com/<YOUR_USERNAME>/kartu-review-pintar.git
```

---

## 4️⃣ Force‑push any local commits you already have (dangerous!)

> Use **only** if you know the local history should overwrite the remote.

```bash
# Make sure you are on the main branch (or the branch you intend to push)
git checkout main

# Force push to the remote you just added (or the upstream if you really need it)
git push origin main --force
```

---

## 5️⃣ Install project dependencies

```bash
npm install   # or `yarn install`
```

---

## 6️⃣ Configure **Firebase** for the project

1. **Create / locate the Firebase project** that is linked to the email you are currently logged in with (`firebase login`).
2. In the Firebase console, obtain the **Web configuration** (Project Settings → Your apps → "Add app" → "Web" → Config). It looks like:
   ```json
   {
     "apiKey": "...",
     "authDomain": "your-project.firebaseapp.com",
     "projectId": "your-project",
     "storageBucket": "your-project.appspot.com",
     "messagingSenderId": "...",
     "appId": "...",
     "measurementId": "..."
   }
   ```
3. Create a **`.env.local`** file in the project root (same level as `package.json`) and add the values:
   ```dotenv
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```
   **Important:** Do **not** commit this file; it is already listed in `.gitignore`.
4. Verify the Firebase initialization file (`lib/firebase/config.ts`) imports the variables correctly:
   ```ts
   import { initializeApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```
5. **Deploy** Firestore security rules and indexes (optional but recommended):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   This reads `firestore.rules` and `firestore.indexes.json` from the repo.

---

## 7️⃣ Run the development server

```bash
npm run dev   # or `yarn dev`
```

Open <http://localhost:3000> – the app should load without the previous search‑related errors.

---

## 8️⃣ Common pitfalls & fixes

| Symptom | Likely cause | Fix |
|----------|---------------|-----|
| `Module "firebase/firestore" has no exported member 'offset'` | The Firestore SDK does not provide `offset`. Use `startAfter` with a document snapshot for pagination. | We already replaced `offset` with `startAfter` in `lib/firestore/links.ts` (see file changes). |
| Search returns **permission‑denied** | Firestore security rules block the read. Add a rule that allows read on `links` collection or test with the Firebase console. |
| Missing env variables | Ensure `.env.local` exists and contains all keys listed in step 6. |
| `git push --force` refused | You may not have permission on the original repo. Push to a fork you own (see step 3). |

---

## 9️⃣ Optional: Deploy the Next.js app to Vercel (or Firebase Hosting)

1. Install Vercel CLI (`npm i -g vercel`).
2. Run `vercel login` and `vercel` inside the project root.
3. Follow the prompts – Vercel will automatically read the environment variables you defined in `.env.local`.

---

## 📌 Summary
1. **Clone** the repo (or force‑reset it).
2. **Configure** Git remote for your fork and **force‑push** if required.
3. **Install** dependencies.
4. **Create** `.env.local` with Firebase web config.
5. **Replace** the removed `offset` usage with `startAfter` (already applied).
6. **Deploy** Firestore rules/indexes.
7. **Run** `npm run dev` and verify the app works.

That’s the full end‑to‑end setup. Feel free to ask if any step needs clarification!
