<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { authStore, currentUser, isAuthenticated } from '$lib/stores/auth';
  import { api } from '$lib/utils/request';
  import type { ChangePasswordRequest, NotificationPreferences, UserSettings } from '$lib/types/auth';
  
  import MdiCog from 'virtual:icons/mdi/cog';
  import MdiAccount from 'virtual:icons/mdi/account';
  import MdiBell from 'virtual:icons/mdi/bell';
  import MdiPalette from 'virtual:icons/mdi/palette';
  import MdiLock from 'virtual:icons/mdi/lock';
  import MdiEmail from 'virtual:icons/mdi/email';
  import MdiWeb from 'virtual:icons/mdi/web';
  import MdiComment from 'virtual:icons/mdi/comment';
  import MdiHeart from 'virtual:icons/mdi/heart';
  import MdiCheck from 'virtual:icons/mdi/check';
  import MdiLoading from 'virtual:icons/mdi/loading';
  import MdiEye from 'virtual:icons/mdi/eye';
  import MdiEyeOff from 'virtual:icons/mdi/eye-off';
  import MdiWhiteBalanceSunny from 'virtual:icons/mdi/white-balance-sunny';
  import MdiMoonWaningCrescent from 'virtual:icons/mdi/moon-waning-crescent';
  import MdiDesktopMac from 'virtual:icons/mdi/desktop-mac';

  // 状态管理
  let isLoading = $state(false);
  let isSaving = $state(false);
  let activeTab = $state<'account' | 'notifications' | 'theme'>('account');
  
  // 密码修改
  let showPasswordForm = $state(false);
  let passwordData = $state<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  let showPasswords = $state({
    current: false,
    new: false,
    confirm: false
  });
  
  // 通知设置
  let notificationSettings = $state<NotificationPreferences>({
    emailNotifications: true,
    siteNotifications: true,
    commentNotifications: true,
    likeNotifications: false
  });
  
  // 主题设置
  let themeSettings = $state<UserSettings>({
    theme: 'auto',
    notifications: {
      emailNotifications: true,
      siteNotifications: true,
      commentNotifications: true,
      likeNotifications: false
    }
  });
  
  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
    loadSettings();
  });
  
  // 加载设置
  async function loadSettings() {
    isLoading = true;
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟数据
      notificationSettings = {
        emailNotifications: true,
        siteNotifications: true,
        commentNotifications: true,
        likeNotifications: false
      };
      
      themeSettings = {
        theme: 'auto',
        notifications: notificationSettings
      };
    } catch (error) {
      console.error('加载设置失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      isLoading = false;
    }
  }
  
  // 修改密码
  async function changePassword() {
    // 验证表单
    if (!passwordData.currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('请输入新密码');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('新密码至少需要6位');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }
    
    isSaving = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('密码修改成功');
      
      // 重置表单
      passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      showPasswordForm = false;
    } catch (error) {
      console.error('修改密码失败:', error);
      toast.error('修改失败，请稍后重试');
    } finally {
      isSaving = false;
    }
  }
  
  // 保存通知设置
  async function saveNotificationSettings() {
    isSaving = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('通知设置保存成功');
    } catch (error) {
      console.error('保存通知设置失败:', error);
      toast.error('保存失败，请稍后重试');
    } finally {
      isSaving = false;
    }
  }
  
  // 切换主题
  function changeTheme(theme: 'light' | 'dark' | 'auto') {
    themeSettings.theme = theme;
    
    // 应用主题
    const html = document.documentElement;
    if (theme === 'auto') {
      // 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'night' : 'light');
    } else {
      html.setAttribute('data-theme', theme === 'dark' ? 'night' : 'light');
    }
    
    toast.success('主题设置已更新');
  }
  
  // 切换密码显示
  function togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    showPasswords[field] = !showPasswords[field];
  }
  
  // 取消密码修改
  function cancelPasswordChange() {
    passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    showPasswordForm = false;
  }
</script>

