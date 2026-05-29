/* =========================================================
   一封会发光的情书 · 交互 + 星空粒子
   男 INFP 天秤  →  女 ENFP 双子
   ========================================================= */

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const HEART_COLORS = ["#ff6aa9", "#ff3d83", "#8a6bff", "#ffd98a", "#ff9ec8"];

/* ---------- 星星 ---------- */
const stars = [];
for (let i = 0; i < 140; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.4 + 0.3,
    base: Math.random() * 0.5 + 0.3,
    tw: Math.random() * Math.PI * 2,
    twSpeed: 0.02 + Math.random() * 0.04,
  });
}

/* ---------- 漂浮爱心 ---------- */
const hearts = [];
function makeHeart(initial) {
  return {
    x: Math.random() * W,
    y: initial ? Math.random() * H : H + 20,
    size: 7 + Math.random() * 14,
    speed: 0.3 + Math.random() * 0.9,
    sway: Math.random() * 2 * Math.PI,
    swaySpeed: 0.008 + Math.random() * 0.018,
    alpha: 0.3 + Math.random() * 0.4,
    color: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
  };
}
for (let i = 0; i < 26; i++) hearts.push(makeHeart(true));

/* ---------- 花瓣 ---------- */
const petals = [];
function makePetal(initial) {
  return {
    x: Math.random() * W,
    y: initial ? Math.random() * H : -20,
    size: 6 + Math.random() * 8,
    speedY: 0.5 + Math.random() * 1.0,
    speedX: -0.6 + Math.random() * 1.2,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: -0.03 + Math.random() * 0.06,
    alpha: 0.35 + Math.random() * 0.4,
    color: Math.random() > 0.5 ? "#ff9ec8" : "#ffd0e6",
  };
}
for (let i = 0; i < 18; i++) petals.push(makePetal(true));

/* ---------- 流星 ---------- */
let shooting = null;
function maybeShoot() {
  if (shooting || Math.random() > 0.006) return;
  const startX = Math.random() * W * 0.6 + W * 0.2;
  shooting = { x: startX, y: -10, len: 140, vx: 6 + Math.random() * 4, vy: 5 + Math.random() * 3, life: 1 };
}

function heartPath(c) {
  c.beginPath();
  c.moveTo(0, 4);
  c.bezierCurveTo(0, 0, -8, -2, -8, -6);
  c.bezierCurveTo(-8, -11, -3, -11, 0, -7);
  c.bezierCurveTo(3, -11, 8, -11, 8, -6);
  c.bezierCurveTo(8, -2, 0, 0, 0, 4);
  c.closePath();
}

