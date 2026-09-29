export type SkinId = "classic" | "plasma_violet" | "ice_frost" | "solar_gold";

export interface SkinDef {
  id: SkinId;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  requiredStars: number;
  trailColor: string; // RGB string "r,g,b"
  glowColor: string; // Hex or CSS color
  palette: {
    core: string;
    mid: string;
    outer: string;
    ambient: string;
  };
}
