import "./style.css";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reduced.matches;
const motionButton = document.querySelector("#motion-toggle");
function updateMotion() {
  motionButton.setAttribute("aria-pressed", String(motionPaused));
  motionButton.innerHTML = motionPaused
    ? "Resume motion <span>▷</span>"
    : "Pause motion <span>Ⅱ</span>";
}
updateMotion();
motionButton.addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
reduced.addEventListener("change", (e) => {
  motionPaused = e.matches;
  updateMotion();
});
import("./mountain.js")
  .then(({ createMountain }) =>
    createMountain(document.querySelector("#mountain"), () => motionPaused),
  )
  .catch(() => {
    motionButton.hidden = true;
  });
document.querySelector("#year").textContent = new Date().getFullYear();
const storageKey = "teja-trail-v1";
let explored = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored))
    explored = new Set(
      stored.filter((x) =>
        ["work", "impact", "journey", "field-notes", "off-clock"].includes(x),
      ),
    );
} catch {}
function updateTrail() {
  document.querySelector("#trail-progress").textContent =
    `${explored.size} of 5 waypoints explored${explored.size === 5 ? " · A good day on the mountain." : ""}`;
  document
    .querySelectorAll(".trail-dots i")
    .forEach((d, i) => d.classList.toggle("visited", i < explored.size));
  try {
    localStorage.setItem(storageKey, JSON.stringify([...explored]));
  } catch {}
}
updateTrail();
const trailObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries)
      if (e.isIntersecting) {
        explored.add(e.target.id);
        updateTrail();
      }
  },
  { threshold: 0.22 },
);
["work", "impact", "journey", "field-notes", "off-clock"].forEach((id) =>
  trailObserver.observe(document.getElementById(id)),
);
document.querySelector("#reset-trail").addEventListener("click", () => {
  explored.clear();
  updateTrail();
});
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    }),
  { threshold: 0.08 },
);
if (!reduced.matches)
  document
    .querySelectorAll(
      ".section-heading,.intro-grid,.practice-grid,.project-heading,.project-card,.journey-grid,.notes-grid article,.play-heading,.play-card",
    )
    .forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.querySelector(".reading-progress").style.width =
        `${max ? (scrollY / max) * 100 : 0}%`;
      scrollQueued = false;
    });
  },
  { passive: true },
);
const dialog = document.querySelector("#detail-dialog"),
  content = document.querySelector("#dialog-content");
