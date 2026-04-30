<script>
  import { onMount, createEventDispatcher, tick } from "svelte";
  import Background from "../Background.svelte";

  import PowerLines from "../components/modules/PowerLines.svelte";
  import Button from "../components/modules/Button.svelte";
  import SignalRelay from "../components/modules/SignalRelay.svelte";
  import AccessCode from "../components/modules/AccessCode.svelte";
  import Keypad from "../components/modules/Keypad.svelte";

  const dispatch = createEventDispatcher();
let bgMusic;
let bgStarted = false;
let voice = null;
let expandedPanel = null;

function isMobile() {
  return window.innerWidth < 900;
}

function openPanel(index) {
  if (isMobile() && !gameOver) {
    expandedPanel = index;
  }
}

function closePanel() {
  expandedPanel = null;
}

function initVoice() {
  const voices = speechSynthesis.getVoices();

  voice =
    voices.find(v => v.name.includes("Female")) ||
    voices.find(v => v.name.includes("Samantha")) ||
    voices.find(v => v.name.includes("Zira")) ||
    voices[0];
}

speechSynthesis.onvoiceschanged = initVoice;

function speak(text) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = voice;
  utter.rate = 1.05;
  utter.pitch = 1;
  utter.volume = 1;

  speechSynthesis.speak(utter);
}
function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
const HAPTICS = {
  STRIKE: [120, 40, 120, 40, 180],   // ⚠️ aggressive, alarming
  SUCCESS: [60, 40, 60],             // ✅ quick double pulse
  WIN: [80, 40, 80, 40, 200],        // 🎉 longer celebration
};
  let timeLeft = 420;
  let damage = 0;
  let strikeFlash = false;
  let showStrikeText = false;
  let activeModuleIndex = null;
  let alertAudio;
let alertStarted = false;
  let interval;
  let gameOver = false;
  let result = "";

  let serial = "";
  let indicator = "";
  let fuel = 0;
let terminalLines = [];
let teamData = null;
const TOTAL_HOURS = 63;
const SPEED = 1200; // km/h
const TOTAL_DISTANCE = TOTAL_HOURS * SPEED; // 75600
let distance = TOTAL_DISTANCE;

