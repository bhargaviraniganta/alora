# DrugExciPredict

**Drug–Excipient Compatibility Predictor** - An AI-powered web application for predicting drug-excipient interactions in pharmaceutical formulations.

## Overview

DrugExciPredict helps pharmaceutical researchers and formulators predict the compatibility between active pharmaceutical ingredients (APIs) and excipients using machine learning models.

## Features

- **User Authentication**: Secure login/signup with JWT tokens and password hashing
- **Drug-Excipient Prediction**: ML-based compatibility analysis
- **Risk Assessment**: Probability scores and risk level indicators
- **Chemical Insights**: Detailed analysis summaries

---

## Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Netlify Deployment

This project is ready to deploy on Netlify as a Vite single-page app.

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20` via [`netlify.toml`](/home/bhargavi/alora/rx-companion/netlify.toml)

Set these environment variables in Netlify before the first production deploy:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_HF_API_URL`
- `VITE_APP_URL`

You can use [`/home/bhargavi/alora/rx-companion/.env.example`](/home/bhargavi/alora/rx-companion/.env.example) as the reference for the values and format.

---

## Project Structure

```
src/
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardHeader.tsx
│   │   ├── PredictionForm.tsx
│   │   └── PredictionResult.tsx
│   ├── AuthLayout.tsx           # Auth pages layout
│   ├── Logo.tsx                 # App branding
│   └── ProtectedRoute.tsx       # Route guard
├── context/
│   └── AuthContext.tsx          # Authentication state
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx
│   └── Dashboard.tsx
├── services/
│   ├── mockAuth.ts              # Mock auth service
│   └── predictionService.ts     # Prediction logic
└── types/
    └── index.ts                 # TypeScript interfaces
```

---

## Authentication Flow

1. **Signup**: User registers → Password hashed → Stored in localStorage → JWT returned
2. **Login**: Credentials verified → JWT generated → Used for protected routes
3. **Forgot Password**: Token generated → Logged to console (simulated email)

---

## Prediction API (Mock)

The prediction service simulates ML model responses:

- **Lactose Monohydrate**: Compatible (92.5%, LOW risk)
- **Microcrystalline Cellulose**: Compatible (88.3%, LOW risk)
- **Magnesium Stearate**: Non-Compatible (34.2%, HIGH risk)
- **PVP**: Compatible (85.7%, LOW risk)
- **Starch**: Compatible (78.9%, LOW risk)

Replace `src/services/predictionService.ts` with actual API calls to integrate a real ML model.

---

## Backend Implementation (Optional)

To add a real Node.js/Express backend:

1. Create a `backend/` folder with Express server
2. Use bcrypt for password hashing
3. Use JWT for session tokens
4. Use SQLite or JSON file for user storage
5. Update frontend services to call real API endpoints

---

## Technologies Used

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Shadcn UI (components)
- React Router (navigation)
- TanStack Query (data fetching)

---

## License

MIT License - For educational and research purposes.
