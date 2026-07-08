# Lotchain Frontend 🎟️✨

Welcome to the frontend application of **Lotchain**, a premium, decentralized, and auditable smart contract lottery application. This web interface is built using **React**, **Vite**, **Ethers.js (v6)**, and custom CSS styling designed for a sleek *Dark & Gold* modern aesthetic.

The application leverages **Chainlink VRF v2.5** to guarantee cryptographically secure and tamper-proof random numbers for drawing winners, and integrates **ChangeNOW** widget dynamics for smooth fiat/crypto onboarding.

---

## 🔗 Related Repositories & Resources

- **Smart Contract Backend:** [vrf-lotto](https://github.com/ralexandrec/vrf-lotto)
  - Codebase containing the Solidity smart contracts, Hardhat scripts, deployment setups, and test coverage for the backend lottery.
- **Contract Address (Base Sepolia):** `0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F`
- **Owner Address:** `0xc545124FA9704BA2eC880e3E5A141eBb6bE98B41`

---

## ✨ Features

- **Web3 Wallet Connection:** Integrated MetaMask connection with dynamic chain detection.
- **Automated Network Switch:** Automatically adds and prompts the user to switch to the **Base Sepolia** testnet.
- **Dynamic Onboarding Wizard (Bet Assistant):**
  - **Step 1:** Wallet connection trigger.
  - **Step 2:** Interactive Faucets list (Base Sepolia) or ChangeNOW Widget (Base Mainnet) based on the current chain configuration, helping users acquire ETH easily.
  - **Step 3:** Dynamic Ticket purchasing interface.
- **Real-Time Synchronized State:** Dynamic polling (10s intervals) and event listeners for real-time pool, player counts, state updates, and congratulations triggers.
- **Activity Log Console:** Inline visual logging console monitoring transaction statuses and block events.
- **Admin Dashboard (Dynamic):** Visible exclusively to the Smart Contract owner wallet, letting the admin trigger the draw (`sortearVencedor()`) directly from the web interface.
- **Multi-language (i18n):** Lightweight, reactive translations in Portuguese (PT) and English (EN).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) installed.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/ralexandrec/vrf-lotto-frontend.git
cd vrf-lotto-frontend
npm install
```

### 3. Run Locally
Start the development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
To bundle the static application assets:
```bash
npm run build
```
The output files will be built inside the `/dist` directory. Due to relative asset base config, they can be served from any subdirectory or cloud S3/GCS bucket.

---

## 🧪 Testing

The repository includes behavior-driven E2E tests built on **Cucumber**, **Playwright**, and **Chai** to validate Web3 wallet states, Dynamic translations, and Smart Contract mock inputs.

To run the test suite:
```bash
npx cucumber-js
```

---

## 🌍 GitHub Pages Deployment

The repository comes pre-packaged with a GitHub Actions workflow in `.github/workflows/deploy.yml` that handles automatic compilation and deployment to GitHub Pages.

To activate the automatic deployment:
1. Push the code to your GitHub Repository: `vrf-lotto-frontend`.
2. Go to **Settings -> Pages** on your GitHub repository.
3. Under **Build and deployment -> Source**, select **GitHub Actions**.
4. Every push to the `main` or `master` branch will trigger an automated build and deploy.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
