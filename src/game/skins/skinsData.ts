import type { SkinDef, SkinId } from "./types";

export const SKINS: SkinDef[] = [
  {
    id: "classic",
    nameVi: "Dung Nham Molten",
    nameEn: "Classic Molten",
    descVi: "Lõi nham thạch rực lửa với các khe nứt dung nham nguyên bản và vành nhật hoa bốc cháy",
    descEn: "Primal volcanic core surging with molten magma fissures and blazing solar corona",
    requiredStars: 0,
    coreShape: "molten_flame",
    trailColor: "255,150,50",
    glowColor: "#ff7a1a",
    palette: {
      core: "rgba(255,240,200,0.98)",
      mid: "rgba(255,160,40,0.95)",
      outer: "rgba(255,80,20,0.75)",
      ambient: "rgba(255,60,0,0.25)",
    },
  },
  {
    id: "nebula_cyan",
    nameVi: "Cực Quang Lục Bảo",
    nameEn: "Emerald Aurora",
    descVi: "Lõi ngân hà xoắn ốc với vành đai ion lục bảo quay quanh và bụi cực quang huyền ảo",
    descEn: "Swirling spiral galaxy core wrapped in luminous emerald ion rings and aurora dust",
    requiredStars: 10,
    coreShape: "spiral_galaxy",
    trailColor: "46,230,201",
    glowColor: "#2ee6c9",
    palette: {
      core: "rgba(235,255,252,0.98)",
      mid: "rgba(46,230,201,0.95)",
      outer: "rgba(13,148,136,0.8)",
      ambient: "rgba(15,118,110,0.25)",
    },
  },
  {
    id: "plasma_violet",
    nameVi: "Plasma Tử Điện",
    nameEn: "Pulsar Violet",
    descVi: "Lõi pulsar từ trường với vành đai plasma đan chéo và các tia sét hồ quang cao tần",
    descEn: "Electromagnetic pulsar crystal encased in dual orbital plasma rings and lightning arcs",
    requiredStars: 20,
    coreShape: "pulsar_rings",
    trailColor: "168,85,247",
    glowColor: "#c084fc",
    palette: {
      core: "rgba(250,232,255,0.98)",
      mid: "rgba(192,132,252,0.95)",
      outer: "rgba(147,51,234,0.75)",
      ambient: "rgba(107,33,168,0.28)",
    },
  },
  {
    id: "ice_frost",
    nameVi: "Băng Tinh Nam Cực",
    nameEn: "Glacial Crystal",
    descVi: "Lõi lăng kính băng lục giác với 6 mảnh cryo bay lơ lửng và ánh tuyết cực hàn",
    descEn: "Hexagonal glacial cryo prism surrounded by orbiting frost shards and diamond glints",
    requiredStars: 30,
    coreShape: "ice_crystal",
    trailColor: "56,189,248",
    glowColor: "#38bdf8",
    palette: {
      core: "rgba(240,249,255,0.98)",
      mid: "rgba(56,189,248,0.95)",
      outer: "rgba(14,116,144,0.75)",
      ambient: "rgba(8,145,178,0.25)",
    },
  },
  {
    id: "void_singularity",
    nameVi: "Hố Đen Hư Vô",
    nameEn: "Void Singularity",
    descVi: "Lõi kỳ dị không thời gian với đĩa bồi tụ bẻ cong ánh sáng và photon vòng huyền bí",
    descEn: "Deep space event horizon flanked by a relativistic accretion disc and gravitational lens halo",
    requiredStars: 40,
    coreShape: "void_singularity",
    trailColor: "147,51,234",
    glowColor: "#a855f7",
    palette: {
      core: "rgba(15,10,25,0.98)",
      mid: "rgba(168,85,247,0.95)",
      outer: "rgba(88,28,135,0.85)",
      ambient: "rgba(59,7,100,0.3)",
    },
  },
  {
    id: "solar_gold",
    nameVi: "Hoàng Kim Thái Dương",
    nameEn: "Solar Gold",
    descVi: "Vương miện thái dương 8 cánh hoàng kim rực rỡ độc quyền dành cho bậc thầy 45⭐",
    descEn: "Divine 8-pointed solar star crown blazing with thermonuclear sacred golden rays",
    requiredStars: 45,
    coreShape: "solar_crown",
    trailColor: "250,204,21",
    glowColor: "#facc15",
    palette: {
      core: "rgba(255,255,255,0.98)",
      mid: "rgba(253,224,71,0.95)",
      outer: "rgba(234,179,8,0.85)",
      ambient: "rgba(202,138,4,0.3)",
    },
  },
];

const STORAGE_KEY = "mv_equipped_skin";

export function loadEquippedSkin(): SkinId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SkinId;
    if (saved && SKINS.some((s) => s.id === saved)) return saved;
  } catch {
    /* ignore */
  }
  return "classic";
}

export function saveEquippedSkin(skinId: SkinId): void {
  try {
    localStorage.setItem(STORAGE_KEY, skinId);
  } catch {
    /* ignore */
  }
}

export function isSkinUnlocked(skinId: SkinId, totalStars: number): boolean {
  const def = SKINS.find((s) => s.id === skinId);
  if (!def) return false;
  return totalStars >= def.requiredStars;
}
