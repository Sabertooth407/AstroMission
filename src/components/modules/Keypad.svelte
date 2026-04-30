<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let active = false;

  let symbols = [];
  let solution = [];
  let selected = [];
  let solved = false;

  // 🔥 MATCH THIS WITH YOUR REFERENCE IMAGE
  const COLUMNS = [
    ["s1","s7","s13","s19","s25","s31"],
    ["s2","s8","s14","s20","s26","s32"],
    ["s3","s9","s15","s21","s27","s33"],
    ["s4","s10","s16","s22","s28","s34"],
    ["s5","s11","s17","s23","s29","s35"],
    ["s6","s12","s18","s24","s30","s36"]
  ];

  function generate() {
  const column = COLUMNS[Math.floor(Math.random() * COLUMNS.length)];

  // pick 4 properly
  const picked = shuffle(column).slice(0, 4);

  // display order random
  symbols = shuffle(picked);

  // solution = correct order in column
  solution = column.filter(s => picked.includes(s));

  selected = [];
  solved = false;
}

  function press(sym) {
    if (!active || solved || selected.includes(sym)) return;

    selected = [...selected, sym];

    const correct = solution[selected.length - 1];

    if (sym !== correct) {
      dispatch("strike");
      selected = [];
      return;
    }

    if (selected.length === 4) {
      solved = true;
      dispatch("success");
    }
  }
  function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

  generate();
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 6px;
    box-sizing: border-box;
  }

  .panel {
    width: 100%;
    height: 100%;
    background: #1a2a3a;
    border-radius: 10px;
    padding: 6px;

    display: flex;
    justify-content: center;
    align-items: center;
overflow: hidden;
    opacity: 0.5;
    transition: 0.2s;

    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.6),
      0 0 10px rgba(0,150,255,0.2);
  }

  .panel.active {
    opacity: 1;
  }

  .panel.solved {
    box-shadow: 0 0 15px #00ff88;
  }

  .grid {
    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    gap: 6px;
    min-height: 0;
  }

  .key {
    background: #0a1622;
    border-radius: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    transition: 0.15s;
    overflow: hidden;
    min-width: 0;
  min-height: 0;
  }

  .panel:not(.active) .key {
    cursor: default;
  }

  .key:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px #00c6ff;
  }

  .panel:not(.active) .key:hover {
    transform: none;
    box-shadow: none;
  }

.key img {
  width: 80%;
  height: 80%;
  object-fit: contain;

  max-width: 100%;
  max-height: 100%;
}

  .key:active {
    transform: scale(0.92);
    box-shadow: 0 0 20px #00c6ff inset;
  }

  .key.selected {
    border: 2px solid #00c6ff;
    box-shadow: 0 0 12px #00c6ff;
  }

  @media (max-width: 900px) {

  .wrapper {
    padding: 4px;
  }

  .panel {
    padding: 4px;
  }

  .grid {
    gap: 4px;
  }

  .key img {
    width: 75%;
    height: 75%;
  }

}

@media (max-width: 900px) {
  .key:active {
    transform: scale(0.9);
  }
}
</style>

<div class="wrapper">
  <div class="panel {active ? 'active' : ''} {solved ? 'solved' : ''}">
    <div class="grid">
      {#each symbols as sym}
        <div
          class="key {selected.includes(sym) ? 'selected' : ''}"
          on:click={() => press(sym)}
on:touchstart={() => press(sym)}
        >
          <img src={`/keypad/${sym}.png`} alt={sym} />
        </div>
      {/each}
    </div>
  </div>
</div>