import { loadSettings } from "./settings";

export const haptics = {
  /**
   * Safe check for browser Vibration API support & player preference
   */
  canVibrate(): boolean {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
      return false;
    }
    try {
      const s = loadSettings();
      // If user turned off screen shake, respect it as minimal haptics preference
      return Boolean(s.screenShake);
    } catch {
      return true;
    }
  },

  /**
   * Subtle tick when pulling/charging slingshot
   */
  tick(ms = 10) {
    if (this.canVibrate()) {
      try {
        navigator.vibrate(ms);
      } catch {
        /* silent ignore */
      }
    }
  },

  /**
   * Impulse when sling is released
   */
  fire() {
    this.tick(18);
  },

  /**
   * Thump when bouncing on wall or obstacle
   */
  bounce() {
    this.tick(22);
  },

  /**
   * Shatter vibration pulse that intensifies on combo
   */
  shatter(combo = 1) {
    if (this.canVibrate()) {
      try {
        if (combo >= 3) {
          navigator.vibrate([28, 22, 50]);
        } else {
          navigator.vibrate(28);
        }
      } catch {
        /* silent */
      }
    }
  },

  /**
   * Celebratory pattern on level clear
   */
  victory() {
    if (this.canVibrate()) {
      try {
        navigator.vibrate([40, 50, 40, 50, 80]);
      } catch {
        /* silent */
      }
    }
  },
};
