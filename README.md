# AvenPro

Website for the Universal Sports & Talent Federation (USTF). Current stage: prototype.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Admin panel: http://localhost:3000/admin

## Settings

Create `.env.local` in the project root (never commit it). Add the same values in the hosting dashboard.

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/avenpro
ADMIN_PASSWORD=a-long-password-for-the-admin-panel
```

## Current limitations

- Photos and videos are stored only in the admin's browser.
- Payments are by UPI and are checked manually: the admin matches each UTR number and amount with the bank before approving.
- Set the receiving UPI ID in Admin > Website Content.
- Competition fees, rules, team and contact details start as sample data.

## Structure

- `src/lib` - types, sample data and the data store
- `src/components` - public website, registration and admin components
- `src/app` - routes