let cleanupGame = () => {};
let opener = null;
function showDialog(html) {
  opener = document.activeElement;
  cleanupGame();
  content.innerHTML = html;
  dialog.setAttribute("aria-labelledby", "dialog-title");
  content.querySelector("h2").id = "dialog-title";
  dialog.showModal();
  document.body.style.overflow = "hidden";
  dialog.querySelector(".dialog-close").focus();
}
function closeDialog() {
  dialog.close();
}
dialog.querySelector(".dialog-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeDialog();
  }
});
dialog.addEventListener("close", () => {
  cleanupGame();
  cleanupGame = () => {};
  document.body.style.overflow = "";
  opener?.focus();
});
const projects = {
  media: {
    tag: "MULTIMODAL INTELLIGENCE · EY",
    title: "See beyond the frame.",
    intro:
      "A video library holds more than footage. It holds scenes, spoken context, visual details, and possibilities that conventional metadata misses.",
    heading: "The engineering",
    items: [
      "Combine video understanding, audio parsing, and metadata enrichment for semantic, scene-level retrieval.",
      "Connect retrieval to downstream content workflows: highlights, summary podcasts, and articles.",
      "Adapt NVIDIA VSS patterns for media, sports, and other enterprise use cases.",
    ],
    foot: "At EY, I worked across multimodal media intelligence, retrieval architecture, and cross-functional delivery—connecting the underlying models to practical content workflows.",
  },
  agents: {
    tag: "AGENTIC SYSTEMS · EY",
    title: "From answers to action.",
    intro:
      "Useful agents need the right context, tools with clear boundaries, and a way to tell whether they are doing the job well.",
    heading: "The engineering",
    items: [
      "ReAct-style tool orchestration with grounded retrieval and guardrails.",
      "Enterprise ingestion and search across unstructured, semi-structured, and API-accessed information.",
      "Embedding optimization, vector search, and reranking to improve retrieval quality.",
    ],
    foot: "My work spans agentic RAG, enterprise search, and Q&A systems. Tools have included LangGraph, AutoGen, LlamaIndex, and multiple vector and search platforms.",
  },
  delivery: {
    tag: "TECHNICAL LEADERSHIP · ELIZA",
    title: "The last mile is the work.",
    intro:
      "A promising prototype is a starting point. Enterprise delivery also needs clear system boundaries, integration decisions, evaluation criteria, and a team equipped to own the result.",
    heading: "Where I focus",
    items: [
      "Translate customer needs into a practical architecture and explicit tradeoffs.",
      "Build alongside FDEs and review the decisions that matter for reliability and maintainability.",
      "Connect evaluation and acceptance criteria to real workflows.",
      "Turn deployment learning into reusable engineering practices and customer capability.",
    ],
    foot: "At Eliza, I bring architecture, hands-on engineering, and team development together—so each engagement leaves behind useful systems and stronger capabilities.",
  },
};
document.querySelectorAll("[data-project]").forEach((button) =>
  button.addEventListener("click", () => {
    const p = projects[button.dataset.project];
    showDialog(
      `<div class="dialog-eyebrow">${p.tag}</div><h2>${p.title}</h2><p>${p.intro}</p><h3>${p.heading}</h3><ul>${p.items.map((i) => `<li>${i}</li>`).join("")}</ul><p>${p.foot}</p><a class="text-link" href="https://www.linkedin.com/in/tejajuttu/" target="_blank" rel="noopener">Full experience on LinkedIn ↗</a>`,
    );
  }),
);
document.querySelector("#open-chess").addEventListener("click", () => {
  showDialog(
    '<div class="dialog-eyebrow">A MOMENT OF CLARITY</div><h2>One move. Checkmate.</h2><p>White to move. Select the queen, then her destination.<br>Sometimes the strongest move is the quietest one.</p><div class="chessboard" role="group" aria-label="Chess puzzle board"></div><p class="game-status" aria-live="polite">Find mate in one.</p><button class="game-button" id="chess-hint">A small hint</button>',
  );
  // Legal position: black Kh8; white Kf6, Qg6. Qg7 is protected mate.
  let selected = false,
    solved = false;
  const pieces = { h8: "♚", f6: "♔", g6: "♕" };
  const board = content.querySelector(".chessboard"),
    status = content.querySelector(".game-status");
  function draw() {
    const focused = document.activeElement?.dataset.square;
    board.innerHTML = "";
    for (let rank = 8; rank >= 1; rank--)
      for (let file = 0; file < 8; file++) {
        const sq = String.fromCharCode(97 + file) + rank;
        const b = document.createElement("button");
        b.dataset.square = sq;
        b.className = `square ${(rank + file) % 2 ? "dark" : ""} ${selected && sq === "g6" ? "selected" : ""}`;
        b.setAttribute(
          "aria-label",
          `${sq}${pieces[sq] ? ", " + { "♚": "black king", "♔": "white king", "♕": "white queen" }[pieces[sq]] : ", empty"}`,
        );
        b.innerHTML = `${pieces[sq] || ""}${file === 0 ? `<span class="rank">${rank}</span>` : ""}${rank === 1 ? `<span class="rank" style="top:auto;bottom:2px;left:auto;right:3px">${String.fromCharCode(97 + file)}</span>` : ""}`;
        b.addEventListener("click", () => {
          if (solved) return;
          if (sq === "g6") {
            selected = !selected;
            draw();
            status.textContent = selected
              ? "Queen selected. Choose a destination."
              : "Find mate in one.";
            return;
          }
          if (!selected) {
            status.textContent = "Select the white queen on g6 first.";
            return;
          }
          if (sq === "g7") {
            delete pieces.g6;
            pieces.g7 = "♕";
            selected = false;
            solved = true;
            draw();
            status.textContent =
              "Qg7# — checkmate. The king on f6 protects the queen; every escape is covered.";
          } else {
            status.textContent =
              "That is not the mating move. Look for a square protected by your king.";
          }
        });
        board.appendChild(b);
      }
    if (focused) board.querySelector(`[data-square="${focused}"]`)?.focus();
  }
  draw();
  content
    .querySelector("#chess-hint")
    .addEventListener(
      "click",
      () =>
        (status.textContent =
          "The white king protects g7. What happens if the queen goes there?"),
    );
});
document.querySelector("#open-descent").addEventListener("click", () => {
  showDialog(
    '<div class="dialog-eyebrow">A LITTLE PLAY GOES A LONG WAY</div><h2>One more run.</h2><p>Carve between the trees. Arrow keys, A / D, or drag across the slope. Collect golden trail markers.</p><div class="game-hud"><span id="run-distance">0 m</span><span id="run-markers">0 markers</span></div><canvas class="descent-stage" width="560" height="400" role="img" aria-label="Snowboard game. Steer left and right to avoid trees."></canvas><div class="game-controls"><button id="steer-left" aria-label="Steer left">←</button><button id="steer-right" aria-label="Steer right">→</button></div><p class="game-status" aria-live="polite">The mountain is yours.</p><button class="game-button" id="start-run">Start run</button>',
  );
  const canvas = content.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  let x = 280,
    distance = 0,
    markers = 0,
    objects = [],
    running = false,
    frame = 0,
    last = 0,
    spawn = 0,
    left = false,
    right = false,
    trail = [],
    pointer = false;
  const start = content.querySelector("#start-run"),
    status = content.querySelector(".game-status");
  function paint() {
    ctx.fillStyle = "#dae2d3";
    ctx.fillRect(0, 0, 560, 400);
    ctx.strokeStyle = "#b8c9b266";
    ctx.lineWidth = 1;
    for (let j = 0; j < 6; j++) {
      ctx.beginPath();
      ctx.moveTo(j * 125 - 90, 0);
      ctx.bezierCurveTo(
        j * 125 - 10,
        130,
        j * 125 - 120,
        260,
        j * 125 - 30,
        400,
      );
      ctx.stroke();
    }
    ctx.strokeStyle = "#9aaf9544";
    ctx.lineWidth = 3;
    ctx.beginPath();
    trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    for (const o of objects) {
      if (o.gold) {
        ctx.fillStyle = "#b98647";
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
      } else {
        ctx.fillStyle = "#b6c6b0";
        ctx.beginPath();
        ctx.ellipse(o.x + 9, o.y + 12, 15, 6, 0.4, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#44694e";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - 20);
        ctx.lineTo(o.x - 13, o.y + 10);
        ctx.lineTo(o.x + 13, o.y + 10);
        ctx.fill();
        ctx.fillStyle = "#35543f";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - 12);
        ctx.lineTo(o.x - 17, o.y + 17);
        ctx.lineTo(o.x + 17, o.y + 17);
        ctx.fill();
      }
    }
    ctx.save();
    ctx.translate(x, 315);
    ctx.rotate(left ? -0.25 : right ? 0.25 : 0);
    ctx.fillStyle = "#344e39";
    ctx.beginPath();
    ctx.roundRect(-15, 6, 30, 7, 4);
    ctx.fill();
    ctx.fillStyle = "#c0874b";
    ctx.beginPath();
    ctx.roundRect(-7, -9, 14, 20, 5);
    ctx.fill();
    ctx.fillStyle = "#233d30";
    ctx.beginPath();
    ctx.arc(0, -12, 6, 0, 7);
    ctx.fill();
    ctx.restore();
  }
  function end(message) {
    running = false;
    status.textContent = message;
    start.textContent = "Another run";
    start.hidden = false;
    cancelAnimationFrame(frame);
  }
  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!document.hidden) {
      distance += dt * 18;
      spawn += dt;
      x = Math.max(25, Math.min(535, x + (right - left) * dt * 240));
      if (spawn > 0.65) {
        spawn = 0;
        objects.push({
          x: 30 + Math.random() * 500,
          y: -25,
          gold: Math.random() > 0.65,
        });
      }
      trail.push({ x, y: 323 });
      if (trail.length > 120) trail.shift();
      trail.forEach((p) => (p.y -= dt * 145));
      for (const o of objects) {
        o.y += dt * 145;
        if (
          !o.hit &&
          Math.abs(o.y - 315) < 19 &&
          Math.abs(o.x - x) < (o.gold ? 20 : 22)
        ) {
          o.hit = true;
          if (o.gold) {
            markers++;
            o.y = 500;
          } else {
            paint();
            end(
              `A tumble at ${Math.floor(distance)} m. ${markers} markers collected. Every good run teaches you something.`,
            );
            return;
          }
        }
      }
      objects = objects.filter((o) => o.y < 430);
      content.querySelector("#run-distance").textContent =
        `${Math.floor(distance)} m`;
      content.querySelector("#run-markers").textContent = `${markers} markers`;
      paint();
      if (distance >= 500) {
        end(
          `500 m. ${markers} markers. A clean line. Take a breath—you earned the view.`,
        );
        return;
      }
    }
    frame = requestAnimationFrame(tick);
  }
  start.addEventListener("click", () => {
    x = 280;
    distance = 0;
    markers = 0;
    objects = [];
    trail = [];
    spawn = 0;
    running = true;
    start.hidden = true;
    status.textContent = "Find your rhythm.";
    last = performance.now();
    frame = requestAnimationFrame(tick);
  });
  const key = (e) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
      e.preventDefault();
      const down = e.type === "keydown";
      if (["ArrowLeft", "a", "A"].includes(e.key)) left = down;
      else right = down;
    }
  };
  window.addEventListener("keydown", key);
  window.addEventListener("keyup", key);
  const release = () => {
    left = false;
    right = false;
    pointer = false;
  };
  window.addEventListener("blur", release);
  canvas.addEventListener("pointerdown", (e) => {
    pointer = true;
    canvas.setPointerCapture(e.pointerId);
    const r = canvas.getBoundingClientRect();
    x = Math.max(25, Math.min(535, ((e.clientX - r.left) / r.width) * 560));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (pointer) {
      const r = canvas.getBoundingClientRect();
      x = Math.max(25, Math.min(535, ((e.clientX - r.left) / r.width) * 560));
    }
  });
  canvas.addEventListener("pointerup", () => (pointer = false));
  for (const [id, side] of [
    ["#steer-left", "left"],
    ["#steer-right", "right"],
  ]) {
    const b = content.querySelector(id);
    b.addEventListener("pointerdown", (e) => {
      b.setPointerCapture(e.pointerId);
      if (side === "left") left = true;
      else right = true;
    });
    b.addEventListener("pointerup", release);
    b.addEventListener("pointercancel", release);
  }
  paint();
  cleanupGame = () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("keydown", key);
    window.removeEventListener("keyup", key);
    window.removeEventListener("blur", release);
  };
});