onMount(() => {
  const interval = setInterval(() => {
    // reduce based on real seconds (slow)
    distance -= SPEED / 3600; // km per second

    if (distance < 0) distance = 0;
  }, 1000);
});
onMount(() => {
  const stored = localStorage.getItem("team");
  if (stored) {
    teamData = JSON.parse(stored);
  }
});
  const INDICATORS = ["NAV", "COM", "ENG", "LIFE", "SYS"];

  const MODULES = [
    { name: "power", component: PowerLines },
    { name: "button", component: Button },
    { name: "signal", component: SignalRelay },
    { name: "access", component: AccessCode },
    { name: "keypad", component: Keypad }
  ];

  let activeModules = [];

  function pickModules() {
    const shuffled = [...MODULES].sort(() => 0.5 - Math.random());
    activeModules = shuffled.slice(0, 3).map((m, i) => ({
      id: i,
      name: m.name,
      component: m.component,
      solved: false
    }));
  }

  function generateSerial() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  function generateIndicator() {
    return INDICATORS[Math.floor(Math.random() * INDICATORS.length)];
  }

  function generateFuel() {
    return Math.floor(Math.random() * 4) + 1;
  }

  function generateTerminal() {
  const words = ["SYS", "NAV", "COM", "CHK", "RUN", "INIT", "LINK"];

  setInterval(() => {
    const linesNeeded = 20; // 🔥 fills panel

    const line =
      words[Math.floor(Math.random() * words.length)] +
      ">" +
      Math.random().toString(36).substring(2, 10).toUpperCase();

    terminalLines = [...terminalLines.slice(-linesNeeded), line];
  }, 120);
}

  onMount(() => {
    alertAudio = new Audio("/alert.mp3");
alertAudio.loop = true;
alertAudio.volume = 0.4;
    serial = generateSerial();
    indicator = generateIndicator();
    fuel = generateFuel();
bgMusic = new Audio("/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.15;
    pickModules();
    generateTerminal();
setTimeout(() => {
  speak("System initialized. All systems nominal. Communications stable.");
}, 500);
    interval = setInterval(() => {
  timeLeft--;

  // 🔊 PERFECTLY SYNCED COUNTDOWN
  if (timeLeft <= 10 && timeLeft > 0) {
    speak(timeLeft.toString());
  }

  if (timeLeft <= 0) endGame("LOSS");

}, 1000);

    
  });

  async function endGame(res) {
  clearInterval(interval);

  expandedPanel = null; // 🔥 FORCE CLOSE (more reliable than function)

  await tick(); // 🔥 IMPORTANT: wait for DOM update

  result = res;
  gameOver = true;
  if (!teamData) return;

  const payload = {
    type: "RESULT",                  // ✅ FIXED
    teamId: teamData.teamId,
    result: res,
    timeLeft,
    damage,
    completed: res === "WIN" ? "YES" : "NO"   // ✅ FIXED NAME
  };
  if (alertAudio) {
  alertAudio.pause();
  alertAudio.currentTime = 0;
}

  try {
    await fetch("https://script.google.com/macros/s/AKfycbxytICDtpJuj6qWckALpMrHGrqpH7N84ZKEN6eJwzmZNAIbrkOcxDLC_e1OACJFj6c0Lw/exec", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.log("Update failed", e);
  }
}

  function handleSuccess(index) {
    activeModules[index].solved = true;
    activeModules = [...activeModules];
    vibrate(HAPTICS.SUCCESS);
speak("Module complete");
    if (activeModules.every(m => m.solved)) {
      vibrate(HAPTICS.WIN);
      endGame("WIN");
    }
  }

  function handleStrike() {
    damage++;
vibrate(HAPTICS.STRIKE); 
    strikeFlash = true;
    showStrikeText = true;
speak("Warning. System failure detected");
    setTimeout(() => (strikeFlash = false), 400);
    setTimeout(() => (showStrikeText = false), 800);

    if (damage >= 3)
    {vibrate([200, 50, 200, 50, 300]);
      endGame("LOSS");}
  }
  window.addEventListener("click", () => {
  if (bgMusic && !bgStarted) {
    bgMusic.play().catch(() => {});
    bgStarted = true;
  }
});

  $: redAlert = timeLeft <= 120;
  $: {
  if (redAlert && alertAudio && !alertStarted) {
    alertAudio.play().catch(() => {});
    alertStarted = true;
  }

  if (!redAlert && alertAudio && alertStarted) {
    alertAudio.pause();
    alertAudio.currentTime = 0;
    alertStarted = false;
  }
}
let lastSpoken = null;

$: {
  if (timeLeft <= 10 && timeLeft > 0 && timeLeft !== lastSpoken) {
    lastSpoken = timeLeft;

    speak(timeLeft.toString());
  }
}
$: {
  if (redAlert && bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }

  if (!redAlert && bgMusic && bgStarted && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
}
$: progress = 0.15 + (1 - timeLeft / 420) * 0.1;
  
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&display=swap');

.container {
  height: 100vh;
  width: 100vw;
  position: relative;
  font-family: 'Orbitron', monospace;
  color: #4fd1ff;
}

.logo {
  position: absolute;
  top: 18px;
  left: 40px;
  height: 40px;
  object-fit: contain;
}

.timer {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);

  font-size: 72px;
  font-weight: 700;

  color: #ff2b2b;
  text-shadow:
    0 0 10px rgba(255,0,0,0.7),
    0 0 20px rgba(255,0,0,0.4);
}

/* DAMAGE */
.damage {
  position: absolute;
  top: 25px;
  right: 25px;
  display: flex;
  gap: 8px;
  z-index: 200;
}

@media (max-width: 900px) {
  .heart {
    width: 26px;
    height: 26px;
  }
}

.heart {
  width: 22px;
  height: 22px;
  border: 2px solid #00c6ff;
  position: relative;
}

.heart.active {
  border-color: red;
}

.heart.active::after {
  content: "✖";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
}

/* GRID */
.grid {
  position: absolute;
  top: 100px;
  left: 40px;
  right: 40px;
  bottom: 30px;

  display: grid;

  grid-template-columns: 1fr 1.2fr 1fr;
  grid-template-rows: 1fr 1fr;

  gap: 18px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
/* PANELS */
.panel {
  background: rgba(0,20,40,0.6);
  transform-origin: top left;
  border-radius: 12px;
  backdrop-filter: blur(6px);
  position: relative;
  overflow: hidden;
  padding: 10px;   /* ADD THIS */
}
@media (max-width: 900px) {
  .panel {
    padding: 6px;
  }
}

.panel-title {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 11px;
  opacity: 0.6;
}

.module {
  width: 100%;
  height: 100%;
   min-height: 0;   /* 🔥 THIS FIXES OVERFLOW */
  min-width: 0;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 900px) {
  .module {
    transform-origin: center;
  }
}

.module:hover {
  border: 2px solid #ffd500;
}

.module.active {
  border: 2px solid #00c6ff;
  transform: scale(0.97);
}
.module,
.fuel-system,
.nav-container,
.data-layout,
.terminal {
  min-height: 0;
}

.nav-container {
  overflow: hidden;
}
.module.solved {
  border: 3px solid #00ff88 !important;
  box-shadow: 0 0 12px #00ff88;
}

/* STRIKE */
.strike-overlay {
  position: fixed;   /* 🔥 change from absolute */
  inset: 0;
  z-index: 300;      /* 🔥 above EVERYTHING */

  background: radial-gradient(circle, rgba(255,0,0,0.9), transparent 70%);
  animation: strikeBlast 0.4s ease;
}

@keyframes strikeBlast {
  0%   { opacity: 0; transform: scale(1.3); }
  30%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}

.strike-text {
  position: fixed;   /* 🔥 same fix */
  z-index: 301;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  color: red;
  font-size: 60px;
  letter-spacing: 6px;

  text-shadow:
    0 0 10px red,
    0 0 25px red,
    0 0 50px rgba(255,0,0,0.8);

  animation: strikeFlash 0.6s;
}

@keyframes strikeFlash {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
}

/* ALERT */
.alert {
  position: absolute;
  inset: 0;
  pointer-events: none;

  /* 🔥 layered effect */
  background:
    radial-gradient(circle, rgba(255,0,0,0.4), transparent 60%),
    linear-gradient(90deg, rgba(255,0,0,0.2), transparent 30%, transparent 70%, rgba(255,0,0,0.2)),
    linear-gradient(180deg, rgba(255,0,0,0.2), transparent 30%, transparent 70%, rgba(255,0,0,0.2));

  animation: alertStrobe 0.25s infinite;
}

@keyframes alertStrobe {
  0%   { opacity: 0.1; }
  20%  { opacity: 0.8; }
  40%  { opacity: 0.2; }
  60%  { opacity: 1; }
  80%  { opacity: 0.3; }
  100% { opacity: 0.9; }
}

.container.alert-active .timer {
  animation: criticalTimer 0.4s infinite;
  text-shadow:
    0 0 10px red,
    0 0 20px red,
    0 0 40px rgba(255,0,0,0.8);
}

@keyframes criticalTimer {
  0%   { opacity: 1; transform: translateX(-50%) scale(1); }
  50%  { opacity: 0.6; transform: translateX(-50%) scale(1.15); }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
}

.container.alert-active .panel {
  box-shadow:
    inset 0 0 25px rgba(255,0,0,0.5),
    0 0 20px rgba(255,0,0,0.6);
}


@keyframes alertFlash {
  0% { opacity: 0.1; }
  50% { opacity: 0.4; }
  100% { opacity: 0.1; }
}

.fuel-system {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px;
}

/* existing grid stays */
.fuel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* COMMS WAVES */
.comms {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 8px;

  flex: 1;              /* 🔥 fills remaining panel space */
  width: 100%;
  padding: 10px 0;
}
@media (max-width: 900px) {
  .comms {
    height: 40px;   /* 🔥 fixed height prevents distortion */
  }
}

.wave {
  flex: 1;
  max-width: 10px;
  min-width: 4px;

  height: 20%;
  border-radius: 3px;

  background: linear-gradient(180deg, #00c6ff, #0072ff);
  box-shadow: 0 0 10px #00c6ff;

  animation: waveAnim infinite ease-in-out;
  animation-delay: var(--delay);
}
@media (max-width: 900px) {
  .wave {
    max-width: 6px;
  }
}

@keyframes waveAnim {
  0%   { height: 10%; opacity: 0.4; }
  30%  { height: 60%; opacity: 1; }
  60%  { height: 30%; opacity: 0.7; }
  100% { height: 80%; opacity: 0.9; }
}
.fuel-text {
  font-size: 12px;
  text-align: center;

  color: #00ffcc;
  letter-spacing: 2px;

  padding-bottom: 5px;   /* 🔥 keeps it inside panel */
  line-height: 1.4;

  text-shadow: 0 0 6px rgba(0,255,200,0.4);
}

.fuel-slot {
  height: 50px;
  border: 1px solid #00c6ff;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.fuel-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #00c6ff, #0072ff);
  opacity: 0;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: 0.3s;
}

.fuel-slot.active .fuel-inner {
  opacity: 1;
  transform: scaleY(1);
  box-shadow: 0 0 12px #00c6ff;
}

.fuel-slot.active::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.05) 5px
  );
}
@keyframes fuelBlink {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

/* END SCREEN */
.end-screen {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 301;
}

.end-box {
  text-align: center;
  padding: 40px;
  border: 2px solid #00c6ff;
}

.data-block {
  font-size: 11px;
  line-height: 1.6;
  margin-bottom: 10px;
  color: #4fd1ff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.data-side {
  font-size: 11px;
  color: #00ffcc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sys-line {
  opacity: 0.8;
}

.mini-bar {
  height: 6px;
  border: 1px solid #00c6ff;
  border-radius: 4px;
  overflow: hidden;
}

.mini-bar div {
  height: 100%;
  background: linear-gradient(90deg, #00c6ff, #00ffcc);
  box-shadow: 0 0 8px #00c6ff;
}
.terminal {
  flex: 1;
  min-height: 0;
  overflow: hidden;     
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
    margin-top: 10px;
  padding: 8px 10px;
  background: rgba(0, 20, 40, 0.4);
  border-radius: 6px;
}

.terminal div {
  font-size: 11px;
  color: #00ff88;
  opacity: 0.85;
  font-family: monospace;
  line-height: 1.3;
  animation: flicker 0.25s;
  letter-spacing: 2px;
}

@keyframes flicker {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.nav-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.nav-container::before {
  content: "";
  position: absolute;
  inset: 0;

  background:
    linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px);

  background-size: 40px 40px;
}

/* EARTH CENTER */
.earth {
  position: absolute;
  width: 100px;
  height: 100px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;

  background: radial-gradient(circle at 30% 30%, #4fd1ff, #0077ff 60%, #001a33);

  box-shadow:
    0 0 30px rgba(0,200,255,0.7),
    inset -10px -10px 25px rgba(0,0,0,0.6);
}
@media (max-width: 900px) {
  .earth {
    width: 70px;
    height: 70px;
  }
}

.earth::after {
  content: "";
  position: absolute;
  inset: -25px;
  border-radius: 50%;
  border: 1px dashed rgba(0,200,255,0.3);
  animation: rotateSlow 20s linear infinite;
}

@keyframes rotateSlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.earth::before {
  content: "";
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  border: 1px dashed rgba(0,200,255,0.3);
}

.trajectory-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.trajectory-svg path {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: drawPath 2s ease forwards;
}
.trajectory-svg path {
  opacity: 0.3;
}

.ship-dot {
  box-shadow: 0 0 12px #00ff88, 0 0 30px rgba(0,255,150,0.3);
}

@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}

.ship-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #00ff88;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff88;

  offset-path: path("M40 240 Q120 180 150 150 Q200 120 240 160");

  /* ❗ NO animation */
  offset-distance: var(--progress);
}
.ship-dot {
  animation: pulse 1.2s infinite ease-in-out,
             drift 6s ease-in-out infinite alternate;
}
.ship-dot::after {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 1px solid rgba(0,255,150,0.4);
  animation: ping 1.5s infinite;
}

@keyframes ping {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
@keyframes drift {
  from { transform: translate(0px, 0px); }
  to   { transform: translate(3px, -2px); }
}
@keyframes moveShip {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

@keyframes blink {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.nav-stats {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);

  text-align: right;
  font-size: 13px;
  line-height: 1.8;

  color: #00ffcc;
  text-shadow: 0 0 8px rgba(0,255,200,0.5);
}

.data-line {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.label {
  min-width: 70px;
  flex-shrink: 0;
}

/* viewport */
.scroll-box {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 18px;
}

/* 🔥 THIS FIXES YOUR BUG */
.scroll-inner {
  position: absolute;   /* ⛔ prevents layout expansion */
  display: flex;
  gap: 60px;
  white-space: nowrap;

  animation: scrollSync 10s linear infinite;
}

/* ensure spacing consistency */
.scroll-inner span {
  white-space: nowrap;
}

/* 🔥 PERFECT SYNC */
@keyframes scrollSync {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.nav-visual {
  position: absolute;
  inset: 0;

  /* 🔥 THIS IS THE MAGIC */
  transform: translateX(-40px);
}


@media (max-width: 500px) {
  .grid {
    top: 80px;
    gap: 10px;
    left: 10px;
    right: 10px;
  }

  .logo {
    left: 15px;
    height: 30px;
  }

  .damage {
    right: 10px;
  }
}
@media (max-width: 900px) {

  .panel {
    transition: 0.25s ease;
  }

  .panel.expanded {
    position: fixed;
    inset: 0;

    transform: none;   /* 🔥 CRITICAL */
    width: 100%;
    height: 100%;

    margin: 0;
    padding: 10px;

    z-index: 100;
    border-radius: 0;
    animation: zoomIn 0.25s ease;
    background: #000814;
    padding:
  calc(10px + env(safe-area-inset-top))
  calc(10px + env(safe-area-inset-right))
  calc(10px + env(safe-area-inset-bottom))
  calc(10px + env(safe-area-inset-left));
  display: flex;
  flex-direction: column;
  overflow: hidden;  
  }

  @keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

  .container {
  padding:
    env(safe-area-inset-top)
    env(safe-area-inset-right)
    env(safe-area-inset-bottom)
    env(safe-area-inset-left);
}

  .hidden {
    display: none;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 90;
  }

}

@media (max-width: 900px) {
  .timer {
    font-size: clamp(28px, 8vw, 72px);
  }
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 12px;

  font-size: 22px;
  color: #fff;

  z-index: 200;
  cursor: pointer;

  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  backdrop-filter: blur(4px);
}

@media (max-width: 900px) {

  /* 🔥 ONLY scale CLOSED panels */
  .panel:not(.expanded) {
    transform: scale(0.82);
    width: 128%;
    height: 128%;
  }

  /* 🔥 expanded = TRUE fullscreen */

    
  }

@media (max-width: 900px) {

  .panel {
    font-size: 0.85em;   /* 🔥 shrinks EVERYTHING inside */
  }

  .terminal div {
    font-size: 9px;
  }

  .nav-stats {
    font-size: 10px;
  }

  .fuel-text {
    font-size: 10px;
    margin-bottom: 2 px;
  }


}

@media (max-width: 900px) {
  .fuel-slot {
    height: 28px;   /* 🔥 smaller, fits grid */
  }
}
</style>

<div class="container {redAlert ? 'alert-active' : ''}">

  <Background />

  {#if redAlert}
    <div class="alert"></div>
  {/if}

  <img src="/ascwhite.svg" class="logo" alt="logo">

  <div class="timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>

  <div class="damage">
    {#each Array(3) as _, i}
      <div class="heart {i < damage ? 'active' : ''}"></div>
    {/each}
  </div>

  <div class="grid">

    <!-- MODULE 1 -->
    <div class="panel 
  {expandedPanel === 0 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 0 ? 'hidden' : ''}"
  on:click={() => openPanel(0)}
>
{#if isMobile() && expandedPanel === 0}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 0}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
      {#if activeModules[0]}
        <div class="module {activeModules[0].solved ? 'solved' : ''} {activeModuleIndex === 0 ? 'active' : ''}"
          on:click={(e) => {
  e.stopPropagation(); // 🔥 prevents panel click conflict

  if (isMobile()) {
    expandedPanel = 0;
  }

  activeModuleIndex = 0;
}}>
          <svelte:component this={activeModules[0].component}
            {serial} {indicator} {fuel} {timeLeft} {damage}
            active={activeModuleIndex === 0}
            on:success={() => handleSuccess(0)}
            on:strike={handleStrike}/>
        </div>
      {/if}
    </div>

    <!-- NAV -->
    <div class="panel 
  {expandedPanel === 1 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 1 ? 'hidden' : ''}"
  on:click={() => openPanel(1)}
>
{#if isMobile() && expandedPanel === 1}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 1}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
  <div class="panel-title">NAV</div>

  <div class="nav-container">
<div class="nav-visual">
  <!-- EARTH -->
  <div class="earth"></div>

  <!-- TRAJECTORY PATH -->
  <svg class="trajectory-svg" viewBox="0 0 300 300">
    <path id="flightPath"
      d="M40 240 Q140 160 170 140"
  stroke="#6cffd6"
  stroke-width="2"
  fill="none"
  opacity="0.6"
    />
  </svg>

  <!-- SHIP -->
  <div class="ship-dot" style="--progress: {progress * 100}%"></div>
</div>
  <!-- TELEMETRY -->
 <div class="nav-stats">
  <div>SPEED: 1200 km/h</div>
  <div>ETA: 2d 15h</div>
  <div>DIST: {Math.floor(distance)} km</div>
  <div>STATUS: APPROACH</div>
</div>

</div>
</div>

    <!-- MODULE 2 -->
    <div class="panel 
  {expandedPanel === 2 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 2 ? 'hidden' : ''}"
  on:click={() => openPanel(2)}
>
{#if isMobile() && expandedPanel === 2}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 2}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
      {#if activeModules[1]}
        <div class="module {activeModules[1].solved ? 'solved' : ''} {activeModuleIndex === 1 ? 'active' : ''}"
          on:click={(e) => {
  e.stopPropagation(); // 🔥 prevents panel click conflict

  if (isMobile()) {
    expandedPanel = 2;
  }

  activeModuleIndex = 1;
}}>
          <svelte:component this={activeModules[1].component}
            {serial} {indicator} {fuel} {timeLeft} {damage}
            active={activeModuleIndex === 1}
            on:success={() => handleSuccess(1)}
            on:strike={handleStrike}/>
        </div>
      {/if}
    </div>

    <!-- INFO -->
    <div class="panel 
  {expandedPanel === 3 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 3 ? 'hidden' : ''}"
  on:click={() => openPanel(3)}
>
{#if isMobile() && expandedPanel === 3}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 3}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
      <div class="panel-title">DATA</div>
      <div style="padding:20px">
<div class="data-layout">

  <!-- LEFT -->
  <div class="data-block">
    <div>SERIAL: {serial}</div>
    <div>IND: {indicator}</div>

    {#if teamData}
      <div class="data-line">
  <span class="label">TEAM:</span>
  <div class="scroll-box">
    <div class="scroll-inner">
      <span>{teamData.teamName}</span>
      <span>{teamData.teamName}</span>
    </div>
  </div>
</div>

<div class="data-line">
  <span class="label">CREW-1:</span>
  <div class="scroll-box">
    <div class="scroll-inner">
      <span>{teamData.member1}</span>
      <span>{teamData.member1}</span>
    </div>
  </div>
</div>

<div class="data-line">
  <span class="label">CREW-2:</span>
  <div class="scroll-box">
    <div class="scroll-inner">
      <span>{teamData.member2}</span>
      <span>{teamData.member2}</span>
    </div>
  </div>
</div>
    {/if}

    <!-- LEFT TERMINAL -->
    <div class="terminal left">
      {#each terminalLines as line}
        <div>{line}</div>
      {/each}
    </div>
  </div>

  <!-- RIGHT -->
  <div class="data-side">

    <div class="sys-line">NAV STATUS: LINKED</div>
    <div class="sys-line">COM STATUS: STABLE</div>
    <div class="sys-line">CORE TEMP: {Math.floor(60 + Math.random()*20)}°C</div>
    <div class="sys-line">SIGNAL: {Math.floor(70 + Math.random()*30)}%</div>

    <div class="mini-bar">
      <div style="width:{60 + Math.random()*30}%"></div>
    </div>

    <div class="mini-bar">
      <div style="width:{40 + Math.random()*50}%"></div>
    </div>

    <!-- 🔥 RIGHT TERMINAL (NEW) -->
    <div class="terminal right">
      {#each terminalLines.slice().reverse() as line}
        <div>{line}</div>
      {/each}
    </div>

  </div>

</div>

<div class="terminal">
  {#each terminalLines as line}
    <div>{line}</div>
  {/each}
</div>

</div>
    </div>

    <!-- MODULE 3 -->
   <div class="panel 
  {expandedPanel === 4 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 4 ? 'hidden' : ''}"
  on:click={() => openPanel(4)}
>
{#if isMobile() && expandedPanel === 4}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 4}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
      {#if activeModules[2]}
        <div class="module {activeModules[2].solved ? 'solved' : ''} {activeModuleIndex === 2 ? 'active' : ''}"
          on:click={(e) => {
  e.stopPropagation(); // 🔥 prevents panel click conflict

  if (isMobile()) {
    expandedPanel = 4;
  }

  activeModuleIndex = 2;
}}>
          <svelte:component this={activeModules[2].component}
            {serial} {indicator} {fuel} {timeLeft} {damage}
            active={activeModuleIndex === 2}
            on:success={() => handleSuccess(2)}
            on:strike={handleStrike}/>
        </div>
      {/if}
    </div>

    <!-- FUEL -->
    <div class="panel 
  {expandedPanel === 5 ? 'expanded' : ''} 
  {isMobile() && expandedPanel !== null && expandedPanel !== 5 ? 'hidden' : ''}"
  on:click={() => openPanel(5)}
>
{#if isMobile() && expandedPanel === 5}
  <div class="close-btn" on:click|stopPropagation={closePanel}>✕</div>
{/if}
{#if isMobile() && expandedPanel === 5}
  <div class="panel-timer">
    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
  </div>
{/if}
      <div class="panel-title">FUEL</div>
      <div class="fuel-system">

  <!-- CELLS -->
  <div class="fuel-grid">
    {#each Array(4) as _, i}
      <div class="fuel-slot {i < fuel ? 'active' : ''}">
        <div class="fuel-inner"></div>
      </div>
    {/each}
  </div>

  <!-- COMMS VISUAL -->
  <div class="comms">
    {#each Array(14) as _, i}
  <div
  class="wave"
  style="
    animation-duration: {1.0 + Math.random()}s;
    animation-delay: {Math.random() * 2}s;
  "
></div>
{/each}
  </div>

  <!-- STATUS TEXT -->
  <div class="fuel-text">
    FUEL SYS: ONLINE<br>
    COMMS: ACTIVE
  </div>

</div>
    </div>

  </div>

  {#if strikeFlash}
    <div class="strike-overlay"></div>
  {/if}

  {#if showStrikeText}
    <div class="strike-text">STRIKE</div>
  {/if}

  {#if gameOver}
    <div class="end-screen">
      <div class="end-box">
        <h1>{result === "WIN" ? "MISSION SUCCESS" : "MISSION FAILED"}</h1>
        <p>Time Left: {timeLeft}s</p>
        <p>Strikes: {damage}/3</p>
      </div>
    </div>
  {/if}
{#if expandedPanel !== null}
  <div class="overlay" on:click={closePanel}></div>
{/if}
</div>