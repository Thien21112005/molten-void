export type Language = "vi" | "en";

export interface Translations {
  // Common
  menu: string;
  settings: string;
  close: string;
  confirm: string;
  cancel: string;
  save: string;
  back: string;
  play: string;
  resume: string;
  restart: string;
  paused: string;
  gameOver: string;
  victory: string;
  roadmap: string;
  level: string;
  score: string;
  best: string;
  stars: string;
  points: string;

  // Menu
  tagline: string;
  playCampaign: string;
  cosmicRoadmap: string;
  campaignStars: string;
  bestRun: string;
  sectorsWon: string;
  highScores: string;
  top5: string;
  noRunsYet: string;
  controlsTitle: string;
  tactical: string;

  // Controls
  dragHint: string;
  aimAngleHint: string;
  chargeHint: string;
  quickRestartHint: string;

  // Settings Modal
  settingsTitle: string;
  languageLabel: string;
  audioCategory: string;
  masterSound: string;
  musicVolume: string;
  musicTrackLabel: string;
  musicTrackArmageddon: string;
  musicTrackSynth: string;
  nowPlayingArmageddon: string;
  pauseAutoMuteDesc: string;
  sfxVolume: string;
  gameplayCategory: string;
  screenShake: string;
  screenShakeDesc: string;
  particleDensity: string;
  particleFull: string;
  particleReduced: string;
  trajectoryGuide: string;
  trajectoryFull: string;
  trajectoryMinimal: string;
  dataCategory: string;
  resetProgress: string;
  resetProgressDesc: string;
  resetConfirmTitle: string;
  resetConfirmMsg: string;
  resetSuccessMsg: string;
  on: string;
  off: string;

