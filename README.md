# MASAR (مسار) — Interactive GPS Photomap & Travel Log Platform

**MASAR (مسار)** is a modern, high-performance web platform for mapping, preserving, and sharing journeys and travel routes with geotagged photo milestones. Built with bilingual support (Arabic RTL / English LTR), interactive Leaflet maps, automated EXIF GPS extraction, and a glassmorphism aesthetic.

---

## ✨ Features

- 🗺️ **Interactive Geographic Route Visualizer**: Dynamic Leaflet map with animated path segments, numbered milestone markers, popup thumbnails, and responsive viewport auto-fitting.
- 📸 **Smart EXIF Metadata Extraction**: Client-side automated extraction of GPS coordinates (latitude, longitude) and capture timestamps directly from uploaded JPEG/HEIC photos using a non-blocking background batch processor.
- 📍 **Drag-and-Drop Milestone Timeline**: Reorder, edit, annotate, or relocate waypoints with live visual updates.
- ⏱️ **Interactive Milestone Scrubber**: Visual progress scrubber strip allowing smooth keyboard (<kbd>◀</kbd> / <kbd>▶</kbd>) and click navigation through journey milestones.
- 🌍 **Full Bilingual & RTL Support**: Seamless Arabic (RTL) and English (LTR) localization across the whole platform including dynamic number formatting and directional controls.
- 🔔 **Frosted-Glass Notification & Dialog System**: Centralized Toast notifications and accessible confirmation modals replacing disruptive browser alerts.
- 📌 **Persistent Bookmarking**: Save favourite journeys locally with instant cross-tab synchronization.
- 🛡️ **Role-Based Moderation & Admin Dashboard**: Complete administrative dashboard with audit logs, status workflows (Approved/Pending/Rejected), and visibility toggles.
- 🔒 **Secure Authorization-Guarded Media Streaming**: Binary file storage architecture serving authenticated media via dedicated API endpoints.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Mapping**: Leaflet + React-Leaflet
- **Database & ORM**: PostgreSQL / SQLite + Prisma ORM
- **Authentication**: Better-Auth + Google OAuth
- **EXIF Extraction**: Exifr
- **Icons & UI**: Lucide React + Canvas Confetti
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables, Glassmorphism)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Almadih/masar.git
cd masar

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
DATABASE_URL="file:./dev.db" # or postgresql://postgres:password@localhost:5432/masar
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup & Seeding
```bash
# Run Prisma migrations / push schema
npx prisma db push

# Seed initial demonstration journeys
npm run db:seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is licensed under the MIT License.