function drawHeart(x, y, size, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  heartPath(ctx);
  ctx.fill();
  ctx.restore();
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function loopBg() {
  ctx.clearRect(0, 0, W, H);

  // 星星
  for (const s of stars) {
    s.tw += s.twSpeed;
    const a = s.base + Math.sin(s.tw) * 0.35;
    ctx.globalAlpha = Math.max(a, 0);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 花瓣
  for (const p of petals) {
    p.y += p.speedY; p.x += p.speedX; p.rot += p.rotSpeed;
    drawPetal(p);
    if (p.y > H + 20) Object.assign(p, makePetal(false));
  }

  // 爱心
  for (const h of hearts) {
    h.y -= h.speed; h.sway += h.swaySpeed;
    drawHeart(h.x + Math.sin(h.sway) * 16, h.y, h.size, h.color, h.alpha);
    if (h.y < -30) Object.assign(h, makeHeart(false));
  }
  ctx.shadowBlur = 0;

  // 流星
  maybeShoot();
  if (shooting) {
    const s = shooting;
    s.x += s.vx; s.y += s.vy; s.life -= 0.012;
    const tailX = s.x - s.vx * 14, tailY = s.y - s.vy * 14;
    const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    grad.addColorStop(0, "rgba(255,255,255," + Math.max(s.life, 0) + ")");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 1;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    if (s.life <= 0 || s.x > W + 50 || s.y > H + 50) shooting = null;
  }

  ctx.globalAlpha = 1;
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

/* ---------- 进入场景特效 ---------- */
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
  scene.querySelectorAll(".typed").forEach((el) => {
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

/* ---------- 星座配对 ---------- */
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

/* ---------- 翻牌 ---------- */
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
  "「我愿意」那个按钮，越来越大了哦 👀",
  "别躲啦，我等你很久了 🌷",
];
let teaseIdx = 0;
let dodgeCount = 0;

function dodge() {
  noBtn.classList.add("runaway");
  const r = choiceZone.getBoundingClientRect();
  const maxX = Math.max(0, r.width - noBtn.offsetWidth - 10);
  const maxY = Math.max(0, r.height - noBtn.offsetHeight - 10);
  noBtn.style.left = Math.random() * maxX + "px";
  noBtn.style.top = Math.random() * maxY + "px";
  teaser.textContent = teases[teaseIdx % teases.length];
  teaseIdx++;
  dodgeCount++;
  const grow = Math.min(1 + dodgeCount * 0.12, 1.8);
  const shrink = Math.max(1 - dodgeCount * 0.08, 0.45);
  yesBtn.style.transform = `scale(${grow})`;
  noBtn.style.transform = `scale(${shrink})`;
}
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("click", dodge);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });
yesBtn.addEventListener("click", () => goTo(5));

/* ---------- 庆祝：爱心 / 花瓣 / 闪光喷发 ---------- */
function celebrate() {
  const overlay = document.createElement("canvas");
  overlay.style.cssText = "position:fixed;inset:0;z-index:5;pointer-events:none;";
  document.body.appendChild(overlay);
  const o = overlay.getContext("2d");
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;

  const parts = [];
  const N = 160;
  for (let i = 0; i < N; i++) {
    const kind = Math.random();
    parts.push({
      x: overlay.width / 2,
      y: overlay.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 5,
      size: 8 + Math.random() * 14,
      color: HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      life: 1,
      kind: kind < 0.45 ? "heart" : kind < 0.75 ? "confetti" : "spark",
    });
  }

  let frame = 0;
  (function run() {
    o.clearRect(0, 0, overlay.width, overlay.height);
    for (const p of parts) {
      p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      o.save();
      o.globalAlpha = Math.max(p.life, 0);
      o.translate(p.x, p.y);
      o.rotate(p.rot);
      o.fillStyle = p.color;
      o.shadowColor = p.color;
      o.shadowBlur = 10;
      if (p.kind === "heart") {
        o.scale(p.size / 16, p.size / 16);
        heartPath(o);
        o.fill();
      } else if (p.kind === "confetti") {
        o.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
      } else {
        o.beginPath();
        for (let k = 0; k < 4; k++) {
          o.rotate(Math.PI / 2);
          o.moveTo(0, 0); o.lineTo(0, -p.size); o.lineTo(p.size * 0.25, 0);
        }
        o.fill();
      }
      o.restore();
    }
    frame++;
    if (frame < 240) requestAnimationFrame(run);
    else overlay.remove();
  })();
}

/* ---------- 重播 ---------- */
document.getElementById("replay-btn").addEventListener("click", () => {
  noBtn.classList.remove("runaway");
  noBtn.style.cssText = "";
  yesBtn.style.transform = "";
  teaser.textContent = "";
  teaseIdx = 0; dodgeCount = 0;
  envelope.classList.remove("open");
  goTo(0);
});

/* ---------- 背景音乐（Web Audio 程序生成，无需音频文件） ---------- */
const musicBtn = document.getElementById("music-toggle");
let audioCtx = null;
let musicTimer = null;
let musicOn = false;
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
musicBtn.addEventListener("click", () => { musicOn ? stopMusic() : startMusic(); });
