<script lang="ts">
  export let title: string;
  export let borderColor: string = 'border-base-300';
  export let textColor: string = 'text-base-content';
</script>

<section class="mb-8">
  <h2
    class="text-2xl font-semibold mb-4 font-kai border-b-2 {borderColor} pb-2"
  >
    {title}
  </h2>
  <div class="space-y-6 {textColor}">
    <slot />
  </div>
</section>
