export const METEOR_BASE_INTERVAL = 2.2
export const METEOR_BASE_MAX = 6
export const DESKTOP_BREAKPOINT_PX = 768

/* Map CSS variable names to hex for Three.js */
const BRANCH_COLORS: Record<string, string> = {
  'var(--skill)': '#6dd4a8',
  'var(--project)': '#7ec8e8',
  'var(--experience)': '#e87a6e',
}

export function branchColorToHex(cssColor: string): string {
  return BRANCH_COLORS[cssColor] ?? '#7eb8d4'
}

/* Official brand colors per SimpleIcons (icon slug -> hex) */
export const BRAND_COLORS: Record<string, string> = {
  react: '#61DAFB',
  nextdotjs: '#000000',
  tailwindcss: '#06B6D4',
  figma: '#F24E1E',
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  html5: '#E34F26',
  nodedotjs: '#339933',
  express: '#000000',
  fastapi: '#009688',
  flask: '#000000',
  mongodb: '#47A248',
  firebase: '#FFCA28',
  postgresql: '#4169E1',
  python: '#3776AB',
  pytorch: '#EE4C2C',
  tensorflow: '#FF6F00',
  scikitlearn: '#F89939',
  numpy: '#013243',
  pandas: '#150458',
  keras: '#D00000',
}

export const THEME_ACCENT = '#4F8CFF'
export const WIREFRAME_RADIUS = 1.4
export const SECONDS_PER_DAY = 86400
export const GLOBE_ROTATION_SPEED = 0.12 // rad/s – visible spin on top of time-sync

