<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let fuel = 0;
  export let indicator = "";
  export let timeLeft = 0;

  let buttonColor = "";
  let label = "";
  let holding = false;
  let stripColor = "";
  let solved = false;
  let pressTime = 0;
const TAP_THRESHOLD = 200; // ms

  const COLORS = ["blue", "white", "yellow", "red"];
  const LABELS = ["CANCEL", "BOOST", "STABILIZE", "ABORT"];

  function randomize() {
    buttonColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    label = LABELS[Math.floor(Math.random() * LABELS.length)];
  }

  function shouldHold() {
    if (buttonColor === "blue" && label === "CANCEL") return true;
    if (fuel > 1 && label === "BOOST") return false;
    if (buttonColor === "white" && indicator === "NAV") return true;
    if (fuel > 2 && indicator === "ENG") return false;
    if (buttonColor === "yellow") return true;
    if (buttonColor === "red" && label === "STABILIZE") return false;
    return true;
  }

  function getReleaseDigit() {
    if (stripColor === "blue") return "4";
    if (stripColor === "white") return "1";
    if (stripColor === "yellow") return "5";
    return "1";
  }
export let active = false;
  function press() {
  if (!active || solved) return;

  pressTime = Date.now();

  if (shouldHold()) {
    // don't trigger immediately — wait for hold confirmation
    holding = true;
    stripColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
}

  function release() {
  if (!active || solved) return;

  const duration = Date.now() - pressTime;

  // 🟢 TAP CASE
  if (!shouldHold()) {
    if (duration < TAP_THRESHOLD) {
      solved = true;
      dispatch("success");
    } else {
      dispatch("strike"); // held too long
    }
    return;
  }

  // 🔵 HOLD CASE
  if (holding) {
    const digit = getReleaseDigit();
    const timeStr = String(timeLeft);

    if (timeStr.includes(digit)) {
      solved = true;
      dispatch("success");
    } else {
      dispatch("strike");
    }

    holding = false;
  }
}

  randomize();


function getTextColor(color) {
  if (color === "white" || color === "yellow") return "#000";
  return "#fff";
}
</script>

<style>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* PANEL HOUSING */
.panel {
  width: 100%;
  height: 100%;
  max-width: 220px;
  max-height: 180px;

  background: #1a2a3a;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: space-around;

  box-shadow:
    inset 0 0 20px rgba(0,0,0,0.6),
    0 0 15px rgba(0,150,255,0.2);
}

/* BUTTON */
.button {
  width: 50%;
  aspect-ratio: 1;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: bold;
  color: white;

  cursor: pointer;
  user-select: none;

  box-shadow:
    inset 0 -8px 15px rgba(0,0,0,0.5),
    0 0 15px currentColor;

  transition: 0.1s;
}

/* PRESS EFFECT */
.button:active {
  transform: translateY(4px);
  box-shadow:
    inset 0 -2px 5px rgba(0,0,0,0.8);
}

/* LABEL TEXT */
.button span {
  pointer-events: none;
}

/* STRIP HOUSING */
.strip {
  width: 18%;
  height: 70%;

  background: #0a1622;
  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: inset 0 0 10px black;
}

/* LIGHT INSIDE STRIP */
.light {
  width: 60%;
  height: 80%;

  border-radius: 4px;
  opacity: 0.15;

  transition: 0.2s;
}

/* ACTIVE LIGHT */
.light.on {
  opacity: 1;
  box-shadow: 0 0 20px currentColor;
}

/* SOLVED TEXT */
.solved {
  margin-top: 12px;
  color: #00ff88;
  font-weight: bold;
}

@media (max-width: 900px) {

  .panel {
    padding: 8px;
    gap: 10px;
  }

  .button {
    width: 55%;   /* slightly bigger for touch */
  }

  .strip {
    width: 20%;
    height: 75%;
  }

  .button span {
    font-size: 12px;  /* prevent overflow */
    text-align: center;
  }

}
</style>

<div class="wrapper">

  <div class="panel">

    <!-- BUTTON -->
    <div
      class="button"
      style="background:{buttonColor}; color:{getTextColor(buttonColor)}"
      on:mousedown={press}
on:mouseup={release}
on:mouseleave={release}

on:touchstart={press}
on:touchend={release}
    >
      <span>{label}</span>
    </div>

    <!-- SIDE STRIP (ALWAYS PRESENT, JUST LIGHTS UP) -->
    <div class="strip">
      <div
        class="light {holding ? 'on' : ''}"
        style="background:{stripColor}"
      ></div>
    </div>

  </div>


</div>