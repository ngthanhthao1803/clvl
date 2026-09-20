/**
 * Badminton-themed default avatars and presets for CLVL
 * All presets are lightweight vector SVGs encoded as Data URLs.
 */

export interface AvatarPreset {
  id: string;
  name: string;
  tag: string;
  dataUrl: string;
}

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const BADMINTON_AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "smash-ace",
    name: "Tay Đập Sấm Sét",
    tag: "Tấn công",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g1)" />
        <circle cx="100" cy="85" r="32" fill="#ffffff" opacity="0.95" />
        <path d="M48 165 C55 125, 145 125, 152 165 C138 185, 62 185, 48 165 Z" fill="#ffffff" opacity="0.9" />
        <!-- Shuttlecock icon on chest -->
        <g transform="translate(85, 132) scale(0.7)">
          <path d="M12 2 L30 32 L4 32 Z" fill="#10b981" />
          <circle cx="21" cy="38" r="9" fill="#fbbf24" />
        </g>
        <!-- Sport headband -->
        <path d="M70 76 Q100 68 130 76" stroke="#fbbf24" stroke-width="6" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
  {
    id: "speed-shuttle",
    name: "Tia Chớp Lưới",
    tag: "Tốc độ",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#4338ca" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g2)" />
        <!-- Badminton Racket -->
        <g transform="translate(100, 100) rotate(-25) translate(-100, -100)">
          <ellipse cx="100" cy="70" rx="38" ry="46" fill="none" stroke="#38bdf8" stroke-width="7" />
          <path d="M75 70 L125 70 M80 50 L120 50 M80 90 L120 90 M100 30 L100 110 M85 35 L85 105 M115 35 L115 105" stroke="#38bdf8" stroke-width="1.5" opacity="0.75" />
          <line x1="100" y1="116" x2="100" y2="175" stroke="#fbbf24" stroke-width="8" stroke-linecap="round" />
          <rect x="94" y="145" width="12" height="30" rx="3" fill="#ffffff" />
        </g>
        <!-- Shuttlecock moving -->
        <g transform="translate(115, 35) scale(0.65) rotate(45)">
          <path d="M10 5 L35 45 L-15 45 Z" fill="#ffffff" opacity="0.95" />
          <circle cx="10" cy="52" r="11" fill="#f43f5e" />
        </g>
      </svg>
    `),
  },
  {
    id: "champion-gold",
    name: "Quán Quân Phong Trào",
    tag: "Đẳng cấp",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g3)" />
        <!-- Trophy with Shuttlecock inside -->
        <g transform="translate(50, 40) scale(1)">
          <!-- Trophy cup -->
          <path d="M20 20 L80 20 C80 65, 65 80, 50 85 C35 80, 20 65, 20 20 Z" fill="#ffffff" opacity="0.95" />
          <!-- Handles -->
          <path d="M20 30 C5 30, 5 60, 24 60" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M80 30 C95 30, 95 60, 76 60" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round" />
          <!-- Stem and base -->
          <rect x="44" y="85" width="12" height="20" fill="#ffffff" opacity="0.95" />
          <rect x="25" y="105" width="50" height="12" rx="4" fill="#ffffff" />
          <!-- Shuttlecock silhouette in cup -->
          <path d="M42 35 L58 35 L54 50 L46 50 Z" fill="#f59e0b" />
          <circle cx="50" cy="56" r="4.5" fill="#f59e0b" />
        </g>
        <circle cx="100" cy="30" r="6" fill="#fef08a" />
      </svg>
    `),
  },
  {
    id: "defender-shield",
    name: "Phòng Thủ Thép",
    tag: "Kiên cường",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g4)" />
        <!-- Sport Shield with Shuttlecock -->
        <g transform="translate(50, 35)">
          <path d="M50 10 L85 22 C85 70, 50 105, 50 115 C50 105, 15 70, 15 22 Z" fill="#ffffff" opacity="0.95" />
          <path d="M50 20 L76 30 C76 68, 50 96, 50 104 C50 96, 24 68, 24 30 Z" fill="#0284c7" />
          <!-- Mini shuttlecock inside shield -->
          <path d="M42 45 L58 45 L54 65 L46 65 Z" fill="#ffffff" />
          <circle cx="50" cy="73" r="6" fill="#facc15" />
        </g>
      </svg>
    `),
  },
  {
    id: "racket-master",
    name: "Bậc Thầy Điều Cầu",
    tag: "Khéo léo",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g5)" />
        <circle cx="100" cy="85" r="30" fill="#ffffff" opacity="0.95" />
        <path d="M52 165 C60 130, 140 130, 148 165 Z" fill="#ffffff" opacity="0.9" />
        <!-- Cool sunglasses -->
        <path d="M80 82 Q100 86 120 82 Q115 95 100 95 Q85 95 80 82" fill="#1e1b4b" />
        <rect x="76" y="80" width="48" height="6" rx="3" fill="#1e1b4b" />
        <!-- Racket on back -->
        <line x1="135" y1="60" x2="170" y2="25" stroke="#fde047" stroke-width="5" stroke-linecap="round" />
        <ellipse cx="170" cy="25" rx="14" ry="18" fill="none" stroke="#fde047" stroke-width="4" transform="rotate(45 170 25)" />
      </svg>
    `),
  },
  {
    id: "rising-star",
    name: "Chiến Binh Nhiệt Huyết",
    tag: "Phong trào",
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ea580c" />
            <stop offset="100%" stop-color="#c2410c" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#g6)" />
        <!-- Flaming Shuttlecock -->
        <g transform="translate(100, 100) scale(1.1) translate(-50, -50)">
          <!-- Feathers -->
          <path d="M25 25 Q50 10 75 25 L65 65 Q50 60 35 65 Z" fill="#ffffff" opacity="0.95" />
          <line x1="38" y1="23" x2="42" y2="63" stroke="#ea580c" stroke-width="2" />
          <line x1="50" y1="18" x2="50" y2="61" stroke="#ea580c" stroke-width="2" />
          <line x1="62" y1="23" x2="58" y2="63" stroke="#ea580c" stroke-width="2" />
          <!-- Head / Cork -->
          <circle cx="50" cy="74" r="13" fill="#fde047" />
          <circle cx="50" cy="74" r="10" fill="#ea580c" opacity="0.25" />
        </g>
        <!-- Star badges -->
        <polygon points="100,10 103,18 111,18 105,23 107,31 100,26 93,31 95,23 89,18 97,18" fill="#fef08a" />
      </svg>
    `),
  },
];

/**
 * Returns a deterministic fallback avatar SVG data URL based on user's name
 */
export function getDefaultAvatar(name = "Player", id = ""): string {
  const initial = (name.trim().charAt(0) || "C").toUpperCase();

  // Pick a distinct sport gradient based on name/id charCode sum
  const gradients = [
    { start: "#10b981", end: "#047857", accent: "#34d399" }, // Emerald
    { start: "#0ea5e9", end: "#0284c7", accent: "#38bdf8" }, // Sky
    { start: "#6366f1", end: "#4338ca", accent: "#818cf8" }, // Indigo
    { start: "#f59e0b", end: "#d97706", accent: "#fbbf24" }, // Amber
    { start: "#ec4899", end: "#be185d", accent: "#f472b6" }, // Pink
    { start: "#14b8a6", end: "#0f766e", accent: "#2dd4bf" }, // Teal
  ];

  let codeSum = 0;
  const str = (name + id).trim();
  for (let i = 0; i < str.length; i++) {
    codeSum += str.charCodeAt(i);
  }
  const color = gradients[codeSum % gradients.length];

  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="def-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color.start}" />
          <stop offset="100%" stop-color="${color.end}" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#def-grad)" />
      <!-- Subtle badminton racket ring -->
      <circle cx="100" cy="100" r="88" fill="none" stroke="${color.accent}" stroke-width="2.5" stroke-dasharray="6,6" opacity="0.6" />
      <!-- Initial letter -->
      <text x="100" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="78" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
        ${initial}
      </text>
      <!-- Mini Shuttlecock at bottom corner -->
      <g transform="translate(138, 138) scale(0.48)">
        <circle cx="20" cy="20" r="26" fill="#ffffff" />
        <path d="M12 6 L28 6 L25 24 L15 24 Z" fill="${color.start}" />
        <circle cx="20" cy="28" r="6" fill="#f59e0b" />
      </g>
    </svg>
  `);
}
