export type SkinId =
  | "classic"
  | "nebula_cyan"
  | "plasma_violet"
  | "ice_frost"
  | "void_singularity"
  | "solar_gold";

export type SkinCoreShape =
  | "molten_flame"
  | "spiral_galaxy"
  | "pulsar_rings"
  | "ice_crystal"
  | "void_singularity"
  | "solar_crown";

export interface SkinDef {
  id: SkinId;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  requiredStars: number;
  coreShape: SkinCoreShape;
  trailColor: string; // RGB string "r,g,b"
  glowColor: string; // Hex or CSS color
  palette: {
    core: string;
    mid: string;
    outer: string;
    ambient: string;
  };
}
