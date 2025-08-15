import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ThemeMode = 'light' | 'dark';

// 主题加载状态store
export const themeLoading = writable(true);
export const themeReady = writable(false);

// 诗社主题配置 - 完整的主题变量定义
export const poetryTheme = {
  light: {
    // ========== 基础颜色系统 ==========
    // 主要品牌色 - 用于重要按钮、链接和强调元素
    primary: 'rgb(217 119 6)', // amber-600 - 主品牌色
    secondary: 'rgb(234 88 12)', // orange-600 - 次要品牌色
    accent: 'rgb(220 38 38)', // red-600 - 强调色，用于错误和警告

    // ========== 表面颜色系统 ==========
    // 页面背景和容器背景色，从浅到深递增
    surface: 'rgb(255 251 235)', // amber-50 - 页面主背景
    'surface-100': 'rgb(254 243 199)', // amber-100 - 卡片和容器背景
    'surface-200': 'rgb(252 211 77)', // amber-300 - 悬停状态和次级容器
    'surface-300': 'rgb(245 158 11)', // amber-500 - 活跃状态和强调背景

    // ========== 文本颜色系统 ==========
    // 文本颜色层级，确保良好的可读性和层次感
    'text-primary': 'rgb(146 64 14)', // amber-800 - 主要文本，标题和重要内容
    'text-secondary': 'rgb(180 83 9)', // amber-700 - 次要文本，描述和说明
    'text-muted': 'rgb(217 119 6)', // amber-600 - 辅助文本，提示和标签

    // ========== 边框颜色系统 ==========
    // 用于分隔线、边框和轮廓
    border: 'rgb(251 191 36)', // amber-400 - 标准边框
    'border-light': 'rgb(253 230 138)', // amber-200 - 轻量边框

    // ========== 卡片系统 ==========
    // 通用卡片组件的背景色
    'card-bg': 'rgb(254 243 199)', // amber-100 - 卡片默认背景
    'card-hover': 'rgb(253 230 138)', // amber-200 - 卡片悬停背景

    // ========== 按钮系统 ==========
    // 按钮组件的颜色定义
    'btn-primary': 'rgb(217 119 6)', // amber-600 - 主要按钮
    'btn-primary-hover': 'rgb(180 83 9)', // amber-700 - 主要按钮悬停
    'btn-secondary': 'rgb(253 230 138)', // amber-200 - 次要按钮
    'btn-secondary-hover': 'rgb(252 211 77)', // amber-300 - 次要按钮悬停

    // ========== 导航系统 ==========
    // 导航栏专用背景色
    'navbar-bg': 'rgb(254 243 199)', // amber-100 - 导航栏背景

    // ========== 表单系统 ==========
    // 输入框和表单元素背景
    'input-bg': 'rgb(253 230 138)', // amber-200 - 输入框背景

    // ========== 页面标题系统 ==========
    // 页面头部和重要标题背景
    'header-bg': 'rgb(251 191 36)', // amber-400 - 标题背景

    // ========== 重要内容组件系统 ==========
    // 专门为AlertBox组件设计的突出颜色
    'alert-warning-bg': 'rgb(254 243 199)', // amber-100 - 警告框背景
    'alert-warning-border': 'rgb(245 158 11)', // amber-500 - 警告框边框，更突出
    'alert-warning-text': 'rgb(120 53 15)', // amber-900 - 警告框文本，更深色
    'alert-info-bg': 'rgb(239 246 255)', // blue-50 - 信息框背景
    'alert-info-border': 'rgb(59 130 246)', // blue-500 - 信息框边框
    'alert-info-text': 'rgb(30 58 138)', // blue-900 - 信息框文本
    'alert-success-bg': 'rgb(240 253 244)', // green-50 - 成功框背景
    'alert-success-border': 'rgb(34 197 94)', // green-500 - 成功框边框
    'alert-success-text': 'rgb(20 83 45)', // green-900 - 成功框文本
    'alert-error-bg': 'rgb(254 242 242)', // red-50 - 错误框背景
    'alert-error-border': 'rgb(239 68 68)', // red-500 - 错误框边框
    'alert-error-text': 'rgb(127 29 29)', // red-900 - 错误框文本

    // 专门为IntroSection组件设计的引人注目的颜色
    'intro-bg': 'rgb(255 247 237)', // orange-50 - 引言框背景，温暖色调
    'intro-border': 'rgb(251 146 60)', // orange-400 - 引言框边框，醒目橙色
    'intro-title': 'rgb(154 52 18)', // orange-900 - 引言标题，深橙色
    'intro-text': 'rgb(194 65 12)', // orange-800 - 引言文本，中等橙色
    'intro-accent': 'rgb(234 88 12)', // orange-600 - 引言强调色
  },
  dark: {
    // ========== 基础颜色系统 ==========
    // 深色主题的主要品牌色
    primary: 'rgb(100 116 139)', // slate-500 - 主品牌色
    secondary: 'rgb(71 85 105)', // slate-600 - 次要品牌色
    accent: 'rgb(51 65 85)', // slate-700 - 强调色

    // ========== 表面颜色系统 ==========
    // 深色主题的背景色层级
    surface: 'rgb(15 23 42)', // slate-900 - 页面主背景
    'surface-100': 'rgb(30 41 59)', // slate-800 - 卡片和容器背景
    'surface-200': 'rgb(51 65 85)', // slate-700 - 悬停状态和次级容器
    'surface-300': 'rgb(71 85 105)', // slate-600 - 活跃状态和强调背景

    // ========== 文本颜色系统 ==========
    // 深色主题的文本颜色层级
    'text-primary': 'rgb(226 232 240)', // slate-200 - 主要文本
    'text-secondary': 'rgb(203 213 225)', // slate-300 - 次要文本
    'text-muted': 'rgb(148 163 184)', // slate-400 - 辅助文本

    // ========== 边框颜色系统 ==========
    // 深色主题的边框色
    border: 'rgb(100 116 139)', // slate-500 - 标准边框
    'border-light': 'rgb(71 85 105)', // slate-600 - 轻量边框

    // ========== 卡片系统 ==========
    // 深色主题的卡片背景
    'card-bg': 'rgb(30 41 59)', // slate-800 - 卡片默认背景
    'card-hover': 'rgb(51 65 85)', // slate-700 - 卡片悬停背景

    // ========== 按钮系统 ==========
    // 深色主题的按钮颜色
    'btn-primary': 'rgb(100 116 139)', // slate-500 - 主要按钮
    'btn-primary-hover': 'rgb(71 85 105)', // slate-600 - 主要按钮悬停
    'btn-secondary': 'rgb(51 65 85)', // slate-700 - 次要按钮
    'btn-secondary-hover': 'rgb(71 85 105)', // slate-600 - 次要按钮悬停

    // ========== 导航系统 ==========
    // 深色主题的导航栏背景
    'navbar-bg': 'rgb(30 41 59)', // slate-800 - 导航栏背景

    // ========== 表单系统 ==========
    // 深色主题的输入框背景
    'input-bg': 'rgb(71 85 105)', // slate-600 - 输入框背景

    // ========== 页面标题系统 ==========
    // 深色主题的标题背景
    'header-bg': 'rgb(71 85 105)', // slate-600 - 标题背景

    // ========== 重要内容组件系统 ==========
    // 深色主题下AlertBox组件的突出颜色
    'alert-warning-bg': 'rgb(69 26 3)', // amber-900 - 深色警告框背景
    'alert-warning-border': 'rgb(217 119 6)', // amber-600 - 警告框边框
    'alert-warning-text': 'rgb(253 230 138)', // amber-200 - 警告框文本
    'alert-info-bg': 'rgb(30 58 138)', // blue-900 - 深色信息框背景
    'alert-info-border': 'rgb(59 130 246)', // blue-500 - 信息框边框
    'alert-info-text': 'rgb(191 219 254)', // blue-200 - 信息框文本
    'alert-success-bg': 'rgb(20 83 45)', // green-900 - 深色成功框背景
    'alert-success-border': 'rgb(34 197 94)', // green-500 - 成功框边框
    'alert-success-text': 'rgb(187 247 208)', // green-200 - 成功框文本
    'alert-error-bg': 'rgb(127 29 29)', // red-900 - 深色错误框背景
    'alert-error-border': 'rgb(239 68 68)', // red-500 - 错误框边框
    'alert-error-text': 'rgb(254 202 202)', // red-200 - 错误框文本

    // 深色主题下IntroSection组件的引人注目颜色
    'intro-bg': 'rgb(124 45 18)', // orange-900 - 深色引言框背景
    'intro-border': 'rgb(251 146 60)', // orange-400 - 引言框边框
    'intro-title': 'rgb(254 215 170)', // orange-200 - 引言标题
    'intro-text': 'rgb(253 186 116)', // orange-300 - 引言文本
    'intro-accent': 'rgb(251 146 60)', // orange-400 - 引言强调色
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
