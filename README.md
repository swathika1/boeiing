# Boeing CertX - Real-time Aerospace Certification Pipeline

A production-grade aerospace certification dashboard that simulates FAA certification workflows in real-time.

## 🚀 Quick Start

```bash
npm install && npm run dev
```

The application will start at `http://localhost:5173`

## 📋 Features

- **Real-time Pipeline Visualization**: Watch agents move through 7 certification stages
- **Live Activity Log**: Streaming logs of all certification events
- **Document Verification Dashboard**: 150+ requirements with status tracking
- **Performance Metrics**: Real-time KPIs including verification percentage, time-to-cert, and risk level
- **Certification Package Generation**: One-click FAA package export with success animation
- **Interactive Details Panel**: Deep-dive into individual requirements and documents

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion 10
- **Icons**: Lucide React
- **No Backend Required**: Full client-side simulation

## 🏗️ Architecture

- **App.jsx**: Main dashboard component with all features
- **Metric Cards**: KPI visualization with gradient backgrounds
- **Pipeline Stages**: Real-time status indicators with animated agent nodes
- **Activity Log**: Streaming log panel with auto-scroll
- **Requirement Table**: Interactive table with side panel details
- **Generation Modal**: Success visualization with confetti animation

## 📊 Mock Data

- 150 CFR requirements
- Real-time status transitions
- Simulated document processing
- Fake PDF references and compliance values
- Live pipeline activity every 1-2 seconds

## 🎨 Design Features

- Enterprise SaaS aesthetic
- Minimal, professional styling
- Color-coded status indicators:
  - 🟢 Green: Verified
  - 🟡 Yellow: Processing
  - 🔴 Red: Missing/Error
  - 🔵 Blue: Active
- Smooth Framer Motion animations
- Responsive grid layouts

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 📄 License

MIT
