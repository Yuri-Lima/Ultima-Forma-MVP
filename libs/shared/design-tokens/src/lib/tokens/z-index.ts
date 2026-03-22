export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export type ZIndexScale = typeof zIndex;
export type ZIndexKey = keyof ZIndexScale;
