export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number): number =>
  v < a ? a : v > b ? b : v;

export const rand = (a: number, b: number): number =>
  a + Math.random() * (b - a);

export const pick = <T,>(arr: readonly T[]): T =>
  arr[(Math.random() * arr.length) | 0];

export const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
