/* =========================================================
   一封会动的情书 · 交互逻辑
   男 INFP 天秤  →  女 ENFP 双子
   ========================================================= */

/* ---------- 背景：漂浮的爱心粒子 ---------- */
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let W, H, hearts = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const HEART_COLORS = ["#ff7eb3", "#ff5e9c", "#a18cd1", "#ffd86b", "#ff9bc4"];

function makeHeart(initial) {
  return {
    x: Math.random() * W,
    y: initial ? Math.random() * H : H + 20,
    size: 8 + Math.random() * 16,
    speed: 0.4 + Math.random() * 1.1,
    sway: Math.random() * 2 * Math.PI,
    swaySpeed: 0.01 + Math.random() * 0.02,
    alpha: 0.35 + Math.random() * 0.45,
    color: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
  };
}
for (let i = 0; i < 36; i++) hearts.push(makeHeart(true));

function drawHeart(x, y, size, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(0, 0, -8, -2, -8, -6);
  ctx.bezierCurveTo(-8, -11, -3, -11, 0, -7);
  ctx.bezierCurveTo(3, -11, 8, -11, 8, -6);
  ctx.bezierCurveTo(8, -2, 0, 0, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function loopBg() {
  ctx.clearRect(0, 0, W, H);
  for (const h of hearts) {
    h.y -= h.speed;
    h.sway += h.swaySpeed;
    const x = h.x + Math.sin(h.sway) * 18;
    drawHeart(x, h.y, h.size, h.color, h.alpha);
    if (h.y < -30) Object.assign(h, makeHeart(false));
  }
  requestAnimationFrame(loopBg);
}
loopBg();

/* ---------- 场景切换 ---------- */
const scenes = Array.from(document.querySelectorAll(".scene"));
let current = 0;

function goTo(index) {
  if (index < 0 || index >= scenes.length) return;
  scenes[current].classList.remove("active");
  current = index;
  scenes[current].classList.add("active");
  onSceneEnter(current);
}

document.querySelectorAll(".next-btn").forEach((btn) => {
  btn.addEventListener("click", () => goTo(current + 1));
});

/* ---------- 信封 ---------- */
const envelope = document.getElementById("envelope");
const openBtn = document.getElementById("open-btn");
function openEnvelope() {
  envelope.classList.add("open");
  startMusic();
  setTimeout(() => goTo(1), 850);
}
openBtn.addEventListener("click", openEnvelope);
envelope.addEventListener("click", openEnvelope);

/* ---------- 进入场景时触发的特效 ---------- */
const typedDone = new Set();
function onSceneEnter(i) {
  if (i === 1) runTypewriter(scenes[1]);
  if (i === 2) runMatchReport();
  if (i === 5) celebrate();
}

/* ---------- 打字机 ---------- */
function runTypewriter(scene) {
  if (typedDone.has(scene)) return;
  typedDone.add(scene);
  const lines = scene.querySelectorAll(".typed");
  lines.forEach((el) => {
    const text = el.dataset.text;
    const delay = parseInt(el.dataset.delay || "0", 10);
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.innerHTML = "&nbsp;";
    setTimeout(() => {
      el.appendChild(caret);
      let n = 0;
      const t = setInterval(() => {
        caret.insertAdjacentText("beforebegin", text[n]);
        n++;
        if (n >= text.length) {
          clearInterval(t);
          setTimeout(() => caret.remove(), 600);
        }
      }, 90);
    }, delay);
  });
}

/* ---------- 配对报告 ---------- */
let matchDone = false;
function runMatchReport() {
  if (matchDone) return;
  matchDone = true;
  scenes[2].querySelectorAll(".reveal").forEach((el) => el.classList.add("show"));
  const fill = document.getElementById("meter-fill");
  const num = document.getElementById("meter-num");
  setTimeout(() => {
    fill.style.width = "99%";
    let v = 0;
    const t = setInterval(() => {
      v += 2;
      if (v >= 99) { v = 99; clearInterval(t); }
      num.textContent = v + "%";
    }, 36);
  }, 500);
}

/* ---------- 翻牌：喜欢你的理由 ---------- */
document.querySelectorAll(".reason-card").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("flipped"));
});

/* ---------- 表白：是 / 否 ---------- */
const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const teaser = document.getElementById("teaser");
const choiceZone = document.querySelector(".choice-zone");

