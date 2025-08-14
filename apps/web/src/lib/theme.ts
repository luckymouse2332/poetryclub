import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ThemeMode = 'light' | 'dark';

// 主题加载状态store
export const themeLoading = writable(true);
export const themeReady = writable(false);

// 诗社主题配置
export const poetryTheme = {
  light: {
    // 主要颜色
    primary: 'rgb(217 119 6)', // amber-600
    secondary: 'rgb(234 88 12)', // orange-600
    accent: 'rgb(220 38 38)', // red-600

    // 表面颜色
    surface: 'rgb(255 251 235)', // amber-50
    'surface-100': 'rgb(254 243 199)', // amber-100
    'surface-200': 'rgb(252 211 77)', // amber-300 - 更深的黄色以提供更好的对比度
    'surface-300': 'rgb(245 158 11)', // amber-500

    // 文本颜色
    'text-primary': 'rgb(146 64 14)', // amber-800
    'text-secondary': 'rgb(180 83 9)', // amber-700
    'text-muted': 'rgb(217 119 6)', // amber-600

    // 边框颜色
    border: 'rgb(251 191 36)', // amber-400
    'border-light': 'rgb(253 230 138)', // amber-200

    // 卡片背景
    'card-bg': 'rgb(254 243 199)', // amber-100
    'card-hover': 'rgb(253 230 138)', // amber-200

    // 按钮颜色
    'btn-primary': 'rgb(217 119 6)', // amber-600
    'btn-primary-hover': 'rgb(180 83 9)', // amber-700
    'btn-secondary': 'rgb(253 230 138)', // amber-200
    'btn-secondary-hover': 'rgb(252 211 77)', // amber-300

    // 导航栏背景 - 更浅的颜色
    'navbar-bg': 'rgb(254 243 199)', // amber-100

    // 输入框背景 - 使用稍深的amber色调，保持协调性
    'input-bg': 'rgb(253 230 138)', // amber-200

    // 标题背景
    'header-bg': 'rgb(251 191 36)', // amber-400
  },
  dark: {
    // 主要颜色
    primary: 'rgb(100 116 139)', // slate-500
    secondary: 'rgb(71 85 105)', // slate-600
    accent: 'rgb(51 65 85)', // slate-700

    // 表面颜色
    surface: 'rgb(15 23 42)', // slate-900
    'surface-100': 'rgb(30 41 59)', // slate-800
    'surface-200': 'rgb(51 65 85)', // slate-700
    'surface-300': 'rgb(71 85 105)', // slate-600

    // 文本颜色
    'text-primary': 'rgb(226 232 240)', // slate-200
    'text-secondary': 'rgb(203 213 225)', // slate-300
    'text-muted': 'rgb(148 163 184)', // slate-400

    // 边框颜色
    border: 'rgb(100 116 139)', // slate-500
    'border-light': 'rgb(71 85 105)', // slate-600

    // 卡片背景
    'card-bg': 'rgb(30 41 59)', // slate-800
    'card-hover': 'rgb(51 65 85)', // slate-700

    // 按钮颜色
    'btn-primary': 'rgb(100 116 139)', // slate-500
    'btn-primary-hover': 'rgb(71 85 105)', // slate-600
    'btn-secondary': 'rgb(51 65 85)', // slate-700
    'btn-secondary-hover': 'rgb(71 85 105)', // slate-600

    // 导航栏背景
    'navbar-bg': 'rgb(30 41 59)', // slate-800

    // 输入框背景 - 使用稍浅的slate色调
    'input-bg': 'rgb(71 85 105)', // slate-600

    // 标题背景
    'header-bg': 'rgb(71 85 105)', // slate-600
  },
};

// 应用主题到CSS变量
export function applyTheme(mode: ThemeMode, skipLoadingState = false) {
  if (!browser) return;

  const theme = poetryTheme[mode];
  const root = document.documentElement;

  // 设置CSS变量
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--poetry-${key}`, value);
  });

  // 设置主题模式类
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'poetry-theme');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'poetry-theme');
  }

  // 如果不跳过加载状态，则标记主题已加载
  if (!skipLoadingState) {
    markThemeLoaded();
  }
}

// 获取当前主题模式
export function getCurrentTheme(): ThemeMode {
  if (!browser) return 'light';

  const saved = localStorage.getItem('poetry-theme');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }

  // 如果没有保存的主题，默认使用浅色模式
  const defaultTheme: ThemeMode = 'light';

  // 保存默认主题到localStorage
  localStorage.setItem('poetry-theme', defaultTheme);

  return defaultTheme;
}

// 保存主题到本地存储
export function saveTheme(mode: ThemeMode) {
  if (!browser) return;
  localStorage.setItem('poetry-theme', mode);
}

// 切换主题
export function toggleTheme(): ThemeMode {
  const current = getCurrentTheme();
  const newMode = current === 'dark' ? 'light' : 'dark';

  applyTheme(newMode);
  saveTheme(newMode);

  return newMode;
}

// 标记主题加载完成
export function markThemeLoaded() {
  if (!browser) return;

  // 更新store状态
  themeLoading.set(false);
  themeReady.set(true);

  // 添加主题加载完成的CSS类
  document.body.classList.add('theme-loaded');

  // 隐藏加载遮罩
  const loadingOverlay = document.getElementById('theme-loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      loadingOverlay.remove();
    }, 300);
  }
}

// 异步初始化主题
export async function initTheme(): Promise<ThemeMode> {
  if (!browser) return 'light';

  // 设置初始加载状态
  themeLoading.set(true);
  themeReady.set(false);

  // 模拟主题加载延迟，确保LoadingSpinner能够显示
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mode = getCurrentTheme();
  applyTheme(mode);

  return mode;
}

// 快速初始化主题（用于app.html中的预设）
export function initThemeSync(): ThemeMode {
  const mode = getCurrentTheme();
  applyTheme(mode, true); // 跳过加载状态
  return mode;
}
