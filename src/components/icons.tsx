const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'square' as const, viewBox: '0 0 24 24' };

export const PlusIcon = ({ size = 18, w = 2 }) => (
  <svg width={size} height={size} {...base} strokeWidth={w}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = ({ size = 16, w = 2.5 }) => (
  <svg width={size} height={size} {...base} strokeWidth={w}><path d="M5 12h14" /></svg>
);
export const ChartIcon = ({ size = 18 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg>
);
export const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const BackIcon = ({ size = 16 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2}><path d="M15 5l-7 7 7 7" /></svg>
);
export const RerollIcon = ({ size = 16 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>
);
export const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} {...base} strokeWidth={2.5}><path d="M7 4l12 8-12 8z" /></svg>
);
export const StopIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" /></svg>
);
