/* 心动信笺 —— 高自由度可编辑表白页 */
(function () {
  "use strict";

  var STORAGE_KEY = "loveletter-config-v1";

  var defaults = {
    theme: "sunset",
    effect: "hearts",
    texts: {
      kicker: "致 心里那个闪闪发光的人",
      title: "遇见你之后，<br>连风都变得温柔了",
      message: "不知道从什么时候开始，我的世界悄悄多了一个频道——里面全是你。你笑的时候，我心里像有烟花在放；你不在的时候，连奶茶都没那么甜了。我想把每一个普通的日子，都过成和你有关的样子。",
      question: "所以……可以借你的余生，跟我的余生拼个桌吗？",
      signature: "—— 一个偷偷喜欢你很久的人",
      celebrate: "耶！！从今天起，你的快乐由我承包啦！"
    },
    stickers: [] // {emoji, x, y} x/y 为相对舞台的百分比
  };

  var STICKERS = ["💖","💘","💝","💕","💞","🌹","🌷","🌸","🌻","✨","⭐","🌙","🫶","😻","🥰","😘","🍓","🍰","🧸","🎀","🎈","🦄","🐰","🌈","💍","🔥","🎵","☁️","🍀","💌"];

  var body = document.body;
  var stage = document.getElementById("stage");
  var stickerLayer = document.getElementById("sticker-layer");
  var editing = true;

  /* ---------- 配置读写 ---------- */
  function getConfig() {
    var texts = {};
    document.querySelectorAll("[data-key]").forEach(function (el) {
      texts[el.dataset.key] = el.innerHTML;
    });
    var stickers = [];
    stickerLayer.querySelectorAll(".sticker").forEach(function (el) {
      stickers.push({ emoji: el.textContent, x: parseFloat(el.style.left), y: parseFloat(el.style.top) });
    });
    return {
      theme: body.dataset.theme,
      effect: body.dataset.effect,
      texts: texts,
      stickers: stickers
    };
  }

  function applyConfig(cfg) {
    body.dataset.theme = cfg.theme || defaults.theme;
    body.dataset.effect = cfg.effect || defaults.effect;
    document.getElementById("theme-select").value = body.dataset.theme;
    document.getElementById("effect-select").value = body.dataset.effect;
    var texts = cfg.texts || {};
    document.querySelectorAll("[data-key]").forEach(function (el) {
      if (texts[el.dataset.key] != null) el.innerHTML = texts[el.dataset.key];
    });
    stickerLayer.innerHTML = "";
    (cfg.stickers || []).forEach(function (s) { createSticker(s.emoji, s.x, s.y); });
    restartFx();
  }

  function encodeConfig(cfg) {
    return btoa(encodeURIComponent(JSON.stringify(cfg)));
  }
  function decodeConfig(str) {
    try { return JSON.parse(decodeURIComponent(atob(str))); } catch (e) { return null; }
  }

  /* ---------- 提示 ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add("hidden"); }, 2200);
  }

  /* ---------- 编辑 / 预览模式 ---------- */
  function setMode(edit) {
    editing = edit;
    body.classList.toggle("preview-mode", !edit);
    document.querySelectorAll("[data-key]").forEach(function (el) {
      el.setAttribute("contenteditable", edit ? "true" : "false");
    });
    document.getElementById("mode-toggle").textContent = edit ? "👀 预览模式" : "✏️ 编辑模式";
    if (!edit) document.getElementById("sticker-panel").classList.add("hidden");
  }

  document.getElementById("mode-toggle").addEventListener("click", function () {
    setMode(!editing);
    toast(editing ? "已进入编辑模式，点击文字即可修改" : "已进入预览模式");
  });

  /* ---------- 主题与特效 ---------- */
  document.getElementById("theme-select").addEventListener("change", function (e) {
    body.dataset.theme = e.target.value;
  });
  document.getElementById("effect-select").addEventListener("change", function (e) {
    body.dataset.effect = e.target.value;
    restartFx();
  });

  /* ---------- 贴纸 ---------- */
  var panel = document.getElementById("sticker-panel");
  var grid = panel.querySelector(".sticker-grid");
  STICKERS.forEach(function (emoji) {
    var b = document.createElement("button");
    b.textContent = emoji;
    b.addEventListener("click", function () {
      createSticker(emoji, 30 + Math.random() * 40, 20 + Math.random() * 40);
      panel.classList.add("hidden");
      toast("贴纸已添加，拖动调整位置，双击删除");
    });
    grid.appendChild(b);
  });

  document.getElementById("add-sticker-btn").addEventListener("click", function () {
    panel.classList.toggle("hidden");
  });

  function createSticker(emoji, xPct, yPct) {
    var el = document.createElement("div");
    el.className = "sticker";
    el.textContent = emoji;
    el.style.left = xPct + "%";
    el.style.top = yPct + "%";
    enableDrag(el);
    el.addEventListener("dblclick", function () {
      if (editing) { el.remove(); toast("贴纸已删除"); }
    });
    stickerLayer.appendChild(el);
    return el;
  }

  function enableDrag(el) {
    var startX, startY, origX, origY;
    function onDown(e) {
      if (!editing) return;
      e.preventDefault();
      var p = e.touches ? e.touches[0] : e;
      startX = p.clientX; startY = p.clientY;
      origX = parseFloat(el.style.left); origY = parseFloat(el.style.top);
      el.classList.add("dragging");
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    }
    function onMove(e) {
      e.preventDefault();
      var p = e.touches ? e.touches[0] : e;
      var rect = stage.getBoundingClientRect();
      var nx = origX + ((p.clientX - startX) / rect.width) * 100;
      var ny = origY + ((p.clientY - startY) / rect.height) * 100;
      el.style.left = Math.max(0, Math.min(96, nx)) + "%";
      el.style.top = Math.max(0, Math.min(96, ny)) + "%";
    }
    function onUp() {
      el.classList.remove("dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    }
    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: false });
  }

  /* ---------- 保存 / 分享 / 重置 ---------- */
  document.getElementById("save-btn").addEventListener("click", function () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getConfig()));
    toast("已保存到本地浏览器 💾");
  });

  document.getElementById("share-btn").addEventListener("click", function () {
    var url = location.origin + location.pathname + "#c=" + encodeConfig(getConfig());
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast("专属链接已复制，发给 TA 吧 🔗");
      }, function () { prompt("复制下面的链接发给 TA：", url); });
    } else {
      prompt("复制下面的链接发给 TA：", url);
    }
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    if (confirm("确定恢复默认内容吗？当前编辑将丢失。")) {
      localStorage.removeItem(STORAGE_KEY);
      applyConfig(JSON.parse(JSON.stringify(defaults)));
      toast("已恢复默认 ↺");
    }
  });

  /* ---------- 愿意 / 再想想 ---------- */
  document.getElementById("yes-btn").addEventListener("click", function () {
    document.getElementById("celebrate").classList.remove("hidden");
    burst();
  });
  document.getElementById("celebrate-close").addEventListener("click", function () {
    document.getElementById("celebrate").classList.add("hidden");
  });

  var noBtn = document.getElementById("no-btn");
  var noTexts = ["再想想", "真的不行吗 🥺", "再考虑一下嘛", "人家会伤心的 😢", "你忍心吗", "最后一次机会哦"];
  var noCount = 0;
  function dodge() {
    noCount++;
    noBtn.textContent = noTexts[Math.min(noCount, noTexts.length - 1)];
    var dx = (Math.random() - 0.5) * 240;
    var dy = (Math.random() - 0.5) * 160;
    noBtn.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + Math.max(0.55, 1 - noCount * 0.07) + ")";
  }
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener("click", dodge);

  /* ---------- 背景粒子特效 ---------- */
  var canvas = document.getElementById("fx-canvas");
  var ctx = canvas.getContext("2d");
  var particles = [];
  var rafId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  var FX = {
    hearts:  { glyphs: ["💗", "💖", "❤️", "💘"], rise: true,  spin: false, count: 26 },
    petals:  { glyphs: ["🌸", "🌺", "🌷"],        rise: false, spin: true,  count: 28 },
    stars:   { glyphs: ["✨", "⭐", "🌟"],        rise: false, spin: false, count: 34, twinkle: true },
    bubbles: { glyphs: ["🫧", "○", "◯"],          rise: true,  spin: false, count: 24 }
  };

  function makeParticle(fx, initial) {
    return {
      x: Math.random() * canvas.width,
      y: initial ? Math.random() * canvas.height : (fx.rise ? canvas.height + 40 : -40),
      size: 14 + Math.random() * 20,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.8,
      angle: Math.random() * Math.PI * 2,
      glyph: fx.glyphs[Math.floor(Math.random() * fx.glyphs.length)],
      alpha: fx.twinkle ? Math.random() : 0.5 + Math.random() * 0.5,
      tw: Math.random() * 0.04 + 0.01
    };
  }

  function restartFx() {
    cancelAnimationFrame(rafId);
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var fx = FX[body.dataset.effect];
    if (!fx) return;
    for (var i = 0; i < fx.count; i++) particles.push(makeParticle(fx, true));
    loop();
  }

  function loop() {
    var fx = FX[body.dataset.effect];
    if (!fx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p, i) {
      if (fx.twinkle) {
        p.alpha += p.tw;
        if (p.alpha > 1 || p.alpha < 0.1) p.tw = -p.tw;
      } else {
        p.y += fx.rise ? -p.speed : p.speed;
        p.x += p.drift;
        if (fx.spin) p.angle += 0.02;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      ctx.rotate(fx.spin ? p.angle : 0);
      ctx.font = p.size + "px serif";
      ctx.textAlign = "center";
      ctx.fillText(p.glyph, 0, 0);
      ctx.restore();
      if (!fx.twinkle && (p.y < -60 || p.y > canvas.height + 60)) {
        particles[i] = makeParticle(fx, false);
      }
    });
    rafId = requestAnimationFrame(loop);
  }

  /* 点「愿意」时的爆裂烟花 */
  function burst() {
    var n = 80;
    var pieces = [];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = 2 + Math.random() * 6;
      pieces.push({
        x: canvas.width / 2, y: canvas.height / 2,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2,
        glyph: ["💖", "✨", "🎉", "💘", "⭐"][i % 5],
        size: 16 + Math.random() * 16, life: 90
      });
    }
    function step() {
      pieces = pieces.filter(function (p) { return p.life > 0; });
      pieces.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
        ctx.save();
        ctx.globalAlpha = p.life / 90;
        ctx.font = p.size + "px serif";
        ctx.fillText(p.glyph, p.x, p.y);
        ctx.restore();
      });
      if (pieces.length) requestAnimationFrame(step);
    }
    step();
  }

  /* ---------- 启动 ---------- */
  var fromHash = null;
  if (location.hash.indexOf("#c=") === 0) {
    fromHash = decodeConfig(location.hash.slice(3));
  }
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* ignore */ }

  if (fromHash) {
    applyConfig(fromHash);
    setMode(false); // 收到分享链接的人默认看预览
  } else if (saved) {
    applyConfig(saved);
    setMode(true);
  } else {
    applyConfig(JSON.parse(JSON.stringify(defaults)));
    setMode(true);
  }
})();
