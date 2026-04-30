<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let serial = "";

  let lines = [];
  let count = 0;
  let solved = false;

  const COLORS = ["red", "blue", "yellow", "white", "black"];

  function randomLines() {
    count = Math.floor(Math.random() * 4) + 3;

    lines = Array.from({ length: count }, () => ({
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      cut: false,
      tapped: false
    }));
  }

  function lastDigitOdd() {
    const digits = serial.replace(/\D/g, "");
    if (!digits.length) return false;
    return parseInt(digits[digits.length - 1]) % 2 === 1;
  }

  function solveIndex() {
    const colors = lines.map(l => l.color);

    const reds = colors.filter(c => c === "red").length;
    const blues = colors.filter(c => c === "blue").length;
    const yellows = colors.filter(c => c === "yellow").length;
    const whites = colors.filter(c => c === "white").length;
    const blacks = colors.filter(c => c === "black").length;

    const last = colors[count - 1];

    if (count === 3) {
      if (reds === 0) return 1;
      if (last === "white") return 2;
      if (blues > 1) return colors.lastIndexOf("blue");
      return 2;
    }

    if (count === 4) {
      if (reds > 1 && lastDigitOdd()) return colors.lastIndexOf("red");
      if (last === "yellow" && reds === 0) return 0;
      if (blues === 1) return 0;
      if (yellows > 1) return 3;
      return 1;
    }

    if (count === 5) {
      if (last === "black" && lastDigitOdd()) return 3;
      if (reds === 1 && yellows > 1) return 0;
      if (blacks === 0) return 1;
      return 0;
    }

    if (count === 6) {
      if (yellows === 0 && lastDigitOdd()) return 2;
      if (yellows === 1 && whites > 1) return 3;
      if (reds === 0) return 5;
      return 3;
    }
  }

export let active = false;

function cut(index) {
  if (!active || solved) return;

  if (lines[index].cut) return; // 🔥 prevent re-taps

  // 🔥 tap feedback
  lines[index].tapped = true;
  lines = [...lines];

  setTimeout(() => {
    lines[index].tapped = false;
    lines = [...lines];
  }, 180);

  if (index === solveIndex()) {
    lines[index].cut = true;
    solved = true;
    dispatch("success");
  } else {
    dispatch("strike");
  }
}

  randomLines();
</script>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
  }

  /* PANEL */
  .panel {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  background: #1a2a3a;
  border-radius: 10px;
  padding: 8px;

  box-sizing: border-box;

  overflow: hidden; /* 🔥 prevents overflow */

  box-shadow:
    inset 0 0 20px rgba(0,0,0,0.6),
    0 0 15px rgba(0,150,255,0.2);
}

  .title {
    font-size: 12px;
    opacity: 0.6;
    margin-bottom: 10px;
  }
@media (max-width: 900px) {

  .title {
    font-size: 10px;
    margin-bottom: 6px;
  }

}
  .lines {
  flex: 1; /* 🔥 take remaining space */

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;

  overflow: hidden;
}

@media (max-width: 900px) {

  .node {
    width: 8px;
    height: 8px;
    opacity: 0.6;
  }

}

  /* EACH WIRE ROW */
.row {
  display: flex;
  align-items: center;
  width: 100%;

  min-height: 0; /* 🔥 prevents overflow in flex */
}

  /* CONNECTORS */
  .node {
    width: 12px;
    height: 12px;
    background: #0a1622;
    border-radius: 50%;
    box-shadow: inset 0 0 5px black;
  }

  /* WIRE */
  .wire {
    flex: 1;
    height: 10px;
    border-radius: 5px;
    cursor: pointer;
    margin: 0 10px;
    position: relative;
    transition: 0.2s;
  }

  /* GLOSS EFFECT */
  .wire::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 5px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
  }

  .wire:hover {
    transform: scaleY(1.3);
    box-shadow: 0 0 12px currentColor;
  }

  /* CUT EFFECT */
  .wire.cut {
  background: #00ff88 !important;
  box-shadow: 0 0 10px #00ff88;
}

  /* COLOR FIXES */
  .wire.black {
    background: #222;
    border: 1px solid #555;
  }

  .wire.white {
    background: #eee;
    color: black;
  }

  .wire.red { background: red; }
  .wire.blue { background: #00aaff; }
  .wire.yellow { background: #ffd500; }

@media (max-width: 900px) {

  .wire {
    height: 12px;              /* 🔥 bigger tap target ONLY on phone */
    border-radius: 6px;
    margin: 4px 6px;         /* more spacing between wires */
    touch-action: manipulation;
  }

  .wire:hover {
    transform: none;           /* 🔥 disable useless hover on phone */
    box-shadow: none;
  }

  .wire:active {
    transform: scaleY(1.2);    /* 🔥 tap feedback */
    box-shadow: 0 0 10px currentColor;
  }

  .node {
    width: 14px;
    height: 14px;
  }

  .title {
    font-size: 13px;
    margin-bottom: 14px;
  }

}
@keyframes tapFlash {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.25); }
  100% { transform: scaleY(1); }
}

.wire.tapped {
  animation: tapFlash 0.18s ease;
}

@media (max-width: 900px) {

  .lines {
    gap: 4px;
  }

  .wire {
    margin: 6px 8px;
  }

}
</style>

<div class="wrapper">

  <div class="panel">
    <div class="title">POWER LINES</div>

    <div class="lines">
      {#each lines as line, i}
        <div class="row">

          <div class="node"></div>

          <div
            class="wire {line.color} {line.cut ? 'cut' : ''} {line.tapped ? 'tapped' : ''}"
            on:click={() => cut(i)}
          ></div>

          <div class="node"></div>

        </div>
      {/each}
    </div>

  </div>

</div>