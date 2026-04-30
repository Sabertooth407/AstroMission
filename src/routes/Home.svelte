<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let fuel = 78;
  let temp = 912;
  let status = "CRITICAL";

  let mouseX = 0;
  let mouseY = 0;

  function handleMouse(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  }

  // system noise
  setInterval(() => {
    fuel = Math.max(60, fuel + (Math.random() * 4 - 2));
    temp = Math.max(850, temp + (Math.random() * 20 - 10));
    status = Math.random() > 0.2 ? "CRITICAL" : "WARNING";
  }, 800);

  function enterFullscreen() {
  const el = document.documentElement;

  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}
</script>

<style>
* {
  touch-action: manipulation;
}
  .container {
    position: relative;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;

    display: flex;
    justify-content: center;
    align-items: center;

    background: #000814;
    color: #4fd1ff;
    font-family: monospace;
  }

  /* 🌌 stars */
  .stars {
    position: absolute;
    width: 200%;
    height: 200%;
    background-image: radial-gradient(white 1px, transparent 1px);
    background-size: 3px 3px;
    opacity: 0.05;
    animation: drift 60s linear infinite;
    transform: translate(var(--mx), var(--my));
  }

  /* particles */
  .particles {
    position: absolute;
    width: 200%;
    height: 200%;
    background-image: radial-gradient(circle, #4fd1ff 1px, transparent 1px);
    background-size: 120px 120px;
    opacity: 0.06;
    animation: drift 40s linear infinite;
    transform: translate(calc(var(--mx) * 0.5), calc(var(--my) * 0.5));
  }

  @keyframes drift {
    from { transform: translate(0, 0); }
    to { transform: translate(-200px, -200px); }
  }

  /* glow */
  .glow {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0,150,255,0.15), transparent 70%);
    filter: blur(80px);
  }

  /* scan */
  .scan {
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 2px,
      rgba(0, 200, 255, 0.03) 3px
    );
    animation: scanMove 6s linear infinite;
  }

  @keyframes scanMove {
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
  }

  /* radar pulse */
  .radar {
    position: absolute;
    width: 300px;
    height: 300px;
    border: 1px solid rgba(79,209,255,0.2);
    border-radius: 50%;
    animation: pulse 3s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  .panel {
    text-align: center;
    z-index: 2;
  }

  .logo {
    width: min(70vw, 500px);
    margin-bottom: 20px;
    filter: drop-shadow(0 0 20px #00c6ff);
  }

  h1 {
    font-size: 34px;
    letter-spacing: 3px;
    animation: glowPulse 2s infinite ease-in-out;
  }

  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 10px #4fd1ff; }
    50% { text-shadow: 0 0 30px #00c6ff; }
  }

  .subtitle {
    font-size: 13px;
    opacity: 0.6;
  }

  .status {
    margin-top: 15px;
    font-size: 11px;
    letter-spacing: 2px;
    animation: blink 1.5s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  button {
    position: relative;
    overflow: hidden;

    margin-top: 30px;
    padding: 14px 50px;

    background: linear-gradient(90deg, #00c6ff, #0072ff);
    border: none;
    border-radius: 6px;

    color: white;
    font-weight: bold;
    letter-spacing: 2px;

    cursor: pointer;
    transition: 0.2s;
  }

  button:hover {
    transform: scale(1.08);
    box-shadow: 0 0 25px rgba(0, 198, 255, 1);
  }

  button::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255,255,255,0.4),
      transparent
    );
    transform: translateX(-100%);
    animation: sweep 3s infinite;
  }

  @keyframes sweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* HUD */
  .hud {
    position: absolute;
    font-size: 11px;
    opacity: 0.25;
    letter-spacing: 1px;
  }

  .left {
    left: 20px;
    top: 30%;
  }

  .right {
    right: 20px;
    top: 30%;
    text-align: right;
  }

  .hud div {
    margin: 12px 0;
  }

  .footer {
    position: absolute;
    bottom: 10px;
    font-size: 10px;
    opacity: 0.3;
  }


  .orientation-lock {
  position: fixed;
  inset: 0;
  background: #000814;
  color: #4fd1ff;

  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  z-index: 999;
  text-align: center;
  font-family: monospace;
}

.orientation-lock span {
  font-size: 14px;
  opacity: 0.7;
}

/* 🔥 SHOW ONLY IN PORTRAIT */
@media (orientation: portrait) {
  .orientation-lock {
    display: flex;
  }
}
</style>

<div
  class="container"
  on:pointermove={handleMouse}
  style="--mx:{mouseX}px; --my:{mouseY}px;"
>

  <div class="stars"></div>
  <div class="particles"></div>
  <div class="scan"></div>
  <div class="glow"></div>
  <div class="radar"></div>

  <!-- LEFT HUD -->
  <div class="hud left">
    <div style="opacity:{Math.random() > 0.1 ? 0.25 : 0.05}">
      NAV SYS: ACTIVE
    </div>
    <div>FUEL: {fuel.toFixed(0)}%</div>
    <div style="opacity:{Math.random() > 0.1 ? 0.25 : 0.05}">
      COMMS: ONLINE
    </div>
  </div>

  <!-- RIGHT HUD -->
  <div class="hud right">
    <div>MISSION: ASC-26</div>
    <div>CORE TEMP: {temp.toFixed(0)}K</div>
    <div style="opacity:{Math.random() > 0.1 ? 0.25 : 0.05}">
      STATUS: {status}
    </div>
  </div>

  <!-- CENTER -->
  <div class="panel">
    <img src="/ascwhite.svg" class="logo" />

    <h1>SPACE CONTROL</h1>

    <div class="subtitle">
      Stabilize the spacecraft before system failure
    </div>

    <div class="status">SYSTEM STATUS: {status}</div>

    <button
      on:click={() =>{ enterFullscreen();
  dispatch("play");}}
      on:pointerdown={(e) => e.target.style.transform = "scale(0.95)"}
on:pointerup={(e) => e.target.style.transform = "scale(1.08)"}
    >
      ▶ START MISSION
    </button>
  </div>

  <div class="footer">
    AstroSpace Simulation Interface v1.0
  </div>
<div class="orientation-lock">
  <div style="font-size:40px;">📱↻</div>
  <span>Rotate your device to landscape</span>
</div>
</div>