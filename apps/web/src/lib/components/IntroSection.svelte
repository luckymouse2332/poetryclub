<script lang="ts">
  export let title: string;
  export let titleColor: string = 'text-base-content';
  export let textColor: string = 'text-base-content/80';
  export let bgGradient: string = 'bg-gradient-to-br from-base-200 to-base-300';
  export let borderColor: string = 'border-base-300';
  export let accentColor: string = 'text-primary';
</script>

<section
  class="mb-8 p-6 {bgGradient} rounded-lg border-2 {borderColor} shadow-lg hover:shadow-xl transition-all duration-300"
>
  <h2 class="text-2xl font-bold mb-4 font-kai {titleColor} relative">
    <span class="inline-block w-1 h-6 {accentColor} bg-current mr-3 rounded"
    ></span>
    {title}
  </h2>
  <div class="leading-relaxed text-lg {textColor} font-medium">
    <slot />
  </div>
</section>
