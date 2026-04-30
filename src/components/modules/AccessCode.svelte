<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let active = false;

  const WORDS = [
    "align","array","boost","comet","delta",
    "earth","flare","gamma","laser","lever",
    "lunar","meter","orbit","pilot","probe",
    "radar","radio","relay","rover","scope",
    "sigma","solar","stage","titan","venus"
  ];

  let solution = "";
  let columns = [];
  let indices = [0,0,0,0,0];
  let solved = false;
  let initialized = false;

  function setup() {
    solution = WORDS[Math.floor(Math.random() * WORDS.length)];

    columns = Array.from({ length: 5 }, (_, i) => {
      let letters = new Set();
      letters.add(solution[i]);

      while (letters.size < 5) {
        const rand = WORDS[Math.floor(Math.random() * WORDS.length)];
        letters.add(rand[i]);
      }

      const arr = Array.from(letters);

      // shuffle
      for (let j = arr.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [arr[j], arr[k]] = [arr[k], arr[j]];
      }

      return arr;
    });

    indices = [0,0,0,0,0];

    while (getWord() === solution) {
      indices = indices.map((_, i) =>
        Math.floor(Math.random() * columns[i].length)
      );
    }
  }

  function change(i, dir) {
    if (!active || solved) return;

    const len = columns[i].length;
    indices[i] = (indices[i] + dir + len) % len;
  }

  function getWord() {
    return indices.map((v,i) => columns[i][v]).join("");
  }

  function submit(e) {
    e.stopPropagation();
    if (!active || solved) return;

    if (getWord() === solution) {
      solved = true;
      dispatch("success");
    } else {
      dispatch("strike");
    }
  }

  $: if (!initialized) {
    setup();
    initialized = true;
  }

  $: if (!active && initialized) {
  initialized = false;
}
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
  }

  .panel {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;

    background: #1a2a3a;
    border-radius: 10px;

    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.6),
      0 0 10px rgba(0,150,255,0.2);

    opacity: 0.6;
    transition: 0.2s;
  }

  .panel.active {
    opacity: 1;
  }

  .slots {
    display: flex;
    gap: 8px;
  }

  .slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .arrow {
    font-size: 14px;
    color: #4fd1ff;
    opacity: 0.3;
    transition: 0.15s;
  }

  .panel.active .arrow {
    opacity: 0.7;
    cursor: pointer;
  }

  .panel.active .arrow:hover {
    opacity: 1;
    transform: scale(1.3);
    text-shadow: 0 0 8px #00c6ff;
  }

  .letter {
    width: 42px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 26px;
    font-weight: bold;

    color: white;

    background: #020a14;
    border: 1px solid #4fd1ff;
    border-radius: 6px;

    box-shadow:
      inset 0 0 12px rgba(0,0,0,0.9),
      0 0 8px rgba(0,200,255,0.4);
  }

  .submit {
    margin-top: 8px;
    padding: 8px 22px;

    background: linear-gradient(90deg, #00c6ff, #0072ff);
    border: none;
    border-radius: 5px;

    color: white;
    font-weight: bold;
    letter-spacing: 1px;

    opacity: 0.4;
    transition: 0.2s;
  }

  .panel.active .submit {
    opacity: 1;
    cursor: pointer;
  }

  .panel.active .submit:hover {
    box-shadow: 0 0 12px #00c6ff;
    transform: scale(1.05);
  }
</style>

<div class="wrapper">
  <div class="panel {active ? 'active' : ''}">

    <div class="slots">
      {#each columns as col, i}
        <div class="slot">

          <div
            class="arrow"
            on:click={(e) => {
              e.stopPropagation();
              change(i, -1);
            }}
          >
            ▲
          </div>

          <div class="letter">
            {col[indices[i]]}
          </div>

          <div
            class="arrow"
            on:click={(e) => {
              e.stopPropagation();
              change(i, 1);
            }}
          >
            ▼
          </div>

        </div>
      {/each}
    </div>

    <button class="submit" on:click={submit}>
      SUBMIT
    </button>

  </div>
</div>