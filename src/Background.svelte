<script>
  import { onMount } from "svelte";

  let stars = [];

  const COUNT = 800;

  onMount(() => {
    stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 2 + 0.5
    }));
  });
</script>

<style>
  .bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, #020617, #000000 80%);
    overflow: hidden;
  }

  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    opacity: 0.8;
    animation: twinkle 2s infinite alternate;
  }

  @keyframes twinkle {
    from { opacity: 0.2; }
    to { opacity: 1; }
  }
</style>

<div class="bg">
  {#each stars as s}
    <div
      class="star"
      style="
        left:{s.x}%;
        top:{s.y}%;
        width:{s.z}px;
        height:{s.z}px;
      "
    />
  {/each}
</div>