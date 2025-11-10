# 💬 SDR-MT – WhatsApp Leads Dashboard

> A complete web dashboard for analyzing WhatsApp leads, messages, and performance metrics — powered by **React**, **Supabase**, and **n8n** automation.

---

## 🚀 Overview

**SDR-MT** is a modern dashboard built for SDR and sales teams to track leads, visualize chat data, and analyze conversion performance from WhatsApp interactions.  
It integrates seamlessly with **Supabase** (database + auth) and **n8n** (workflow automation) to automate data collection, message analysis, and meeting scheduling.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | ⚛️ React + TypeScript + Vite |
| Styling | 🎨 TailwindCSS + shadcn/ui |
| Backend | 🛢️ Supabase (PostgreSQL + Auth) |
| Automation | 🤖 n8n workflows |
| Charts | 📊 Recharts |
| Package Manager | 🧶 Bun / npm |
| Deployment | ☁️ Netlify / Vercel (compatible) |

---

## ✨ Features

- 📈 **Lead Analytics Dashboard** – view metrics, conversion rates, and message volume.
- 💬 **Chat History Viewer** – access full conversation threads stored in Supabase.
- 📊 **Dynamic Charts** – visualize engagement, message frequency, and response times.
- 🔐 **Protected Routes** – secure login and session management.
- 🔄 **n8n Integration** – automate lead updates, message sync, and calendar scheduling.
- 🧱 **SQL Setup Scripts** – ready-to-run scripts to build your database schema.
- ⚙️ **Configurable Environment** – easily switch Supabase keys and API URLs via `.env`.

---

## 🗂️ Project Structure

```
SDR-MT-main/
├── public/                 # Static assets (logos, icons, redirects)
├── src/
│   ├── assets/             # App images and icons
│   ├── components/
│   │   ├── dashboard/      # Main dashboard sections (charts, tables, metrics)
│   │   └── ui/             # UI primitives (buttons, cards, inputs)
│   ├── App.tsx             # App entry and routes
│   ├── main.tsx            # React + Vite mount point
│   └── index.css           # Global styles
├── .env                    # Environment variables (Supabase keys, API URLs)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Build and dev configuration
└── SQL scripts/            # Database and sample data setup
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/SDR-MT.git
cd SDR-MT-main
```

### 2️⃣ Install dependencies
Using **Bun**:
```bash
bun install
```

Or **npm**:
```bash
npm install
```

### 3️⃣ Create your `.env` file
Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4️⃣ Run the development server
```bash
bun dev
# or
npm run dev
```

Your app will be running at **http://localhost:5173**

---

## 🧠 Database Setup (Supabase)

Run the SQL scripts inside Supabase SQL Editor:

1. `setup-conversation-analysis.sql` → create core tables  
2. `safe-insert-leads.sql` → define insert procedures  
3. `insert-sample-data.sql` → insert test leads  
4. `fix_supabase_policies.sql` → ensure proper access control  

---

## 🤖 n8n Integration

- Import `n8n-workflow-example.json` into your n8n instance.  
- Connect nodes for:
  - Supabase → insert/update leads  
  - WhatsApp API → capture new messages  
  - Google Calendar → schedule meetings  

📘 For step-by-step instructions, see `n8n-supabase-integration-guide.md`.

---

## 🧱 SQL Scripts Included

| File | Purpose |
|------|----------|
| `create-realistic-leads-data.sql` | Generate sample leads |
| `fix-leads-data.sql` | Clean and normalize data |
| `check-table-structure.sql` | Verify schema consistency |
| `insert-sample-analysis-data.sql` | Insert example analytics |
| `setup-conversation-analysis.sql` | Create conversation tables |

---

## 🧑‍💻 Development Tips

- Use **Vite** hot reload for fast iteration.  
- All UI components follow **shadcn/ui** conventions.  
- Modify chart logic in `ChartsSection.tsx`.  
- Extend Supabase queries in `LeadsTable.tsx`.  
- Authentication and route protection are handled in `ProtectedRoute.tsx`.

---

## 🛠️ Scripts

| Command | Description |
|----------|-------------|
| `bun dev` / `npm run dev` | Start dev server |
| `bun build` / `npm run build` | Build for production |
| `bun lint` / `npm run lint` | Lint TypeScript code |

---

## 🧭 Roadmap

- [ ] Add advanced conversation sentiment analysis  
- [ ] Export reports to CSV / PDF  
- [ ] Implement dark mode toggle  
- [ ] Integrate live message updates via WebSocket  
- [ ] Add user roles (Admin / SDR)

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 💡 Author

Built with ❤️ by **Artur Tnk** and contributors.  
Feel free to reach out for collaboration or feature requests!
