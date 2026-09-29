export type AchievementId =
  | "nebula_marksman"
  | "ricochet_master"
  | "molten_demolisher"
  | "cluster_master"
  | "heavy_piercer"
  | "singularity_slingshot"
  | "wormhole_voyager"
  | "cosmic_legend";

export type AchievementTier = "bronze" | "silver" | "gold" | "cosmic";

export interface AchievementDef {
  id: AchievementId;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  tier: AchievementTier;
  iconType: "star" | "bounce" | "blast" | "cluster" | "heavy" | "gravity" | "wormhole" | "crown";
}

export interface AchievementRecord {
  unlocked: boolean;
  unlockedAt?: number; // timestamp
}

export type AchievementsState = Record<AchievementId, AchievementRecord>;
