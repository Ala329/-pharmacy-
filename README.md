# PharmaTrust: AI-Blockchain Pharmaceutical Supply Chain

PharmaTrust is a cutting-edge pharmaceutical supply chain tracking system designed to combat counterfeit medicines and optimize inventory logistics using Blockchain and Artificial Intelligence.

## 🚀 Presentation Mode
For the live presentation, follow these steps:
1. **Register** a new account (Manufacturer or Pharmacist role highly recommended for first view).
2. Scroll to the **Footer** and click **"SEED PRESENTATION DATA"**.
3. The page will reload with active batches, inventory, and ledger history.
4. Go to the **Pharmacist Dashboard** and click **"Generate Prediction"** to activate the AI Forecaster.

## 🛠 Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion.
- **Backend / Database**: Firebase (Auth, Firestore).
- **Blockchain**: Simulated Immutable Ledger (Logic verified via Firestore Rules) + Solidity Reference Contract.
- **AI**: Google Gemini (Direct integration via `@google/genai`) for Time-Series Stock Prediction.
- **Visualization**: Recharts.

## 🏗 System Architecture
- **/contracts**: Contains the Solidity Smart Contract (`PharmaTrust.sol`) defining roles and transfer logic.
- **/src/lib/blockchainService.ts**: A service layer that emulates blockchain immutability using single-write Firestore operations and cryptographic-style hashing.
- **/src/lib/aiService.ts**: Intelligent inventory forecaster that analyzes depletion rates using Gemini.

## 👤 User Roles
- **Manufacturer**: Mints new medicine batches, generates unique QR codes, and reviews production history.
- **Distributor**: Manages the logistics of batches, transferring custody from factory to retail points.
- **Pharmacist**: Monitors stock levels, identifies low-quantity alerts, and uses AI to predict when medicines will run out.
- **Patient / Public**: Simple "Track" interface to verify if a medicine batch ID is authentic or counterfeit by checking the global ledger.

## 🚦 How to Run
1. Ensure all dependencies are installed: `npm install`.
2. Start the dev server: `npm run dev`.
3. Open `http://localhost:3000`.

## 🔒 Security
- **Immutable Ledger**: The `/ledger` collection in Firestore is restricted by rules that forbid `update` and `delete` operations, mimicking a blockchain state.
- **Relational Integrity**: Security rules verify that only the current "Owner" of a batch can initiate a transfer.
