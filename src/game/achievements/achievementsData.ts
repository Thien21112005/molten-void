import type { AchievementDef, AchievementId, AchievementsState } from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "nebula_marksman",
    titleVi: "Xạ Thủ Tinh Vân",
    titleEn: "Nebula Marksman",
    descVi: "Chinh phục 3 sao tại ít nhất 5 trạm không gian",
    descEn: "Earn 3 stars across at least 5 different sectors",
    tier: "bronze",
    iconType: "star",
  },
  {
    id: "ricochet_master",
    titleVi: "Bậc Thầy Phản Xạ",
    titleEn: "Ricochet Master",
    descVi: "Bắn dội tường tiêu diệt từ 3 tinh thể trở lên trong 1 lượt",
    descEn: "Destroy 3+ crystals in a single shot using wall ricochets",
    tier: "silver",
    iconType: "bounce",
  },
  {
    id: "molten_demolisher",
    titleVi: "Bộc Phá Tinh Vân",
    titleEn: "Molten Demolisher",
    descVi: "Kích nổ Lõi Bom Lửa quét sạch từ 2 tinh thể cùng lúc",
    descEn: "Detonate Molten Blast core destroying 2+ crystals simultaneously",
    tier: "silver",
    iconType: "blast",
  },
  {
    id: "cluster_master",
    titleVi: "Phân Tách Hoàn Hảo",
    titleEn: "Cluster Split Master",
    descVi: "Kích hoạt Lõi Chùm phân tách bắn trúng 3 tinh thể",
    descEn: "Trigger Cluster Split core shattering 3 crystals in one run",
    tier: "silver",
    iconType: "cluster",
  },
  {
    id: "heavy_piercer",
    titleVi: "Xuyên Thủng Không Gian",
    titleEn: "Heavy Piercer",
    descVi: "Dùng Lõi Xuyên Phá đâm thủng thanh chắn và trúng tinh thể",
    descEn: "Pierce directly through a barrier and shatter a crystal behind it",
    tier: "gold",
    iconType: "heavy",
  },
  {
    id: "singularity_slingshot",
    titleVi: "Thám Hiểm Lỗ Đen",
    titleEn: "Singularity Slingshot",
    descVi: "Bẻ cong quỹ đạo qua Vùng trọng lực để tiêu diệt tinh thể",
    descEn: "Slingshot comet through a Gravity Well to shatter a crystal",
    tier: "gold",
    iconType: "gravity",
  },
  {
    id: "wormhole_voyager",
    titleVi: "Lữ Khách Cổng Không Gian",
    titleEn: "Wormhole Voyager",
    descVi: "Bắn sao chổi xuyên qua Cổng không gian thành công",
    descEn: "Successfully warp through a Wormhole Portal",
    tier: "bronze",
    iconType: "wormhole",
  },
  {
    id: "cosmic_legend",
    titleVi: "Chiến Thần Molten Void",
    titleEn: "Cosmic Legend",
    descVi: "Đạt trọn vẹn 45/45 ⭐ trên toàn bộ chiến dịch",
    descEn: "Conquer the entire campaign with 45/45 ⭐ stars",
    tier: "cosmic",
    iconType: "crown",
  },
];

const STORAGE_KEY = "mv_achievements_v1";

type UnlockListener = (achievement: AchievementDef) => void;
const listeners = new Set<UnlockListener>();

export function subscribeAchievementUnlocked(fn: UnlockListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function loadAchievements(): AchievementsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAchievements();
    const parsed = JSON.parse(raw);
    const result = getDefaultAchievements();
    for (const key of Object.keys(result) as AchievementId[]) {
      if (parsed[key] && typeof parsed[key].unlocked === "boolean") {
        result[key] = parsed[key];
      }
    }
    return result;
  } catch {
    return getDefaultAchievements();
  }
}

export function saveAchievements(state: AchievementsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage write failures
  }
}

function getDefaultAchievements(): AchievementsState {
  return {
    nebula_marksman: { unlocked: false },
    ricochet_master: { unlocked: false },
    molten_demolisher: { unlocked: false },
    cluster_master: { unlocked: false },
    heavy_piercer: { unlocked: false },
    singularity_slingshot: { unlocked: false },
    wormhole_voyager: { unlocked: false },
    cosmic_legend: { unlocked: false },
  };
}

export function unlockAchievement(id: AchievementId): boolean {
  const current = loadAchievements();
  if (current[id]?.unlocked) return false;

  current[id] = {
    unlocked: true,
    unlockedAt: Date.now(),
  };
  saveAchievements(current);

  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (def) {
    listeners.forEach((fn) => {
      try {
        fn(def);
      } catch (err) {
        console.error("Error in achievement listener:", err);
      }
    });
  }

  return true;
}

export function checkCampaignMilestoneAchievements(progressLevels: Record<number, { stars: number }>): void {
  let totalStars = 0;
  let threeStarCount = 0;

  for (let i = 1; i <= 15; i++) {
    const stars = progressLevels[i]?.stars ?? 0;
    totalStars += stars;
    if (stars === 3) threeStarCount++;
  }

  if (threeStarCount >= 5) {
    unlockAchievement("nebula_marksman");
  }

  if (totalStars >= 45) {
    unlockAchievement("cosmic_legend");
  }
}