const teases = [
  "诶？再想想嘛～再给我一次机会 🥺",
  "这个按钮好像不太听话哦…",
  "抓不到我的！但你抓住了我的心 💗",
  "其实你心里已经有答案了对不对～",
  "「愿意」那个按钮，越来越大了哦 👀",
  "别躲啦，我等你很久了 🌷",
];
let teaseIdx = 0;
let dodgeCount = 0;

function dodge() {
  noBtn.classList.add("runaway");
  const zoneRect = choiceZone.getBoundingClientRect();
  const maxX = Math.max(0, zoneRect.width - noBtn.offsetWidth - 10);
  const maxY = Math.max(0, zoneRect.height - noBtn.offsetHeight - 10);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";

  teaser.textContent = teases[teaseIdx % teases.length];
  teaseIdx++;

  dodgeCount++;
  // 每次"愿意"按钮变大一点点，"再想想"缩小一点点
  const grow = Math.min(1 + dodgeCount * 0.12, 1.8);
  const shrink = Math.max(1 - dodgeCount * 0.08, 0.45);
  yesBtn.style.transform = `scale(${grow})`;
  noBtn.style.transform = `scale(${shrink})`;
}

noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("click", dodge);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });

yesBtn.addEventListener("click", () => goTo(5));

/* ---------- 庆祝：爱心 + 彩纸喷发 ---------- */
function celebrate() {
  const colors = HEART_COLORS;
  const N = 120;
  const parts = [];
  const overlay = document.createElement("canvas");
  overlay.style.cssText = "position:fixed;inset:0;z-index:4;pointer-events:none;";
  document.body.appendChild(overlay);
  const o = overlay.getContext("2d");
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  for (let i = 0; i < N; i++) {
    parts.push({
      x: overlay.width / 2,
      y: overlay.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 4,
      size: 8 + Math.random() * 14,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      life: 1,
      heart: Math.random() > 0.5,
    });
  }

  let frame = 0;
  (function run() {
    o.clearRect(0, 0, overlay.width, overlay.height);
    for (const p of parts) {
      p.vy += 0.28;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.008;
      o.save();
      o.globalAlpha = Math.max(p.life, 0);
      o.translate(p.x, p.y);
      o.rotate(p.rot);
      o.fillStyle = p.color;
      if (p.heart) {
        drawHeartAt(o, p.size);
      } else {
        o.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      o.restore();
    }
    frame++;
    if (frame < 220) requestAnimationFrame(run);
    else overlay.remove();
  })();
}

function drawHeartAt(c, size) {
  const s = size / 16;
  c.scale(s, s);
  c.beginPath();
  c.moveTo(0, 4);
  c.bezierCurveTo(0, 0, -8, -2, -8, -6);
  c.bezierCurveTo(-8, -11, -3, -11, 0, -7);
  c.bezierCurveTo(3, -11, 8, -11, 8, -6);
  c.bezierCurveTo(8, -2, 0, 0, 0, 4);
  c.closePath();
  c.fill();
}

/* ---------- 重播 ---------- */
document.getElementById("replay-btn").addEventListener("click", () => {
  // 重置表白场景状态
  noBtn.classList.remove("runaway");
  noBtn.style.cssText = "";
  yesBtn.style.transform = "";
  teaser.textContent = "";
  teaseIdx = 0; dodgeCount = 0;
  envelope.classList.remove("open");
  goTo(0);
});

/* ---------- 背景音乐（Web Audio 程序生成的轻柔旋律，无需音频文件） ---------- */
const musicBtn = document.getElementById("music-toggle");
let audioCtx = null;
let musicTimer = null;
let musicOn = false;

// 一段温柔的循环旋律（C 大调，简单琶音）
const MELODY = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880.0, 698.46,
  659.25, 783.99, 987.77, 783.99,
  523.25, 659.25, 783.99, 1046.5,
];
let noteIdx = 0;

function playNote(freq) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.55);
}

function startMusic() {
  if (musicOn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  musicOn = true;
  musicBtn.classList.add("playing");
  musicTimer = setInterval(() => {
    playNote(MELODY[noteIdx % MELODY.length]);
    noteIdx++;
  }, 420);
}

function stopMusic() {
  musicOn = false;
  musicBtn.classList.remove("playing");
  if (musicTimer) clearInterval(musicTimer);
}

musicBtn.addEventListener("click", () => {
  if (musicOn) stopMusic();
  else startMusic();
});
