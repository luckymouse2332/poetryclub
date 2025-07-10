<script lang="ts">
  import { onMount } from 'svelte';

  let apiStatus = '检查中...';
  let apiUrl = 'http://localhost:3000';

  async function checkApiHealth() {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        apiStatus = `✅ 连接正常 (${data.timestamp})`;
      } else {
        apiStatus = '❌ 连接失败';
      }
    } catch (error) {
      apiStatus = '❌ 无法连接到API';
    }
  }

  onMount(() => {
    checkApiHealth();
  });
</script>

<svelte:head>
  <title>Poetry Club</title>
</svelte:head>

<main class="container">
  <h1>🎭 Poetry Club</h1>
  <p class="subtitle">欢迎来到诗歌俱乐部</p>
  
  <div class="status-card">
    <h2>系统状态</h2>
    <div class="status-item">
      <span class="label">前端:</span>
      <span class="value">✅ 运行正常</span>
    </div>
    <div class="status-item">
      <span class="label">后端API:</span>
      <span class="value">{apiStatus}</span>
    </div>
    <button on:click={checkApiHealth} class="refresh-btn">
      刷新状态
    </button>
  </div>

  <div class="features">
    <h2>功能特性</h2>
    <ul>
      <li>🎨 现代化UI设计</li>
      <li>⚡ 快速响应</li>
      <li>🔒 安全可靠</li>
      <li>📱 移动端适配</li>
    </ul>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  h1 {
    font-size: 3rem;
    color: #2c3e50;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    text-align: center;
    color: #7f8c8d;
    font-size: 1.2rem;
    margin-bottom: 3rem;
  }

  .status-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .status-card h2 {
    margin-top: 0;
    color: #2c3e50;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
  }

  .status-item:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 600;
    color: #495057;
  }

  .value {
    color: #28a745;
  }

  .refresh-btn {
    margin-top: 1rem;
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .refresh-btn:hover {
    background: #0056b3;
  }

  .features {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .features h2 {
    color: #2c3e50;
    margin-top: 0;
  }

  .features ul {
    list-style: none;
    padding: 0;
  }

  .features li {
    padding: 0.5rem 0;
    color: #495057;
    font-size: 1.1rem;
  }
</style> 