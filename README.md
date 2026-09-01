# KISHAN BHAI (किसान भाई)
> **"Small Farms. One Powerful Network."**  
> *An AI-Powered Digital Agriculture Platform & Virtual Farm Cluster Network with Genuine x402 Algorand Testnet Micropayments.*

---

## 🏆 Hackathon Track: "Agentic Solutions: Powered by x402"

Kishan Bhai is built specifically for the **Agentic Solutions: Powered by x402** competition track. It demonstrates how autonomous AI agents, Virtual Farm Clusters, and Web3 micropayment rails solve the deep structural challenges of smallholder farming in India.

### ⚡ Genuine Protocol & Blockchain Integrations
- **x402 Protocol Specification**: Implements genuine HTTP `402 Payment Required` handshakes for high-value agronomy services.
- **Algorand Testnet**: Executes authentic on-chain transactions signed against the Algorand Testnet node.
- **GoPlausible Facilitator Integration**: Validates transaction non-replay and cryptographic finality via the GoPlausible verification pipeline.
- **No Mock Transactions**: Zero simulated transaction hashes or fake timers; every settlement links to Algorand Testnet block explorers (Lora / Pera).

---

## 🌟 Core Philosophy: Virtual Farm Clusters

> *"We don't combine farmers' land. We combine their digital strength."*

Smallholder farmers (averaging 2–5 acres) face severe economic disadvantages:
1. **Retail Markup**: High retail prices on seeds & fertilizers due to small volume.
2. **Middlemen Squeeze**: Selling small yields individually at local mandis results in 15–30% value loss.
3. **Expensive Agronomy**: Commercial laboratory pathogen diagnostics cost ₹500–₹1,500 per sample.

### How Kishan Bhai Solves This
- **Virtual Farm Clusters**: Farmers maintain 100% legal ownership of their land while digitally aggregating input demands and harvest output.
- **Bulk Buying Demands**: Champions consolidate fertilizer and certified seed orders, unlocking 20–30% wholesale discounts directly from manufacturers.
- **Harvest Pooling**: Yields are aggregated into standardized 10–50 ton lots for institutional buyers and food processors.
- **x402 AI Micropayments**: Farmers pay ₹0.15 to ₹0.40 (0.002 USDC) strictly per deep multispectral crop disease diagnosis, powered by Gemini 3.7 Flash.

---

## 👥 Four Stakeholder Roles & Interfaces

1. **Smallholder Farmer (Ramesh Patel - 4.5 Acres)**
   - Farm acreage & crop profile management
   - Join Virtual Farm Clusters
   - Pledge for bulk input discounts (fertilizers, seeds)
   - Trigger AI Crop Multispectral Pathogen Diagnostics via x402
   - Web NFC Smart Card identification for village mandi check-in

2. **Village Champion (Anita Devi - Village Coordinator)**
   - Manage regional Virtual Farm Clusters
   - Verify smallholder land holdings and KYC
   - Aggregate group purchase orders and coordinate manufacturer delivery
   - Dispatch shared village machinery (tractors, drone sprayers)

3. **Institutional Buyer (Vikram Mehta - AgroPure Organics)**
   - Browse standardized 10–50 ton aggregated harvest lots
   - Submit binding purchase proposals with designated delivery depots
   - Trace lot origin directly to verified cluster farmers

4. **Platform Administrator & Ops (Dr. Sanjay Verma)**
   - Live x402 Protocol telemetry & GoPlausible Facilitator logs
   - Algorand Testnet node synchronization monitor
   - API Budget Ceiling Monitor (Strict ₹1,500 monthly limit with caching savings)

---

## 🔄 End-to-End x402 Payment Flow Walkthrough

```
[ Frontend Client ]                                      [ Backend Gateway ]                        [ Algorand Node / GoPlausible ]
       │                                                         │                                                │
       │─── 1. POST /api/paid/crop-analysis (No Payment) ───────>│                                                │
       │                                                         │                                                │
       │<── 2. HTTP 402 Payment Required ────────────────────────│                                                │
       │    { price: 0.002 USDC, receiver: "KBHAI4O4...",        │                                                │
       │      service: "Crop Pathogen Analysis", ... }           │                                                │
       │                                                         │                                                │
       │─── 3. Sign & Submit Testnet Payment ────────────────────────────────────────────────────────────────────>│
       │       (or trigger backend testnet execution)            │                                                │
       │                                                         │                                                │
       │<── 4. Algorand Confirmed (TxID: 7K9X2M...) ─────────────────────────────────────────────────────────────│
       │                                                         │                                                │
       │─── 5. POST /api/paid/crop-analysis ────────────────────>│                                                │
       │       Header: `X-PAYMENT: 7K9X2M...`                    │                                                │
       │                                                         │─── 6. Verify Tx on Algorand / GoPlausible ────>│
       │                                                         │<── 7. Cryptographic Proof Validated ───────────│
       │                                                         │                                                │
       │<── 8. HTTP 200 OK with Gemini Agronomist Diagnosis ─────│                                                │
```

---

## 💰 Autonomous API Budget Guard (₹1,500 Monthly Limit)

To ensure zero budget overruns:
- Strict ₹1,500/month maximum API expenditure ceiling.
- Token-efficient prompt engineering using Gemini 3.7 Flash.
- In-memory cache layer for weather queries and repeated agricultural lookups.
- Real-time dashboard showing INR expenditure breakdown and percentage utilized.

---

## 🧪 Testing the Live Demo

1. **Switch Roles**: Use the top-right persona dropdown to switch between Farmer, Champion, Buyer, and Admin.
2. **Test x402 AI Diagnosis**:
   - Open **Kishan AI & Crop Diagnosis** from the sidebar or dashboard.
   - Click the green button **"🔬 1-Click Sample Leaf Disease Diagnosis (0.002 USDC)"** or upload a crop photo.
   - Observe the **HTTP 402 Challenge** and Algorand Testnet settlement modal.
   - Review the generated **Multispectral Pathogen Report** and verified Algorand Testnet Tx ID.
3. **Verify Ledger**:
   - Navigate to **x402 Transactions** or **x402 Protocol Analytics** to inspect on-chain records and Explorer links.
4. **Explore Clusters & Bulk Buying**:
   - Open **My Virtual Cluster** to see the interactive coordination diagram.
   - Pledge fertilizer bags in **Bulk Buying Demands** to watch the cluster progress bar update in real-time.
