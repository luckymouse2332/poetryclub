<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { authStore, currentUser, isAuthenticated } from '$lib/stores/auth';
  import { api } from '$lib/utils/request';
  import type { User, UpdateProfileRequest } from '$lib/types/auth';
  
  import MdiAccount from 'virtual:icons/mdi/account';
  import MdiPencil from 'virtual:icons/mdi/pencil';
  import MdiCheck from 'virtual:icons/mdi/check';
  import MdiClose from 'virtual:icons/mdi/close';
  import MdiCamera from 'virtual:icons/mdi/camera';
  import MdiLoading from 'virtual:icons/mdi/loading';

  // 状态管理
  let isEditing = $state(false);
  let isLoading = $state(false);
  let isSaving = $state(false);
  
  // 表单数据
  let formData = $state({
    name: '',
    bio: '',
    avatar: ''
  });
  
  // 原始数据（用于取消编辑时恢复）
  let originalData = $state({
    name: '',
    bio: '',
    avatar: ''
  });
  
  // 头像文件上传
  let avatarInput = $state<HTMLInputElement>();
  let previewAvatar = $state('');
  
  // 响应式获取当前用户
  $effect(() => {
    const user = $currentUser;
    if (user) {
      const userData = {
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      };
      formData = { ...userData };
      originalData = { ...userData };
      previewAvatar = user.avatar || '';
    }
  });
  
  // 检查认证状态
  onMount(() => {
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }
  });
  
  // 开始编辑
  function startEdit() {
    isEditing = true;
    // 保存原始数据
    originalData = { ...formData };
  }
  
  // 取消编辑
  function cancelEdit() {
    isEditing = false;
    // 恢复原始数据
    formData = { ...originalData };
    previewAvatar = originalData.avatar;
  }
  
  // 处理头像文件选择
  function handleAvatarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }
      
      // 验证文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        toast.error('图片大小不能超过2MB');
        return;
      }
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        previewAvatar = e.target?.result as string;
        formData.avatar = previewAvatar;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // 保存资料
  async function saveProfile() {
    if (!formData.name.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    
    isSaving = true;
    
    try {
      const updateData: UpdateProfileRequest = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar
      };
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新用户信息
      const updatedUser: User = {
        ...$currentUser!,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      authStore.updateUser(updatedUser);
      
      toast.success('资料更新成功');
      isEditing = false;
    } catch (error) {
      console.error('更新资料失败:', error);
      toast.error('更新失败，请稍后重试');
    } finally {
      isSaving = false;
    }
  }
  
  // 获取用户头像
  function getUserAvatar(avatar?: string) {
    if (previewAvatar) return previewAvatar;
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent($currentUser?.name || 'User')}&background=10b981&color=fff&size=200`;
  }
</script>

<svelte:head>
  <title>个人资料 - 回中诗社</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- 页面标题 -->
  <div class="flex items-center gap-3 mb-8">
    <MdiAccount class="w-8 h-8 text-primary" />
    <h1 class="text-3xl font-bold text-base-content">个人资料</h1>
  </div>
  
  {#if $currentUser}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 头像区域 -->
      <div class="lg:col-span-1">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body items-center text-center">
            <h2 class="card-title mb-4">头像</h2>
            
            <!-- 头像显示 -->
            <div class="avatar mb-4">
              <div class="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img 
                  src={getUserAvatar($currentUser.avatar)} 
                  alt={$currentUser.name}
                  class="rounded-full object-cover"
                />
              </div>
            </div>
            
            <!-- 头像上传 -->
            {#if isEditing}
              <div class="form-control w-full max-w-xs">
                <input 
                  type="file" 
                  accept="image/*"
                  class="file-input file-input-bordered file-input-primary file-input-sm w-full"
                  bind:this={avatarInput}
                  onchange={handleAvatarChange}
                />
                <div class="label">
                  <span class="label-text-alt text-base-content/60">支持 JPG、PNG 格式，最大 2MB</span>
                </div>
              </div>
            {:else}
              <button 
                class="btn btn-outline btn-primary btn-sm"
                onclick={startEdit}
              >
                <MdiCamera class="w-4 h-4" />
                更换头像
              </button>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- 基本信息区域 -->
      <div class="lg:col-span-2">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between mb-6">
              <h2 class="card-title">基本信息</h2>
              
              {#if !isEditing}
                <button 
                  class="btn btn-primary btn-sm"
                  onclick={startEdit}
                >
                  <MdiPencil class="w-4 h-4" />
                  编辑资料
                </button>
              {/if}
            </div>
            
            <div class="space-y-6">
              <!-- 用户名 -->
              <div class="form-control">
                <label class="label" for="username-input">
                  <span class="label-text font-medium">用户名</span>
                  <span class="label-text-alt text-error">*</span>
                </label>
                {#if isEditing}
                  <input 
                    id="username-input"
                    type="text" 
                    class="input input-bordered w-full"
                    bind:value={formData.name}
                    placeholder="请输入用户名"
                    maxlength="50"
                  />
                {:else}
                  <div class="p-3 bg-base-200 rounded-lg">
                    {$currentUser.name}
                  </div>
                {/if}
              </div>
              
              <!-- 邮箱（只读） -->
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-medium">邮箱地址</span>
                </div>
                <div class="p-3 bg-base-200 rounded-lg text-base-content/70">
                  {$currentUser.email}
                  <span class="text-xs ml-2">(不可修改)</span>
                </div>
              </div>
              
              <!-- 个人简介 -->
              <div class="form-control">
                <label class="label" for="bio-input">
                  <span class="label-text font-medium">个人简介</span>
                </label>
                {#if isEditing}
                  <textarea 
                    id="bio-input"
                    class="textarea textarea-bordered h-24 resize-none"
                    bind:value={formData.bio}
                    placeholder="介绍一下自己吧..."
                    maxlength="200"
                  ></textarea>
                  <div class="label">
                    <span class="label-text-alt">{formData.bio.length}/200</span>
                  </div>
                {:else}
                  <div class="p-3 bg-base-200 rounded-lg min-h-[6rem]">
                    {$currentUser.bio || '这个人很懒，什么都没有留下...'}
                  </div>
                {/if}
              </div>
              
              <!-- 注册时间 -->
              <div class="form-control">
                <div class="label">
                  <span class="label-text font-medium">注册时间</span>
                </div>
                <div class="p-3 bg-base-200 rounded-lg text-base-content/70">
                  {new Date($currentUser.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            {#if isEditing}
              <div class="card-actions justify-end mt-8 gap-3">
                <button 
                  class="btn btn-ghost"
                  onclick={cancelEdit}
                  disabled={isSaving}
                >
                  <MdiClose class="w-4 h-4" />
                  取消
                </button>
                <button 
                  class="btn btn-primary"
                  onclick={saveProfile}
                  disabled={isSaving || !formData.name.trim()}
                >
                  {#if isSaving}
                    <MdiLoading class="w-4 h-4 animate-spin" />
                    保存中...
                  {:else}
                    <MdiCheck class="w-4 h-4" />
                    保存更改
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- 加载状态 -->
    <div class="flex items-center justify-center py-20">
      <div class="text-center">
        <MdiLoading class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p class="text-base-content/60">加载中...</p>
      </div>
    </div>
  {/if}
</div>