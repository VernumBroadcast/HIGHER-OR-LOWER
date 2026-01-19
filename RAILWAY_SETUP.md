# Railway Setup Instructions

## To Fix "Database Not Connected" Error

The database exists, but your app service needs to reference it. Here's how to connect them:

### Step 1: Add Variable Reference (IMPORTANT!)

1. In Railway dashboard, click on your **"HIGHER-OR-LOWER"** service (not the Postgres service)
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** or **"Variable Reference"**
4. Select **"Reference Variable"**
5. Choose your **Postgres** service
6. Select **`DATABASE_URL`** from the dropdown
7. Railway will automatically create a reference variable

**Alternative method:**
- In the Postgres service Variables tab, you might see a banner saying "Trying to connect this database to a service? Add a Variable Reference"
- Click on that banner or use the "Variable Reference" option
- Select your HIGHER-OR-LOWER service
- Select `DATABASE_URL`

### Step 2: Verify Connection

1. After adding the reference, Railway will auto-redeploy your service
2. Wait for deployment to complete
3. Visit: `https://your-app-url.railway.app/api/health`
4. You should see: `{"status":"ok","database":"connected"}`

### Step 3: Test Configuration Sync

1. Go to your admin page
2. Set up your question and countries
3. Click "Save Configuration"
4. You should see "Configuration saved successfully!" (not the error message)
5. Open the app on another device - your settings should be there!

## Troubleshooting

- **If database still shows "not connected":**
  - Make sure you added the Variable Reference (not just that the database exists)
  - Check HIGHER-OR-LOWER service → Variables tab → `DATABASE_URL` should show as a reference (with a special icon)
  - Redeploy the service after adding the reference
  - Check Railway logs for database connection errors

- **If you don't want to use a database:**
  - The app will still work, but configurations will only save locally (per device)
  - Settings won't sync across devices
