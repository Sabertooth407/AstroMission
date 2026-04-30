<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let serial = "";
  export let damage = 0;
  export let active = false;

  const COLORS = ["red", "blue", "green", "yellow"];

  let sequence = [];
  let player = [];
  let flashing = false;
  let activeColor = null;
  let solved = false;
let showRestart = false;
  let runId = 0;
  let locked = false;

  function hasVowel() {
    return /[AEIOU]/.test(serial);
  }

  function mapColor(input) {
    const vowel = hasVowel();

    const maps = vowel
      ? [
          { red: "blue", blue: "red", green: "yellow", yellow: "green" },
          { red: "yellow", blue: "green", green: "blue", yellow: "red" },
          { red: "green", blue: "red", green: "yellow", yellow: "yellow" }
        ]
      : [
          { red: "blue", blue: "yellow", green: "green", yellow: "red" },
          { red: "red", blue: "blue", green: "yellow", yellow: "green" },
          { red: "yellow", blue: "green", green: "blue", yellow: "red" }
        ];

    return maps[Math.min(damage, 2)][input];
  }

  function nextRound() {
    sequence.push(COLORS[Math.floor(Math.random() * 4)]);
    player = [];
    playSequence();
  }

  async function playSequence() {
    const currentRun = ++runId;

    flashing = true;

    for (let c of sequence) {
      if (currentRun !== runId) return;

      activeColor = c;
      await wait(500);

      if (currentRun !== runId) return;

      activeColor = null;
      await wait(300);
    }

    if (currentRun !== runId) return;

    flashing = false;
  }

  function press(color) {
    flashClick(color);
    if (!active || flashing || solved || locked) return;

    const expected = mapColor(sequence[player.length]);

    if (color !== expected) {
  dispatch("strike");

  locked = true;
  showRestart = true;

  runId++;          // stop sequence
  activeColor = null;
  flashing = false;

  sequence = [];
  player = [];

  return;
}

    player.push(color);

    if (player.length === sequence.length) {
      if (sequence.length === 4) {
        // ✅ CLEAN SUCCESS (IMPORTANT FIX)
        solved = true;
        activeColor = null;   // 🔥 remove highlight instantly
        flashing = false;
        runId++;              // cancel any pending animation

        dispatch("success");
      } else {
        setTimeout(nextRound, 500);
      }
    }
  }

  function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 🚀 start only when active
  $: if (active && sequence.length === 0 && !solved && !locked) {
    nextRound();
  }

let clickFlash = null;

function flashClick(color) {
  clickFlash = color;

  setTimeout(() => {
    if (clickFlash === color) {
      clickFlash = null;
    }
  }, 150);
}

function restartModule() {
  showRestart = false;
  locked = false;

  if (active && !solved) {
    nextRound();
  }
}
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }

  .panel {
    width: 100%;
    height: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    gap: 10px;
    padding: 10px;
    box-sizing: border-box;

    background: #1a2a3a;
    border-radius: 10px;

    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.6),
      0 0 10px rgba(0,150,255,0.2);

    opacity: 0.5;
    transition: 0.2s;
  }

  .panel.active {
    opacity: 1;
  }

  .btn {
    width: 100%;
    height: 100%;

    border-radius: 10px;
    cursor: pointer;

    transition: 0.15s;
    opacity: 0.7;
  }

  .btn.active {
    opacity: 1;
    box-shadow: 0 0 25px currentColor;
    transform: scale(0.95);
  }

  .red { background: red; }
  .blue { background: #00aaff; }
  .green { background: #00ff88; }
  .yellow { background: #ffd500; }


/* sequence flash (existing logic) */
.btn.sequence {
  opacity: 1;
  box-shadow: 0 0 25px currentColor;
  transform: scale(0.95);
}

/* 🔥 NEW CLICK FEEDBACK */
.btn.click {
  opacity: 1;
  transform: scale(0.9);
  box-shadow:
    0 0 20px currentColor,
    inset 0 0 20px rgba(255,255,255,0.4);

  transition: 0.1s;
}

/* smoother animation */
.btn {
  transition:
    transform 0.08s ease,
    box-shadow 0.1s ease,
    opacity 0.1s ease;
}
/* overlay */
.restart-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 10;
}

/* box */
.restart-box {
  background: #1a2a3a;
  padding: 20px 30px;
  border-radius: 10px;

  text-align: center;

  box-shadow: 0 0 20px red;
}

/* strike text */
.strike-text {
  color: red;
  font-weight: bold;
  margin-bottom: 15px;
  letter-spacing: 2px;
  animation: blink 1s infinite;
}

/* button */
.restart-btn {
  padding: 10px 20px;
  background: red;
  border: none;
  border-radius: 5px;

  color: white;
  font-weight: bold;
  cursor: pointer;
}

.restart-btn:hover {
  box-shadow: 0 0 10px red;
}

@keyframes blink {
  0%,100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@media (max-width: 900px) {

  .panel {
    gap: 14px;           /* 🔥 more spacing between buttons */
    padding: 12px;
  }

  .btn {
    border-radius: 12px;
    opacity: 0.85;
  }

}
@media (max-width: 900px) {

  .btn:active {
    transform: scale(0.85);
    box-shadow:
      0 0 25px currentColor,
      inset 0 0 25px rgba(255,255,255,0.5);
  }

}
@media (max-width: 900px) {

  .wrapper {
    transform: scale(0.92);   /* 🔥 fits better inside panel */
    transform-origin: center;
  }

}
@media (max-width: 900px) {

  .restart-box {
    padding: 14px 18px;
  }

  .restart-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .strike-text {
    font-size: 14px;
  }

}
.btn {
  touch-action: manipulation;
}
</style>

<div class="wrapper">
  <div class="panel {active ? 'active' : ''}">

    {#each COLORS as c}
      <div
        class="btn {c} 
  {activeColor === c ? 'sequence' : ''} 
  {clickFlash === c ? 'click' : ''}"
        on:click={() => press(c)}
      ></div>
    {/each}

  </div>
  {#if showRestart}
  <div class="restart-overlay">
    <div class="restart-box">
      <div class="strike-text">⚠ STRIKE</div>

      <button class="restart-btn" on:click={restartModule}>
        RESTART MODULE
      </button>
    </div>
  </div>
{/if}
</div>