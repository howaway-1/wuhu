/* =========================================================
   致最特别的你 · 仿苹果风格滚动叙事
   男 INFP 天秤  →  女 ENFP 双子
   ========================================================= */

/* ---------- 滚动淡入（IntersectionObserver） ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
revealEls.forEach((el) => io.observe(el));

/* ---------- 契合度数字滚动到 99% ---------- */
const numEl = document.getElementById("match-num");
let countStarted = false;
const numHost = numEl.closest(".bignum");
const numIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && !countStarted) {
      countStarted = true;
      let v = 0;
      const t = setInterval(() => {
        v += 2;
        if (v >= 99) { v = 99; clearInterval(t); }
        numEl.textContent = v;
      }, 22);
      numIO.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
numIO.observe(numHost);

/* ---------- 表白：是 / 否 ---------- */
const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const teaser = document.getElementById("teaser");
const choiceZone = document.getElementById("choice-zone");

const teases = [
  "诶？再想想嘛～再给我一次机会",
  "这个按钮好像不太听话哦…",
  "抓不到我的！但你抓住了我的心",
  "其实你心里已经有答案了，对不对",
  "「我愿意」越来越大了哦",
  "别躲啦，我等你很久了",
];
let teaseIdx = 0;
let dodgeCount = 0;

function dodge() {
  noBtn.classList.add("runaway");
  const r = choiceZone.getBoundingClientRect();
  const maxX = Math.max(0, r.width - noBtn.offsetWidth - 8);
  const maxY = Math.max(0, r.height - noBtn.offsetHeight - 8);
  noBtn.style.left = Math.random() * maxX + "px";
  noBtn.style.top = Math.random() * maxY + "px";
  teaser.textContent = teases[teaseIdx % teases.length];
  teaseIdx++;
  dodgeCount++;
  const grow = Math.min(1 + dodgeCount * 0.1, 1.6);
  const shrink = Math.max(1 - dodgeCount * 0.08, 0.5);
  yesBtn.style.transform = `scale(${grow})`;
  noBtn.style.transform = `scale(${shrink})`;
}
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("click", dodge);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); }, { passive: false });

/* ---------- 庆祝 overlay + 彩纸 ---------- */
const overlay = document.getElementById("final-overlay");
const replayBtn = document.getElementById("replay-btn");
const cvs = document.getElementById("confetti");
const cx = cvs.getContext("2d");
let confettiRAF = null;

const COLORS = ["#ff5e9c", "#a96bff", "#2ea7ff", "#ffb84d", "#34c759", "#ff375f"];

function heartPath(c) {
  c.beginPath();
  c.moveTo(0, 4);
  c.bezierCurveTo(0, 0, -8, -2, -8, -6);
  c.bezierCurveTo(-8, -11, -3, -11, 0, -7);
  c.bezierCurveTo(3, -11, 8, -11, 8, -6);
  c.bezierCurveTo(8, -2, 0, 0, 0, 4);
  c.closePath();
}

function launchConfetti() {
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  const parts = [];
  for (let i = 0; i < 200; i++) {
    const fromLeft = i % 2 === 0;
    parts.push({
      x: fromLeft ? 0 : cvs.width,
      y: cvs.height * (0.5 + Math.random() * 0.4),
      vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9),
      vy: -(9 + Math.random() * 9),
      size: 7 + Math.random() * 12,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      heart: Math.random() < 0.4,
      life: 1,
    });
  }
  let frame = 0;
  function run() {
    cx.clearRect(0, 0, cvs.width, cvs.height);
    for (const p of parts) {
      p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.vx *= 0.99; p.life -= 0.006;
      cx.save();
      cx.globalAlpha = Math.max(p.life, 0);
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.fillStyle = p.color;
      if (p.heart) { cx.scale(p.size / 16, p.size / 16); heartPath(cx); cx.fill(); }
      else { cx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5); }
      cx.restore();
    }
    frame++;
    if (frame < 260) confettiRAF = requestAnimationFrame(run);
  }
  run();
}

function openFinal() {
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  launchConfetti();
}
function closeFinal() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (confettiRAF) cancelAnimationFrame(confettiRAF);
  // 复位表白按钮
  noBtn.classList.remove("runaway");
  noBtn.style.cssText = "";
  yesBtn.style.transform = "";
  teaser.textContent = "";
  teaseIdx = 0; dodgeCount = 0;
  document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
}

yesBtn.addEventListener("click", openFinal);
replayBtn.addEventListener("click", closeFinal);
