# BackRide Setup Instructions

## 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named "BackRide".
3. **Authentication**: 
   - Enable "Google" sign-in provider.
   - Enable "Phone" sign-in provider (requires a dummy number for testing or actual phone setup).
4. **Firestore Database**:
   - Create a database in "Production" or "Test" mode.
   - Start in Test mode for development.
5. **Storage**:
   - Enable Firebase Storage to allow driver license uploads.
6. **Project Settings**:
   - Register a Web App.
   - Copy the `firebaseConfig` and paste it into `src/lib/firebase.ts`.

## 2. Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Distance Matrix API
4. Create an API Key in "Credentials".
5. Restrict the key if necessary for production.
6. Use this key in your application (Environment variables recommended).

## 3. Razorpay Integration
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Sign up and go to "Settings" > "API Keys".
3. Generate "Test" keys.
4. Add the Razorpay script to your `index.html`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

## 4. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```
