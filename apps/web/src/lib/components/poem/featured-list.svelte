<script lang="ts">
  import MdiCardsHeartOutline from 'virtual:icons/mdi/cards-heart-outline';
  let {
    featuredPoems,
  }: {
    featuredPoems: Array<{
      title: string;
      author: string;
      preview: string;
      likes: number;
      id?: string;
    }>;
  } = $props();
</script>

<aside class="space-y-6">
  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h3 class="card-title text-2xl font-kai mb-4">
        今日推荐
      </h3>
      <div class="space-y-4">
        {#each featuredPoems as poem}
          <div class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div class="card-body p-4">
              <h4 class="card-title text-lg font-kai">
                {poem.title}
              </h4>
              <p class="text-sm text-base-content/70 mb-2 font-kai">
                {poem.author}
              </p>
              <p class="text-sm mb-3 font-kai">
                {poem.preview}
              </p>
              <div class="card-actions justify-between items-center">
                <span class="text-xs text-base-content/60 flex items-center gap-1">
                  <MdiCardsHeartOutline class="w-3 h-3" />
                  <span>{poem.likes}</span>
                </span>
                <a
                  href={`/poem/${poem.id}`}
                  class="btn btn-primary btn-xs"
                >
                  阅读
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</aside>