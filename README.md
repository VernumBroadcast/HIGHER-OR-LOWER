# Higher or Lower Game

A web-based Higher or Lower game with admin panel for configuration.

## Setup for Railway Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Railway will automatically provide `DATABASE_URL` if you add a PostgreSQL database.
   If not using Railway's database, set `DATABASE_URL` in your environment variables.

3. **Deploy:**
   Railway will automatically detect the Node.js app and deploy it.

## Features

- Admin panel to configure countries, rankings, and reveal numbers
- Game interface with Higher/Lower/Draw options
- Server-side configuration storage (syncs across devices)
- Export/Import configuration files
- Auto-calculated rankings from reveal numbers

## API Endpoints

- `GET /api/config` - Get current configuration
- `POST /api/config` - Save configuration
