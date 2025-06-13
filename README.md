# XRPL Toolkit

## Preamble

Financing through generic events (used by DeSci or course a pied (vainquer en ligne))

Crowd founding
Impl xaman or found wallet
XRP Domain
XNS Names (the best)

DID (Fractal ID)

Why blockchain?!
Is it useful for a domain?
Will people participate?

Concept:
- A party that supports a cause (charity, funding, grant for DeSci) so it creates a Xamman address to receive the fonts (We need to find a way to make the use of the fonts for the cause reliable).
- An entity that creates an event and chooses to support a cause (at a certain threshold or completely)
- Participants who, by paying for services (tickets, consumption, etc.), finance the reimbursement (consumption, venue rent, etc.), the networking service (us), and the rest to the cause.
Challenge:
- make the parties reliable (DID)
- Find and apply integrations (sport, DeSci...)
- Ticketing (NFT)
- Dispatching fonts (multiple escrow)

This project is a React + Vite application that integrates:

* **OAuth2 PKCE authentication** via Xumm/Xaman (using `xumm-oauth2-pkce`)
* **Wallet operations** on the XRP Ledger (connect, balance, payments, NFT mint, escrow) via `xrpl.js` and Xumm SDK
* **Decentralized Identity (DID)** flows (KYC, DID issuance & verification) via Fractal ID

---

## 🚀 Setup & Run

1. **Clone & install**

   ```bash
   git clone <repo>
   cd <repo>
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file at the project root with:

   ```ini
   VITE_XUMM_API_KEY=your_xumm_pkce_api_key
   VITE_FRACTAL_API_BASE=https://sandbox.fractal.id/api   # or your Fractal endpoint
   VITE_FRACTAL_API_KEY=your_fractal_sandbox_key
   ```

3. **Generate local HTTPS certs (optional but recommended)**

   ```bash
   mkcert -install
   mkcert localhost
   ```

   Place `localhost.pem` & `localhost-key.pem` at project root and enable in `vite.config.ts`.

4. **Run in dev**

   ```bash
   npm run dev
   ```

   Open `https://localhost:3000`

---

## 📂 Project Structure

```
src/
├─ contexts/
│  ├ AuthContext.tsx   # Xumm PKCE flow
│  ├ WalletContext.tsx # XRPL wallet (connect, balance, payment, mint, escrow)
│  └ DIDContext.tsx    # Fractal ID hooks (useFractalKYC, useFractalDID, useFractalVerify)
│
├─ components/
│  ├ Navbar.tsx        # Responsive navigation & auth/wallet UI
│  └ DIDModal.tsx      # Modal for KYC → DID issuance → verification → login
│
├─ App.tsx             # Compose AuthProvider, WalletProvider, Router
└─ main.tsx            # Vite entry
```

---

## 🔑 Key Hooks & Contexts

### AuthContext

* **useAuth()**: provides `sdk`, `authorize()`, `logout()`, `user`, `updateUser`.
* Manages Xumm PKCE flow and stores user in `localStorage`.

### WalletContext

* **useWallet()**: provides `connectWallet()`, `balance`, `sendPayment()`, `mintNFT()`, `createEscrow()`.
* Initializes `xrpl.js` client on Testnet/Mainnet.

### DIDContext (Fractal ID)

* **useFractalKYC()**: start KYC → poll for status.
* **useFractalDID()**: fetch VC URI → issue/update DID on XRPL via Xumm.
* **useFractalVerify()**: verify the DID's credential.

---

## 🛠 Components

### Navbar

* Shows navigation links
* Buttons for **Connect DID**, **Connect Wallet**, **Dashboard**, **Logout**
* Mobile + desktop responsive UI using Tailwind & Lucide icons.

### DIDModal

* Step 1: **KYC** via Fractal (opens new tab)
* Step 2: **Issue DID** on XRPL (Xumm popup)
* Step 3: **Verify DID** credential
* Step 4: **Complete** → logs user in (stores DID)

---

## 🔄 Next Steps

* **Backend separation**: move all Fractal & Xumm secret calls to a secure server.
* **Network switch**: allow toggling between XRPL Testnet and Mainnet.
* **Error handling**: surface more detailed errors in the UI.
* **Unit tests**: add Jest/Testing Library tests for hooks and modals.

---

*This project leverages XRPL Labs SDKs and Fractal ID APIs to provide a seamless Web3 authentication and identity experience.*
