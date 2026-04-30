<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let teamName = "";
  let member1 = "";
  let member2 = "";

  let loading = false;
  let error = "";

  let fuel = 78;

  setInterval(() => {
    fuel = Math.max(60, fuel + (Math.random() * 4 - 2));
  }, 1200);

  async function start() {
    error = "";

    if (!teamName || !member1 || !member2) {
      error = "All crew members required";
      return;
    }

    loading = true;

    const teamId = Date.now().toString();

    const payload = {
      teamId,
      teamName,
      member1,
      member2,
      type: "ENTRY"
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbxytICDtpJuj6qWckALpMrHGrqpH7N84ZKEN6eJwzmZNAIbrkOcxDLC_e1OACJFj6c0Lw/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("team", JSON.stringify(payload));
      dispatch("start");

    } catch (e) {
      console.log(e);
    }

    loading = false;
  }
</script>

<style>
  .container {
    position: relative;
    height: 100vh; /* desktop stays same */
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
    background-size: 2px 2px;
    opacity: 0.05;
    animation: drift 60s linear infinite;
  }

  .particles {
    position: absolute;
    width: 200%;
    height: 200%;
    background-image: radial-gradient(circle, #4fd1ff 1px, transparent 1px);
    background-size: 120px 120px;
    opacity: 0.05;
    animation: drift 40s linear infinite;
  }

  @keyframes drift {
    from { transform: translate(0, 0); }
    to { transform: translate(-200px, -200px); }
  }

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

  .glow {
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0,150,255,0.12), transparent 70%);
    filter: blur(80px);
  }

  /* DESKTOP BASE */
  .card {
    width: 340px;
    padding: 35px;
    border-radius: 10px;

    background: rgba(0, 20, 40, 0.65);
    backdrop-filter: blur(12px);

    box-shadow:
      0 0 25px rgba(79, 209, 255, 0.15),
      inset 0 0 20px rgba(79, 209, 255, 0.08);

    z-index: 2;
  }

  h2 {
    text-align: center;
    margin-bottom: 10px;
    letter-spacing: 1px;
    animation: glowPulse 2s infinite ease-in-out;
  }

  @keyframes glowPulse {
    0%,100% { text-shadow: 0 0 6px #4fd1ff; }
    50% { text-shadow: 0 0 15px #00c6ff; }
  }

  .subtitle {
    font-size: 12px;
    opacity: 0.6;
    text-align: center;
    margin-bottom: 15px;
  }

  input {
    width: 100%;
    margin: 10px 0;
    padding: 10px;
    font-size: 16px; /* 🔥 fixes zoom */

    background: rgba(0, 10, 20, 0.9);
    border: 1px solid rgba(79, 209, 255, 0.4);
    border-radius: 5px;

    color: #4fd1ff;
    outline: none;
  }

  input:focus {
    border-color: #4fd1ff;
    box-shadow: 0 0 10px rgba(79, 209, 255, 0.7);
  }

  button {
    width: 100%;
    margin-top: 15px;
    padding: 14px;
    border-radius: 5px;

    background: linear-gradient(90deg, #00c6ff, #0072ff);
    color: white;
    font-weight: bold;

    cursor: pointer;
  }

  .error {
    color: #ff4d4d;
    font-size: 12px;
    margin-top: 5px;
  }

  .hud {
    position: absolute;
    left: 20px;
    bottom: 20px;
    font-size: 10px;
    opacity: 0.3;
  }

  /* 🔥 MOBILE ONLY FIXES */
  @media (max-width: 900px) {

    .container {
      height: 100dvh;
      overflow-y: auto;
      padding: 20px;
      align-items: flex-start;
    }

    .card {
      width: min(90vw, 380px);
      padding: 25px;
      margin-top: 40px;
    }
  }

  /* 🔥 LANDSCAPE LOCK */
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
  }

  @media (orientation: portrait) {
    .orientation-lock {
      display: flex;
    }
  }
</style>

<div class="container">

  <div class="stars"></div>
  <div class="particles"></div>
  <div class="scan"></div>
  <div class="glow"></div>

  <div class="card">
    <h2>Mission Entry</h2>
    <div class="subtitle">Initialize crew systems</div>

    <input placeholder="Team Name" bind:value={teamName} />
    <input placeholder="Crew Member 1" bind:value={member1} />
    <input placeholder="Crew Member 2" bind:value={member2} />

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <button on:pointerdown={start} disabled={loading}>
      {loading ? "Linking Systems..." : "START MISSION"}
    </button>
  </div>

  <div class="hud">
    FUEL: {fuel.toFixed(0)}% | NAV: READY | CORE: STABLE
  </div>

  <!-- landscape lock -->
  <div class="orientation-lock">
    <div style="font-size:40px;">📱↻</div>
    <div>Rotate to landscape</div>
  </div>

</div>