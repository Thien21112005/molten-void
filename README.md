<div align="center">

# ☄️ Molten Void

**A Physics Slingshot Puzzle Web Game**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

[Live Demo](https://thien21112005.github.io/molten-void/) • [Bug Report](https://github.com/Thien21112005/molten-void/issues) • [Feature Request](https://github.com/Thien21112005/molten-void/issues)

<br/>

**[English](#english)** • **[Tiếng Việt](#tiếng-việt)**

</div>

---

<a name="english"></a>
## English

### Overview
**Molten Void** is an arcade-style, physics-driven slingshot puzzle web game built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **HTML5 Canvas**. 

Launch comet cores through deep space anomalies, bounce off cosmic barriers, shatter void crystals, and chain together score combos across a 15-expedition campaign roadmap. Features responsive touch-first controls and real-time procedural audio synthesis requiring zero external audio assets.

---

### Key Features

- **Tactile Slingshot Physics:** Drag, aim, tension-pull, and release comet cores with simulated gravity, bouncy collisions, velocity drag, and trajectory guidance.
- **15-Level Cosmic Campaign Roadmap:** Journey through 15 handcrafted levels with balanced difficulty progression, moving from gentle celestial curves to complex multi-bounce chambers.
- **3-Star Performance Rating:** Earn up to 3 stars per expedition based on shot efficiency and remaining cores in reserve, tracked directly on your campaign map.
- **Crystal Shatter & Combo Engine:** Smash through ice and gold crystals to trigger cascading combo multipliers, dynamic particle bursts, screenshake, and floating score indicators.
- **Procedural Web Audio Synth:** Zero MP3/WAV files required. Every launch hum, crystal chime, bounce thump, and level-clear sound is procedurally synthesized in real time using the native Web Audio API.
- **Cross-Platform Responsive Layout:** Full support for desktop browsers, tablets, and mobile devices with portrait/landscape auto-scaling and safe-area inset support.
- **Lightweight Single-File Bundle:** Built with Vite and `vite-plugin-singlefile`, packaging the entire application into a fast, self-contained bundle.
- **Local Progress Persistence:** Tracks and preserves unlocked levels, star achievements, and high scores via browser `localStorage`.

---

### Star Rating Criteria

Each level challenges you to shatter all crystals while conserving your precious Comet Cores:

| Rating | Visual Display | Qualification Rule |
| :--- | :--- | :--- |
| **⭐⭐⭐ 3 Stars** | 3 Bright Glowing Stars | **Perfect Efficiency:** Clear all crystals while retaining high core reserves (e.g., using only 1 shot or keeping maximum par cores). |
| **⭐⭐☆ 2 Stars** | 2 Bright Stars + 1 Dim Star | **Skilled Shot:** Clear all crystals with at least 1-2 spare cores remaining. |
| **⭐☆☆ 1 Star** | 1 Bright Star + 2 Dim Stars | **Expedition Cleared:** Successfully shatter all crystals, using the last available comet core. |

*Unlocking Progression:* Earning at least 1 star on any expedition automatically unlocks the next stage on the Cosmic Roadmap.

---

### Controls

| Action | Mouse / Touch | Keyboard |
| :--- | :--- | :--- |
| **Aim & Pull** | Drag backwards anywhere on screen | Arrow Up `↑` / Down `↓` (or `W` / `S`) to adjust pitch angle |
| **Fire Comet** | Release touch / mouse click | Hold `Space` to charge tension, release to fire |
| **Pause Game** | Tap Pause button in HUD | Press `P` or `Escape` |
| **Toggle Audio** | Tap Sound button | Press `M` |
| **Quick Restart**| Tap Restart button | Press `R` |

---

### Tech Stack

- **Core Framework:** [React 19](https://react.dev/) + [React DOM](https://react.dev/)
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/)
- **Bundler & Dev Server:** [Vite 7](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Rendering & Physics:** Custom 2D Canvas Engine (60+ FPS sub-step integration)
- **Audio:** Web Audio API Procedural Synthesizer
- **Distribution:** `vite-plugin-singlefile`

---

### Quick Start

#### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm, pnpm, or yarn

#### 1. Clone repository
```bash
git clone https://github.com/Thien21112005/molten-void.git
cd molten-void
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Run development server
```bash
npm run dev
```

#### 4. Build production bundle
```bash
npm run build
```
The output single-file bundle will be generated in the `dist/` directory.

---

### Project Structure

```text
molten-void/
├── .github/
│   ├── ISSUE_TEMPLATE/       # GitHub issue forms (Bug report, Feature request)
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages CI/CD
├── src/
│   ├── components/
│   │   ├── RoadmapModal.tsx  # 15-level campaign map & progression modal
│   │   ├── StarRating.tsx    # 3-star graphic component (bright vs dim stars)
│   │   └── VictoryModal.tsx  # Level clear celebration & score summary modal
│   ├── game/
│   │   ├── levels/
│   │   │   ├── levelsData.ts # 15 handcrafted level datasets & obstacle coordinates
│   │   │   ├── progress.ts   # LocalStorage persistence for stars & unlock state
│   │   │   └── types.ts      # Level configuration & player record interfaces
│   │   ├── audio.ts          # Procedural Web Audio synth engine
│   │   └── engine.ts         # Canvas 2D physics, collision & particle engine
│   ├── utils/
│   │   └── cn.ts             # Tailwind class merging utility
│   ├── App.tsx               # UI overlay, HUD, menus & game loop bridge
│   ├── index.css             # Tailwind v4 theme & global styles
│   └── main.tsx              # React application entry point
├── index.html                # HTML5 root with custom typography
├── package.json              # Project dependencies & metadata
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration with single-file plugin
```

<br/>

---

<a name="tiếng-việt"></a>
## Tiếng Việt

### Giới thiệu
**Molten Void** là một tựa game giải đố vật lý (Physics Slingshot Puzzler) nền web với phong cách không gian vũ trụ, được phát triển bằng **React 19**, **TypeScript**, **Tailwind CSS v4** và **HTML5 Canvas**.

Nhiệm vụ của người chơi là căn chỉnh góc bắn, kéo lực và phóng các lõi sao chổi (*comet cores*) để nảy qua các chướng ngại vật, phá hủy toàn bộ tinh thể năng lượng (*crystals*) và mở khóa chuỗi 15 màn chơi kỳ thú trên bản đồ viễn chinh (Cosmic Roadmap).

---

### Tính năng nổi bật

- **Cơ chế vật lý kéo-bắn (Slingshot) mượt mà:** Cảm giác kéo lực nhạy, đường bay dự đoán trực quan, mô phỏng trọng lực và phản xạ va chạm chính xác.
- **Bản đồ 15 màn chơi (Roadmap):** 15 màn chơi được thiết kế thủ công với độ khó tăng dần đều đặn, từ đường bay vòng cung rộng rãi mở đầu đến các mê cung phản xạ tinh tế ở các màn sau.
- **Hệ thống đánh giá 3 Sao:** Mỗi màn chơi tính điểm và trao từ 1 đến 3 sao dựa trên độ chuẩn xác và số lượng lõi đạn còn dự trữ khi thắng cuộc.
- **Hệ thống Combo & Hiệu ứng:** Phá hủy tinh thể băng và vàng liên tiếp để nhân hệ số điểm (Combo Multipliers), đi kèm hiệu ứng nổ hạt (particles), rung màn hình (screen shake) và chữ nhảy điểm số.
- **Âm thanh tổng hợp thời gian thực (Procedural Web Audio):** 100% âm thanh được tính toán bằng thuật toán thông qua Web Audio API, không cần tải bất kỳ file MP3/WAV tĩnh nào.
- **Tương thích đa nền tảng:** Tối ưu hóa mượt mà từ màn hình cảm ứng điện thoại đến chuột/bàn phím máy tính để bàn (hỗ trợ cả màn hình dọc và ngang).
- **Đóng gói siêu nhẹ (Single-File):** Toàn bộ ứng dụng build thành một file HTML duy nhất tải tức thì.
- **Lưu trữ tiến trình cục bộ:** Tự động lưu số sao, kỷ lục điểm số và tiến trình mở khóa màn chơi qua `localStorage`.

---

### Quy tắc tính Sao (Star Rating System)

Mục tiêu cốt lõi của mỗi màn chơi là phá hủy toàn bộ tinh thể với số lần bắn ít nhất:

| Đánh giá | Hiển thị thị giác | Điều kiện đạt được |
| :--- | :--- | :--- |
| **⭐⭐⭐ 3 Sao** | 3 Sao Vàng Rực Rỡ | **Xuất sắc (Tối ưu tuyệt đối):** Phá hủy tất cả tinh thể mà vẫn giữ lại phần lớn số lõi sao chổi dự trữ (chỉ dùng 1 lượt bắn hoặc bảo toàn tối đa số đạn). |
| **⭐⭐☆ 2 Sao** | 2 Sao Sáng + 1 Sao Mờ | **Khá giỏi:** Phá sạch tinh thể và còn dư ít nhất 1-2 lõi đạn dự trữ. |
| **⭐☆☆ 1 Sao** | 1 Sao Sáng + 2 Sao Mờ | **Hoàn thành:** Phá sạch tinh thể bằng viên đạn cuối cùng. |

*Mở khóa màn mới:* Đạt từ 1 sao trở lên ở màn hiện tại sẽ tự động mở khóa màn tiếp theo trên Bản đồ viễn chinh.

---

### Hướng dẫn điều khiển

| Thao tác | Chuột / Màn hình cảm ứng | Bàn phím máy tính |
| :--- | :--- | :--- |
| **Căn góc bắn (Độ cao)** | Chạm/nhấn giữ chuột và kéo ngược hướng | Phím mũi tên Lên `↑` / Xuống `↓` (hoặc `W` / `S`) |
| **Tích lực & Bắn đạn** | Thả tay / Thả chuột | Giữ phím `Space` để nạp lực, nhả phím để phóng |
| **Tạm dừng game** | Nhấn biểu tượng Pause trên thanh HUD | Nhấn phím `P` hoặc `Escape` |
| **Bật/Tắt âm thanh**| Nhấn biểu tượng Loa góc trên phải | Nhấn phím `M` |
| **Chơi lại nhanh** | Nhấn biểu tượng Restart | Nhấn phím `R` |

---

### Cài đặt & Khởi chạy

#### Yêu cầu
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyên dùng v18+ trở lên).

#### 1. Tải mã nguồn về máy
```bash
git clone https://github.com/Thien21112005/molten-void.git
cd molten-void
```

#### 2. Cài đặt thư viện
```bash
npm install
```

#### 3. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```

#### 4. Đóng gói bản Production
```bash
npm run build
```
File hoàn chỉnh sẽ nằm trong thư mục `dist/`.

---

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Thien21112005/molten-void/issues).

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.