  // Roadmap & Victory
  roadmapTitle: string;
  roadmapSubtitle: string;
  currentStation: string;
  dragToExplore: string;
  nextSector: string;
  coresBonus: string;
  newBest: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  vi: {
    menu: "Menu",
    settings: "Cài Đặt",
    close: "Đóng",
    confirm: "Xác Nhận",
    cancel: "Hủy Bỏ",
    save: "Lưu",
    back: "Quay Lại",
    play: "Chơi Tiếp",
    resume: "Tiếp Tục",
    restart: "Chơi Lại",
    paused: "TẠM DỪNG",
    gameOver: "KẾT THÚC",
    victory: "CHIẾN THẮNG",
    roadmap: "Bản Đồ",
    level: "MÀN",
    score: "ĐIỂM",
    best: "KỶ LỤC",
    stars: "Sao",
    points: "điểm",

    tagline: "Bắn lõi sao chổi • Phá vỡ tinh thể năng lượng • Kích hoạt chuỗi combo trên 15 cung đường vũ trụ.",
    playCampaign: "Chơi Chiến Dịch",
    cosmicRoadmap: "Bản Đồ Chiến Dịch",
    campaignStars: "SAO CHIẾN DỊCH",
    bestRun: "KỶ LỤC ĐIỂM",
    sectorsWon: "MÀN ĐÃ VƯỢT",
    highScores: "BẢNG KỶ LỤC",
    top5: "TOP 5",
    noRunsYet: "CHƯA CÓ LƯỢT CHƠI — HÃY LÀ NGƯỜI ĐẦU TIÊN",
    controlsTitle: "HƯỚNG DẪN ĐIỀU KHIỂN & BẮN NẢY",
    tactical: "CHIẾN THUẬT",

    dragHint: "kéo ngược & thả tay để phóng",
    aimAngleHint: "căn góc bắn",
    chargeHint: "nhấn giữ nạp lực, nhả để bắn",
    quickRestartHint: "chơi lại nhanh",

    settingsTitle: "CÀI ĐẶT TRÒ CHƠI",
    languageLabel: "Ngôn Ngữ (Language)",
    audioCategory: "Âm Thanh & Nhạc Nền",
    masterSound: "Âm Thanh Tổng",
    musicVolume: "Nhạc Nền Không Gian (BGM)",
    musicTrackLabel: "Bản Nhạc Nền (BGM)",
    musicTrackArmageddon: "Armageddon (Alibi Music)",
    musicTrackSynth: "Procedural Synth",
    nowPlayingArmageddon: "Đang phát: Epic Battle: Armageddon — Alibi Music",
    pauseAutoMuteDesc: "Tự động tắt nhạc chiến đấu khi vào màn hình Tạm Dừng (Pause)",
    sfxVolume: "Hiệu Ứng Âm Thanh (SFX)",
    gameplayCategory: "Hình Ảnh & Hiệu Năng",
    screenShake: "Rung Chấn Màn Hình (Screen Shake)",
    screenShakeDesc: "Hiệu ứng rung động lực khi tinh thể nổ tung",
    particleDensity: "Mật Độ Hạt Nổ (Particles)",
    particleFull: "Đầy Đủ (Sắc Nét)",
    particleReduced: "Tiết Kiệm (Mượt Hơn)",
    trajectoryGuide: "Tia Ngắm Dự Đoán (Trajectory)",
    trajectoryFull: "Đường Cong Đầy Đủ",
    trajectoryMinimal: "Tia Chấm Tối Giản",
    dataCategory: "Dữ Liệu & Tiến Trình",
    resetProgress: "Đặt Lại Tiến Trình Chiến Dịch",
    resetProgressDesc: "Xóa toàn bộ số sao và mở khóa lại từ Màn 1",
    resetConfirmTitle: "XÁC NHẬN ĐẶT LẠI?",
    resetConfirmMsg: "Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình chiến dịch và số sao về Màn 1 không? Thao tác này không thể hoàn tác.",
    resetSuccessMsg: "Đã đặt lại tiến trình thành công!",
    on: "BẬT",
    off: "TẮT",

    roadmapTitle: "BẢN ĐỒ CHIẾN DỊCH KHÔNG GIAN",
    roadmapSubtitle: "TÂY SANG ĐÔNG • 15 KHU VỰC VIỄN CHINH",
    currentStation: "Trạm Hiện Tại",
    dragToExplore: "↔ Kéo ngang để khám phá • Chạm để chọn màn",
    nextSector: "Khu Vực Tiếp Theo",
    coresBonus: "Thưởng bảo toàn đạn",
    newBest: "KỶ LỤC MỚI!",
  },
  en: {
    menu: "Main Menu",
    settings: "Settings",
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    back: "Back",
    play: "Play Campaign",
    resume: "Resume",
    restart: "Restart",
    paused: "PAUSED",
    gameOver: "GAME OVER",
    victory: "SECTOR CLEARED",
    roadmap: "Roadmap",
    level: "LEVEL",
    score: "SCORE",
    best: "BEST",
    stars: "Stars",
    points: "pts",

    tagline: "Sling comet cores • Shatter crystal lattices • Chain orbital combos across 15 handcrafted sectors.",
    playCampaign: "Play Campaign",
    cosmicRoadmap: "Cosmic Roadmap",
    campaignStars: "CAMPAIGN STARS",
    bestRun: "BEST RUN",
    sectorsWon: "SECTORS WON",
    highScores: "HIGH SCORES",
    top5: "TOP 5",
    noRunsYet: "NO RUNS YET — BE THE FIRST",
    controlsTitle: "FLIGHT & SLINGSHOT CONTROLS",
    tactical: "TACTICAL",

    dragHint: "pull back & release to sling",
    aimAngleHint: "aim angle",
    chargeHint: "hold to charge, release to fire",
    quickRestartHint: "instant restart",

    settingsTitle: "GAME SETTINGS",
    languageLabel: "Language",
    audioCategory: "Audio & Music",
    masterSound: "Master Audio",
    musicVolume: "Cosmic Music (BGM)",
    musicTrackLabel: "BGM Soundtrack",
    musicTrackArmageddon: "Armageddon (Alibi Music)",
    musicTrackSynth: "Procedural Synth",
    nowPlayingArmageddon: "Now Playing: Epic Battle: Armageddon — Alibi Music",
    pauseAutoMuteDesc: "Automatically pauses battle music when the game is paused",
    sfxVolume: "Sound Effects (SFX)",
    gameplayCategory: "Graphics & Performance",
    screenShake: "Screen Shake",
    screenShakeDesc: "Impulse vibration on crystal shatters and impacts",
    particleDensity: "Particle Density",
    particleFull: "High (Crisp)",
    particleReduced: "Low (Performance)",
    trajectoryGuide: "Trajectory Guide",
    trajectoryFull: "Full Arc Preview",
    trajectoryMinimal: "Minimal Dots",
    dataCategory: "Data & Progression",
    resetProgress: "Reset Campaign Progress",
    resetProgressDesc: "Wipe all earned stars and reset to Level 1",
    resetConfirmTitle: "CONFIRM RESET?",
    resetConfirmMsg: "Are you sure you want to reset all stars and unlock progress back to Level 1? This action cannot be undone.",
    resetSuccessMsg: "Progress reset successfully!",
    on: "ON",
    off: "OFF",

    roadmapTitle: "COSMIC CAMPAIGN ROADMAP",
    roadmapSubtitle: "WEST TO EAST • 15 EXPEDITIONS",
    currentStation: "Current Station",
    dragToExplore: "↔ Drag horizontally to explore • Tap to select sector",
    nextSector: "Next Sector",
    coresBonus: "Conserved Cores Bonus",
    newBest: "NEW BEST!",
  },
};

const LANG_KEY = "mv_language";

export function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "vi" || saved === "en") return saved;
    // Auto-detect Vietnamese from browser
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("vi")) {
      return "vi";
    }
  } catch {
    /* ignore */
  }
  return "vi"; // Default to Vietnamese for the user
}

export function saveLanguage(lang: Language) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}
