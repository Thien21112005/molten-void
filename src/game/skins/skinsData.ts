import type { SkinDef, SkinId } from "./types";

export const SKINS: SkinDef[] = [
  {
    id: "classic",
    nameVi: "Dung Nham Molten",
    nameEn: "Classic Molten",
    descVi: "Sao chổi nham thạch rực lửa nguyên bản của vũ trụ Molten Void",
    descEn: "The signature primal blaze comet forged in stellar magma",
    requiredStars: 0,
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
    id: "plasma_violet",
    nameVi: "Plasma Tím",
    nameEn: "Plasma Violet",
    descVi: "Hào quang điện từ huyền bí của bão từ trường không gian sâu",
    descEn: "Mystic electromagnetic aura harnessed from deep space pulsars",
    requiredStars: 15,
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
    nameVi: "Băng Nam Cực",
    nameEn: "Ice Frost",
    descVi: "Sao chổi băng tinh khiết mang theo bụi tuyết cực quang phát sáng",
    descEn: "Glacial crystalline comet leaving radiant stardust frost trails",
    requiredStars: 30,
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
    id: "solar_gold",
    nameVi: "Hoàng Kim Thái Dương",
    nameEn: "Solar Gold",
    descVi: "Vương miện hoàng kim rực rỡ dành riêng cho bậc thầy thu thập 45⭐",
    descEn: "The supreme radiant golden comet awarded to true 45⭐ conquerors",
    requiredStars: 45,
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
