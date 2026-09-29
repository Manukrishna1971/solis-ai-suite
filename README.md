# ✨ Solis AI — Next-Gen Real-Time Vision & Recognition Suite

<div align="center">

```
  ███████╗ ██████╗ ██╗     ██╗███████╗     █████╗ ██╗
  ██╔════╝██╔═══██╗██║     ██║██╔════╝    ██╔══██╗██║
  ███████╗██║   ██║██║     ██║███████╗    ███████║██║
  ╚════██║██║   ██║██║     ██║╚════██║    ██╔══██║██║
  ███████║╚██████╔╝███████╗██║███████║    ██║  ██║██║
  ╚══════╝ ╚═════╝ ╚══════╝╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝
```

**An edge-native, real-time computer vision engine and luxury AI interface.**  
*Instant client-side object recognition, biometric emotion detection, hand gesture tracking, and adaptive low-light enhancement.*

[![Live on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![React 19](https://img.shields.io/badge/React-19.x-2C5745?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-EB7D00?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Client--Side-EBE3A7?style=for-the-badge&logo=tensorflow&logoColor=2E2910)](https://www.tensorflow.org/js)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🎨 Luxury Aesthetic & Design Philosophy

Solis AI is designed with an exclusive haute-tech dark luxury palette:

| Hue | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Tangerine** | `#EB7D00` | Energetic accents, glowing detection reticles, action buttons, velocity vectors |
| **Vanilla** | `#EBE3A7` | High-contrast typography, verified face & emotion tags, glass card borders |
| **Brunswick Green** | `#2C5745` | Primary UI surfaces, depth gradients, biometric person boundaries |
| **Dark Brown** | `#2E2910` | Obsidian foundational background, ambient glow meshes, luxury shadow base |

---

## 🚀 Key Capabilities

### 1. ⚡ Optimistic Zero-Lag Vision HUD (30–60 FPS)
- **Zero dragging or stutter**: Decoupled asynchronous inference loop ensures the camera overlay renders at true display refresh rates.
- **Snappy Coordinate Tracking (`alpha = 0.85`)**: Instantaneous bounding box response without sluggish interpolation lag.
- **Non-Maximum Suppression (NMS)**: Eliminates box collisions and duplicate ghost boundaries when multiple objects appear simultaneously.

### 2. 📱 True Object Recognition
- Real-world everyday objects detected accurately with exact labels:
  - **Smartphones / Mobile Devices**
  - **Eyeglasses / Specs**
  - **Pens / Writing Instruments**
  - **Cars & Bikes / Vehicles**
  - **Ironbox / Household Appliances**
  - **Bottles, Cups, Laptops, Keyboards, Backpacks**, and more.

### 3. 👤 Strict Biometric Face Verification & Emotion Analysis
- **Zero Phantom Faces**: Unlike naive models that label chairs or shadows as faces, Solis AI enforces a multi-stage verification gate:
  - **Skin-Chroma Density Analysis**: Rejects solid walls, textiles, and empty rooms.
  - **Bilateral Eye Depressions**: Verifies anatomical facial symmetry before emitting a detection box.
- **Micro-Expression Emotion Classification**: Fine-tuned estimation across `Joy / Happy`, `Focused / Neutral`, `Surprise`, and `Pensive / Sad`.

### 4. ✋ Real-Time Hand Movement & Gesture Engine
- Tracks hand gestures with spatial directional awareness:
  - `Wave 👋` (rapid horizontal oscillation)
  - `Open Palm ✋` (high finger extension ratio)
  - `Thumbs Up 👍` (upward thumb vector)
  - `Pointing ☝️` (isolated index finger trajectory)
  - `Victory ✌️` (dual finger V-spread)
- Displays **velocity vectors** indicating real-time motion speed and direction.

### 5. 🌙 Adaptive Low-Light Computer Vision
- Built-in OpenCV-inspired preprocessor performing **adaptive histogram equalization** and **gamma contrast lifting** on dark or grainy camera feeds.

### 6. 🧠 Instant On-Device Custom Object Training
- Integrated **KNN Classifier** paired with **MobileNet** feature embeddings.
- Point any physical item at the lens, click **Capture Samples**, and teach the AI custom classes in under 3 seconds—stored locally in browser memory.

### 7. 🔒 100% Edge-Private & Serverless
- Every neural network weight executes strictly on client hardware via **WebGL acceleration**.
- **No video frames, camera data, or images are ever transmitted to external servers**.

---

## 📂 Project Structure

```bash
solis-ai-suite/
├── public/                 # Favicon and static SVG icons
├── src/
│   ├── components/
│   │   ├── RealWebcamView.tsx         # 60 FPS live camera recognition HUD
│   │   ├── RealPhotoUploadView.tsx    # Drag-and-drop image analysis studio
│   │   ├── CustomTrainerModal.tsx     # Teachable AI KNN object training modal
│   │   ├── AmbientBackground.tsx      # Multi-layered dark luxury glow gradients
│   │   └── FloatingNavbar.tsx         # Minimalist luxury status navigation
│   ├── utils/
│   │   ├── realVisionDetector.ts      # CV core: COCO-SSD, MobileNet, KNN, Face Gate, Gestures
│   │   └── audioFX.ts                 # Tactile acoustic UI feedback
│   ├── App.tsx                        # Minimal 2-mode vision application container
│   ├── index.css                      # Luxury CSS variables & Tailwind directives
│   └── main.tsx                       # React application entrypoint
├── vercel.json             # Vercel deployment & SPA routing configuration
├── tailwind.config.js      # Palette tokens & luxury glow utility extensions
├── vite.config.ts          # Vite build pipeline & bundle chunking
└── package.json
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manukrishna1971/solis-ai-suite.git
   cd solis-ai-suite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚀 Live Deployment on Vercel

This repository includes a native [`vercel.json`](./vercel.json) ready for 1-click zero-config deployment:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `Manukrishna1971/solis-ai-suite`.
3. Keep default settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

## 📄 License

Distributed under the **MIT License**. Free for personal and commercial use.
