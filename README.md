# SkillShare – A Skill-Based Hiring Platform

SkillShare is a modern, skill-based hiring marketplace built for Bangladesh. Skilled freelancers showcase their portfolios, apply for tasks, and get paid in Bangladeshi Taka (৳) through bKash, Nagad, and local banks. Hirers post jobs and deposit funds safely into escrow protection.

---

## 🚀 Key Features

1. **Dual-Role Switching**: Any user can seamlessly switch between **Freelancer Mode** (showcasing services, bidding on jobs, managing deliverables, withdrawing earnings) and **Client Mode** (posting jobs, comparing proposals, managing contracts, approving deliveries).
2. **Escrow Payment Security (Simulated)**: 
   - Clients fund milestones using bKash, Nagad, Rocket, or Bank Card into escrow.
   - Freelancers work with guaranteed payment.
   - Clients inspect deliverables before approving payout release.
   - Platform commission (10%, configurable by Admin) is automatically calculated and transferred.
3. **AI-Powered Capabilities (Gemini API)**:
   - **AI Skill Matcher**: Analyzes job descriptions and recommends the top 3 best matching candidates with match scores and contextual reasoning.
   - **AI Proposal Writer**: Empowers freelancers to generate personalized, tailored cover letters in seconds.
4. **Local Bengali Context**:
   - Currency: Bangladeshi Taka (`৳`)
   - Date format: `DD MMM YYYY`
   - Language toggle: English / বাংলা
   - Withdrawal options: bKash, Nagad, Bank transfer
5. **Real-Time Collaboration**: One-to-one instant messaging with deliverable file sharing and contract linkages.
6. **Admin Panel (`/admin`)**:
   - Platform analytics & growth charts (Recharts)
   - User suspension, verification badges, and role moderation
   - Job & Service moderation
   - Escrow dispute resolution
   - Withdrawal request review & payouts
   - Platform commission adjustment & site announcements

---

## 🔑 Demo Login Credentials

For quick evaluation, click the **"Demo Accounts"** button in the top navigation bar, or log in with:

| Role | Email | Password | What to Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skillshare.com` | `Admin@123` | Access `/admin`, commission rate controls, analytics, user bans, withdrawal approvals |
| **Freelancer** | `tanvir.dev@skillshare.demo` | `Any password` | Active orders, deliver work, submit AI proposals, withdraw to bKash |
| **Client** | `saadman@dhakatech.demo` | `Any password` | Post a job, review proposals, pay escrow via bKash/Nagad, approve deliverables |

---

## 📂 Project Structure

```
/
├── firebase-applet-config.json # Firebase connection config
├── firebase-blueprint.json    # Data models and collection schemas
├── firestore.rules            # ABAC/RBAC Firestore security rules
├── src/
│   ├── types/
│   │   └── index.ts           # Core TypeScript interfaces (User, Job, Order, Profile, etc.)
│   ├── utils/
│   │   ├── escrow.ts          # Pure escrow calculations & order state machine
│   │   ├── formatters.ts      # BDT currency, date, and profile completion helpers
│   │   ├── matching.ts        # Deterministic keyword skill matching
│   │   ├── translations.ts    # English & Bengali language dictionary
│   │   └── logic.test.ts      # node:test unit tests
│   ├── lib/
│   │   ├── firebase.ts        # Firebase Firestore & Auth initialization
│   │   └── gemini.ts          # @google/genai Gemini API integration
│   ├── data/
│   │   └── seedData.ts        # Pre-seeded 8 categories, 5 freelancers, 3 clients, 10 services, 6 jobs
│   ├── context/
│   │   ├── AuthContext.tsx    # User sessions, Google auth, role switching
│   │   ├── DataContext.tsx    # Real-time state & mutations for jobs, orders, escrow
│   │   └── ThemeLanguageContext.tsx # Dark mode and language toggles
│   ├── components/
│   │   ├── Navbar.tsx         # Responsive navbar with role switcher and demo picker
│   │   ├── Footer.tsx         # Local trust footer
│   │   ├── RatingStars.tsx    # Interactive 5-star ratings
│   │   ├── EscrowPaymentModal.tsx # Simulated bKash/Nagad escrow checkout
│   │   ├── AIProposalModal.tsx    # AI-assisted proposal modal
│   │   ├── DeliverWorkModal.tsx   # Freelancer delivery submission
│   │   ├── ReviewModal.tsx        # Post-order rating & reviews
│   │   ├── WithdrawModal.tsx      # bKash, Nagad, Bank withdrawal requests
│   │   └── ProtectedRoute.tsx     # Route protection & Admin gate
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── BrowseFreelancersPage.tsx
│   │   ├── BrowseJobsPage.tsx
│   │   ├── JobDetailPage.tsx
│   │   ├── FreelancerProfilePage.tsx
│   │   ├── ServiceDetailPage.tsx
│   │   ├── PostJobPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── AdminPanelPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── App.tsx                # App routing & provider root
│   └── main.tsx
```
