# AvenPro

Website for the Universal Sports & Talent Federation (USTF). Current stage: prototype.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Admin panel: http://localhost:3000/admin

## Prototype limitations

- No backend: data is stored in the browser (localStorage and IndexedDB).
- No admin login.
- Razorpay works in test mode only; UPI QR is a placeholder. No real payment is processed.
- Competition fees, rules, team and contact details are sample data.

## Structure

- `src/lib` - types, sample data and the data store
- `src/components` - public website, registration and admin components
- `src/app` - routes

## Razorpay test payments

Create a file named `.env.local` in the project root (it is not committed):

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

Get the keys from the Razorpay Dashboard in Test Mode, then restart `npm run dev`.
Only test keys are accepted.
