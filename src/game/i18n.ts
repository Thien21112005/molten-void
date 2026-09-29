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

  // Campaign Intel
  campaignIntel: string;
  totalProgress: string;
  sector1Name: string;
  sector2Name: string;
  sector3Name: string;
  sectorStatusCleared: string;
  sectorStatusActive: string;
  sectorStatusLocked: string;
  openRoadmapAction: string;
  levelTarget: string;
  levelTargetDesc: string;

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
  menuBgmLabel: string;
  menuTrackArmageddonDesc: string;
  menuTrackCosmic: string;
  menuTrackCosmicDesc: string;
  menuTrackCyber: string;
  menuTrackCyberDesc: string;
  battleBgmLabel: string;
  battleTrackName: string;
  battleTrackDesc: string;
  roadmapBgmLabel: string;
  roadmapTrackName: string;
  roadmapTrackDesc: string;
  previewPlay: string;
  previewStop: string;
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
  saveAndApply: string;
  settingsSaved: string;
  deepSpaceExpedition: string;
  levelSpan: string;
  coresDepleted: string;
  levelClearedHeader: string;
  perfectRun3Stars: string;
  greatShot2Stars: string;
  cleared1Star: string;
  levelScore: string;
  coreReserveBonus: string;
  totalRunScore: string;
  instantRestartHint: string;
  firstShotHint: string;
  firstShotSubHint: string;
  dragToAimHint: string;
  shareResult: string;
  shareCopied: string;
  shareTextTemplate: string;
  coreStandard: string;
  coreCluster: string;
  coreBlast: string;
  coreHeavy: string;
  coreClusterDesc: string;
  coreBlastDesc: string;
  coreHeavyDesc: string;
  coreSelectTitle: string;
  currentStationBtn: string;
  starmapExploreHint: string;
  startNode: string;
  apexNode: string;
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

    // Campaign Intel
    campaignIntel: "HỒ SƠ CHIẾN DỊCH",
    totalProgress: "Tổng Tiến Độ Thu Thập",
    sector1Name: "Vành Đai Tiểu Hành Tinh",
    sector2Name: "Tinh Vân Plasma",
    sector3Name: "Hư Vô Tận Cùng",
    sectorStatusCleared: "Hoàn Thành",
    sectorStatusActive: "Chiến Đấu",
    sectorStatusLocked: "Bị Khóa",
    openRoadmapAction: "Mở Bản Đồ Tinh Hệ Chi Tiết",
    levelTarget: "MỤC TIÊU MÀN",
    levelTargetDesc: "Bảo toàn số đạn và dọn sạch các lõi năng lượng",

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
    menuBgmLabel: "Nhạc Nền Menu Chính",
    menuTrackArmageddonDesc: "Hào hùng, hoành tráng phong cách điện ảnh (Alibi Music)",
    menuTrackCosmic: "Vũ Trụ Huyền Bí",
    menuTrackCosmicDesc: "Giai điệu thư thái, phiêu bồng không gian sâu",
    menuTrackCyber: "Nhịp Xung Điện Tử",
    menuTrackCyberDesc: "Synthwave điện tử 118 BPM nhịp nhàng hiện đại",
    battleBgmLabel: "Nhạc Chiến Đấu Trong Màn",
    battleTrackName: "Nhịp Xung Điện Tử (Cyber Pulse)",
    battleTrackDesc: "118 BPM Synthwave dồn dập • Tự động dừng khi Tạm dừng",
    roadmapBgmLabel: "Nhạc Bản Đồ Tinh Hệ",
    roadmapTrackName: "Vũ Trụ Huyền Bí (Cosmic Odyssey)",
    roadmapTrackDesc: "Du dương, êm dịu khi mở Bản Đồ Viễn Chinh",
    previewPlay: "▶ Nghe Thử",
    previewStop: "⏹ Dừng",
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
    saveAndApply: "Lưu & Áp Dụng",
    settingsSaved: "Đã lưu cài đặt!",
    deepSpaceExpedition: "CHIẾN DỊCH KHÔNG GIAN SÂU • 15 KHU VỰC",
    levelSpan: "Màn",
    coresDepleted: "LÕI NĂNG LƯỢNG ĐÃ CẠN",
    levelClearedHeader: "ĐÃ VƯỢT QUA MÀN",
    perfectRun3Stars: "HOÀN HẢO — 3 SAO!",
    greatShot2Stars: "RẤT TỐT — 2 SAO",
    cleared1Star: "VƯỢT MÀN — 1 SAO",
    levelScore: "Điểm Màn",
    coreReserveBonus: "Thưởng Đạn Còn Lại",
    totalRunScore: "Tổng Điểm Lượt Chơi",
    instantRestartHint: "NHẤN R ĐỂ CHƠI LẠI TỨC THÌ",
    firstShotHint: "KÉO NGƯỢC & THẢ TAY",
    firstShotSubHint: "kéo bất kỳ đâu, hoặc",
    dragToAimHint: "KÉO NGƯỢC ĐỂ CĂN LỰC • THẢ TAY ĐỂ BẮN",
    shareResult: "Chia Sẻ Thành Tích",
    shareCopied: "Đã sao chép vào bộ nhớ tạm!",
    shareTextTemplate: "🌌 Tôi vừa chinh phục Molten Void màn {level} với {stars}⭐ (Tổng {totalStars}/45⭐)! Bạn có phá được kỷ lục này không? https://thien21112005.github.io/molten-void/",
    coreStandard: "Tiêu Chuẩn",
    coreCluster: "Lõi Chùm",
    coreBlast: "Bom Lửa",
    coreHeavy: "Xuyên Phá",
    coreClusterDesc: "Chạm lần nữa khi bay để tách làm 3 mảnh nhỏ tỏa ra các hướng",
    coreBlastDesc: "Nổ tung phá hủy tinh thể trong bán kính xung quanh khi va chạm",
    coreHeavyDesc: "Đâm thủng 1 thanh chắn thay vì dội ngược lại",
    coreSelectTitle: "CHỌN LÕI ĐẠN ĐẶC BIỆT",
    currentStationBtn: "Trạm Hiện Tại",
    starmapExploreHint: "↔ Kéo ngang để khám phá • Chạm để chọn màn",
    startNode: "XUẤT PHÁT",
    apexNode: "ĐỈNH CAO",
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

    // Campaign Intel
    campaignIntel: "CAMPAIGN INTEL",
    totalProgress: "Total Expedition Progress",
    sector1Name: "Asteroid Belt",
    sector2Name: "Plasma Nebula",
    sector3Name: "Cosmic Abyss",
    sectorStatusCleared: "Cleared",
    sectorStatusActive: "Active",
    sectorStatusLocked: "Locked",
    openRoadmapAction: "Open Full Starmap Roadmap",
    levelTarget: "LEVEL OBJECTIVE",
    levelTargetDesc: "Conserve comet cores and eliminate all energy crystals",

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
    menuBgmLabel: "Main Menu BGM",
    menuTrackArmageddonDesc: "Heroic, cinematic hybrid orchestral theme (Alibi Music)",
    menuTrackCosmic: "Cosmic Odyssey",
    menuTrackCosmicDesc: "Ethereal, relaxing deep space ambient synth",
    menuTrackCyber: "Cyber Pulse",
    menuTrackCyberDesc: "Rhythmic 118 BPM synthwave retro groove",
    battleBgmLabel: "In-Game Battle Combat",
    battleTrackName: "Cyber Pulse (Synthwave)",
    battleTrackDesc: "Driving 118 BPM synthwave • Auto-pauses on pause",
    roadmapBgmLabel: "Cosmic Roadmap Starmap",
    roadmapTrackName: "Cosmic Odyssey (Ambient)",
    roadmapTrackDesc: "Ethereal, relaxing deep space exploration chimes",
    previewPlay: "▶ Preview",
    previewStop: "⏹ Stop",
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
    saveAndApply: "Save & Apply",
    settingsSaved: "Settings saved!",
    deepSpaceExpedition: "DEEP SPACE EXPEDITION • 15 SECTORS",
    levelSpan: "Levels",
    coresDepleted: "CORES DEPLETED",
    levelClearedHeader: "LEVEL CLEARED",
    perfectRun3Stars: "PERFECT RUN — 3 STARS!",
    greatShot2Stars: "GREAT SHOT — 2 STARS",
    cleared1Star: "CLEARED — 1 STAR",
    levelScore: "Level Score",
    coreReserveBonus: "Core Reserve Bonus",
    totalRunScore: "Total Run Score",
    instantRestartHint: "PRESS R FOR INSTANT RESTART",
    firstShotHint: "PULL BACK & RELEASE",
    firstShotSubHint: "drag anywhere, or",
    dragToAimHint: "PULL BACK TO AIM • RELEASE TO FIRE",
    shareResult: "Share Victory",
    shareCopied: "Copied to clipboard!",
    shareTextTemplate: "🌌 I just conquered Molten Void Sector {level} with {stars}⭐ ({totalStars}/45⭐ total)! Can you beat my score? https://thien21112005.github.io/molten-void/",
    coreStandard: "Standard",
    coreCluster: "Cluster",
    coreBlast: "Molten Blast",
    coreHeavy: "Heavy Pierce",
    coreClusterDesc: "Tap again in flight to split into 3 shards radiating outward",
    coreBlastDesc: "Explodes on impact shattering all crystals in blast radius",
    coreHeavyDesc: "Pierces directly through 1 barrier instead of deflecting",
    coreSelectTitle: "SELECT SPECIAL CORE",
    currentStationBtn: "Current Station",
    starmapExploreHint: "↔ Drag horizontally to explore • Tap to sling",
    startNode: "START",
    apexNode: "APEX",
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