<svelte:head>
  <title>设置 - 回中诗社</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <!-- 页面标题 -->
  <div class="flex items-center gap-3 mb-8">
    <MdiCog class="w-8 h-8 text-primary" />
    <h1 class="text-3xl font-bold text-base-content">设置</h1>
  </div>
  
  {#if isLoading}
    <!-- 加载状态 -->
    <div class="flex items-center justify-center py-20">
      <div class="text-center">
        <MdiLoading class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p class="text-base-content/60">加载中...</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 侧边导航 -->
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body p-0">
            <ul class="menu menu-vertical">
              <li>
                <button 
                  class="{activeTab === 'account' ? 'active' : ''}"
                  onclick={() => activeTab = 'account'}
                >
                  <MdiAccount class="w-5 h-5" />
                  账号设置
                </button>
              </li>
              <li>
                <button 
                  class="{activeTab === 'notifications' ? 'active' : ''}"
                  onclick={() => activeTab = 'notifications'}
                >
                  <MdiBell class="w-5 h-5" />
                  通知偏好
                </button>
              </li>
              <li>
                <button 
                  class="{activeTab === 'theme' ? 'active' : ''}"
                  onclick={() => activeTab = 'theme'}
                >
                  <MdiPalette class="w-5 h-5" />
                  界面主题
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 设置内容 -->
      <div class="lg:col-span-3">
        {#if activeTab === 'account'}
          <!-- 账号设置 -->
          <div class="space-y-6">
            <!-- 基本信息 -->
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body">
                <h2 class="card-title mb-4">基本信息</h2>
                
                <div class="space-y-4">
                  <div class="form-control">
                    <div class="label">
                      <span class="label-text font-medium">用户名</span>
                    </div>
                    <div class="p-3 bg-base-200 rounded-lg">
                      {$currentUser?.name}
                    </div>
                    <div class="label">
                      <span class="label-text-alt text-base-content/60">
                        用户名可在个人资料页面修改
                      </span>
                    </div>
                  </div>
                  
                  <div class="form-control">
                    <div class="label">
                      <span class="label-text font-medium">邮箱地址</span>
                    </div>
                    <div class="p-3 bg-base-200 rounded-lg">
                      {$currentUser?.email}
                    </div>
                    <div class="label">
                      <span class="label-text-alt text-base-content/60">
                        邮箱地址用于登录和接收通知
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 密码设置 -->
            <div class="card bg-base-100 shadow-lg">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="card-title">密码设置</h2>
                  {#if !showPasswordForm}
                    <button 
                      class="btn btn-primary btn-sm"
                      onclick={() => showPasswordForm = true}
                    >
                      <MdiLock class="w-4 h-4" />
                      修改密码
                    </button>
                  {/if}
                </div>
                
                {#if showPasswordForm}
                  <div class="space-y-4">
                    <!-- 当前密码 -->
                    <div class="form-control">
                      <label class="label" for="current-password">
                        <span class="label-text font-medium">当前密码</span>
                        <span class="label-text-alt text-error">*</span>
                      </label>
                      <div class="input-group">
                        <input 
                          id="current-password"
                          type={showPasswords.current ? 'text' : 'password'}
                          class="input input-bordered flex-1"
                          bind:value={passwordData.currentPassword}
                          placeholder="请输入当前密码"
                        />
                        <button 
                          class="btn btn-square btn-outline"
                          onclick={() => togglePasswordVisibility('current')}
                        >
                          {#if showPasswords.current}
                            <MdiEyeOff class="w-4 h-4" />
                          {:else}
                            <MdiEye class="w-4 h-4" />
                          {/if}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 新密码 -->
                    <div class="form-control">
                      <label class="label" for="new-password">
                        <span class="label-text font-medium">新密码</span>
                        <span class="label-text-alt text-error">*</span>
                      </label>
                      <div class="input-group">
                        <input 
                          id="new-password"
                          type={showPasswords.new ? 'text' : 'password'}
                          class="input input-bordered flex-1"
                          bind:value={passwordData.newPassword}
                          placeholder="请输入新密码（至少6位）"
                          minlength="6"
                        />
                        <button 
                          class="btn btn-square btn-outline"
                          onclick={() => togglePasswordVisibility('new')}
                        >
                          {#if showPasswords.new}
                            <MdiEyeOff class="w-4 h-4" />
                          {:else}
                            <MdiEye class="w-4 h-4" />
                          {/if}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 确认新密码 -->
                    <div class="form-control">
                      <label class="label" for="confirm-password">
                        <span class="label-text font-medium">确认新密码</span>
                        <span class="label-text-alt text-error">*</span>
                      </label>
                      <div class="input-group">
                        <input 
                          id="confirm-password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          class="input input-bordered flex-1"
                          bind:value={passwordData.confirmPassword}
                          placeholder="请再次输入新密码"
                        />
                        <button 
                          class="btn btn-square btn-outline"
                          onclick={() => togglePasswordVisibility('confirm')}
                        >
                          {#if showPasswords.confirm}
                            <MdiEyeOff class="w-4 h-4" />
                          {:else}
                            <MdiEye class="w-4 h-4" />
                          {/if}
                        </button>
                      </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="flex items-center gap-3 pt-4">
                      <button 
                        class="btn btn-ghost"
                        onclick={cancelPasswordChange}
                        disabled={isSaving}
                      >
                        取消
                      </button>
                      <button 
                        class="btn btn-primary"
                        onclick={changePassword}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      >
                        {#if isSaving}
                          <MdiLoading class="w-4 h-4 animate-spin" />
                          修改中...
                        {:else}
                          <MdiCheck class="w-4 h-4" />
                          确认修改
                        {/if}
                      </button>
                    </div>
                  </div>
                {:else}
                  <p class="text-base-content/60">
                    为了账号安全，建议定期更换密码。密码应包含字母、数字，长度至少6位。
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {:else if activeTab === 'notifications'}
          <!-- 通知偏好 -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-6">通知偏好设置</h2>
              
              <div class="space-y-6">
                <!-- 邮件通知 -->
                <div class="form-control">
                  <label class="label cursor-pointer">
                    <div class="flex items-center gap-3">
                      <MdiEmail class="w-5 h-5 text-primary" />
                      <div>
                        <span class="label-text font-medium">邮件通知</span>
                        <div class="text-sm text-base-content/60">接收重要更新和活动通知邮件</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      class="toggle toggle-primary"
                      bind:checked={notificationSettings.emailNotifications}
                    />
                  </label>
                </div>
                
                <!-- 站内通知 -->
                <div class="form-control">
                  <label class="label cursor-pointer">
                    <div class="flex items-center gap-3">
                      <MdiWeb class="w-5 h-5 text-primary" />
                      <div>
                        <span class="label-text font-medium">站内通知</span>
                        <div class="text-sm text-base-content/60">在网站内显示通知消息</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      class="toggle toggle-primary"
                      bind:checked={notificationSettings.siteNotifications}
                    />
                  </label>
                </div>
                
                <!-- 评论通知 -->
                <div class="form-control">
                  <label class="label cursor-pointer">
                    <div class="flex items-center gap-3">
                      <MdiComment class="w-5 h-5 text-primary" />
                      <div>
                        <span class="label-text font-medium">评论通知</span>
                        <div class="text-sm text-base-content/60">有人评论你的诗歌时通知你</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      class="toggle toggle-primary"
                      bind:checked={notificationSettings.commentNotifications}
                    />
                  </label>
                </div>
                
                <!-- 点赞通知 -->
                <div class="form-control">
                  <label class="label cursor-pointer">
                    <div class="flex items-center gap-3">
                      <MdiHeart class="w-5 h-5 text-primary" />
                      <div>
                        <span class="label-text font-medium">点赞通知</span>
                        <div class="text-sm text-base-content/60">有人点赞你的诗歌时通知你</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      class="toggle toggle-primary"
                      bind:checked={notificationSettings.likeNotifications}
                    />
                  </label>
                </div>
              </div>
              
              <!-- 保存按钮 -->
              <div class="card-actions justify-end mt-8">
                <button 
                  class="btn btn-primary"
                  onclick={saveNotificationSettings}
                  disabled={isSaving}
                >
                  {#if isSaving}
                    <MdiLoading class="w-4 h-4 animate-spin" />
                    保存中...
                  {:else}
                    <MdiCheck class="w-4 h-4" />
                    保存设置
                  {/if}
                </button>
              </div>
            </div>
          </div>
        {:else if activeTab === 'theme'}
          <!-- 界面主题 -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-6">界面主题选择</h2>
              
              <div class="space-y-4">
                <!-- 浅色主题 -->
                <div class="form-control">
                  <label class="label cursor-pointer p-4 border rounded-lg {themeSettings.theme === 'light' ? 'border-primary bg-primary/10' : 'border-base-300'}">
                    <div class="flex items-center gap-4">
                      <MdiWhiteBalanceSunny class="w-8 h-8 text-warning" />
                      <div>
                        <div class="font-medium">浅色主题</div>
                        <div class="text-sm text-base-content/60">明亮清新的界面风格</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="theme" 
                      class="radio radio-primary"
                      checked={themeSettings.theme === 'light'}
                      onchange={() => changeTheme('light')}
                    />
                  </label>
                </div>
                
                <!-- 深色主题 -->
                <div class="form-control">
                  <label class="label cursor-pointer p-4 border rounded-lg {themeSettings.theme === 'dark' ? 'border-primary bg-primary/10' : 'border-base-300'}">
                    <div class="flex items-center gap-4">
                      <MdiMoonWaningCrescent class="w-8 h-8 text-info" />
                      <div>
                        <div class="font-medium">深色主题</div>
                        <div class="text-sm text-base-content/60">护眼舒适的暗色界面</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="theme" 
                      class="radio radio-primary"
                      checked={themeSettings.theme === 'dark'}
                      onchange={() => changeTheme('dark')}
                    />
                  </label>
                </div>
                
                <!-- 跟随系统 -->
                <div class="form-control">
                  <label class="label cursor-pointer p-4 border rounded-lg {themeSettings.theme === 'auto' ? 'border-primary bg-primary/10' : 'border-base-300'}">
                    <div class="flex items-center gap-4">
                      <MdiDesktopMac class="w-8 h-8 text-primary" />
                      <div>
                        <div class="font-medium">跟随系统</div>
                        <div class="text-sm text-base-content/60">根据系统设置自动切换主题</div>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="theme" 
                      class="radio radio-primary"
                      checked={themeSettings.theme === 'auto'}
                      onchange={() => changeTheme('auto')}
                    />
                  </label>
                </div>
              </div>
              
              <div class="alert alert-info mt-6">
                <MdiPalette class="w-5 h-5" />
                <span>主题设置会立即生效，并保存到您的浏览器中。</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>