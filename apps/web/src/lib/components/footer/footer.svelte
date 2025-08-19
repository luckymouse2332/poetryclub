<script>
  // 可配置的属性
  export let siteName;
  export let icpNumber;

  // 获取当前年份用于版权信息
  const currentYear = new Date().getFullYear();
</script>

<footer class="footer footer-center p-4 bg-base-200 text-base-content">
  <div class="flex flex-col items-center">
    <p class="mb-1">
      © {currentYear} <a href="/about" class="link link-hover">{siteName}</a> 版权所有
    </p>
    <p>
      <a
        href="https://beian.miit.gov.cn"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover hover:underline"
      >
        {icpNumber}
      </a>
    </p>
  </div>
</footer>
