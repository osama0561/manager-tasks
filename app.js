/* ============================================================
   Typeform-style assessment engine — vanilla JS, no build step.
   Submits answers to a Google Apps Script Web App (see CONFIG).
   ============================================================ */

// Image of the keyboard mic/dictation button. Drop the file in /assets and it
// shows on the welcome screen and long-answer questions. Missing file = hidden.
const VOICE_IMG = "assets/keyboard-mic.png";
const ONERR = "this.style.display='none'";

const CONFIG = {
  // Paste the Web App URL you get from deploying google-apps-script.gs.
  // Leave "" to run in demo mode (answers logged to console + downloaded as JSON).
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxbwWkOM0gD7RvswKJCywcYT-3Tw2aWhReWIsjYKOfPHrZxouI250BTNvoUIDV0BRss/exec",
};

const stage = document.getElementById("stage");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const navHint = document.getElementById("navHint");

let index = 0;
const answers = {};

/* ---------- Rendering ---------- */

function render() {
  const q = QUESTIONS[index];
  updateProgress();
  updateNav();

  const card = document.createElement("div");
  card.className = "card";

  if (q.type === "welcome") card.appendChild(renderWelcome(q));
  else if (q.type === "thankyou") card.appendChild(renderThankYou(q));
  else card.appendChild(renderQuestion(q));

  stage.innerHTML = "";
  stage.appendChild(card);

  const focusable = card.querySelector("input, textarea");
  if (focusable) setTimeout(() => focusable.focus(), 120);
}

function brandLogo() {
  // Renders the logo if assets/logo.png exists; otherwise hides itself.
  return `<img class="brand-logo" src="assets/logo.png" alt="Logo" onerror="${ONERR}" />`;
}

function renderWelcome(q) {
  const wrap = el("div", "center");
  wrap.innerHTML = `
    ${brandLogo()}
    <div class="q-title">${q.title}</div>
    <div class="q-sub">${q.subtitle}</div>
  `;

  if (q.voiceTip) {
    const tip = el("div", "voice-tip");
    const visual = q.voiceImage
      ? `<img class="voice-tip__img" src="${q.voiceImage}" alt="Tap the microphone on your keyboard" onerror="${ONERR}" />`
      : `<div class="voice-tip__mic" aria-hidden="true">🎤</div>`;
    tip.innerHTML = `
      ${visual}
      <div class="voice-tip__text">${q.voiceTip}</div>
    `;
    wrap.appendChild(tip);
  }

  const btn = button(q.cta || "Start →", "btn btn--primary");
  btn.addEventListener("click", goNext);
  wrap.appendChild(btn);
  return wrap;
}

function computeScore(a) {
  // A motivating "AI Automation Score" out of 100. Higher = more ready + more
  // to gain. Always lands in an encouraging range so it's nice to share.
  let score = 50;
  const lvl = Number(a.ai_level) || 1;
  score += lvl * 5; // experience: 5–25
  const hoursPts = { "0-2": 5, "3-5": 10, "6-10": 15, "10+": 20 };
  score += hoursPts[a.hours_lost] || 5; // opportunity: 5–20
  ["problem", "obstacle", "goal"].forEach((k) => {
    if (a[k] && String(a[k]).trim().length >= 20) score += 5; // engagement: 0–15
  });
  return Math.min(100, score);
}

function scoreTier(s) {
  if (s >= 85)
    return { label: "🚀 Automation Ready", msg: "You're primed to turn AI into real hours back. Let's build." };
  if (s >= 70)
    return { label: "⚡ High Potential", msg: "Big wins are hiding in your week — we'll unlock them together." };
  return { label: "🌱 Ready to Grow", msg: "A perfect starting point — the gains from here are the biggest." };
}

// The fixed learning path (unlock order) — same for every new member.
const LEARNING_PATH = [
  { tag: "ابدأ الآن", course: "🚀 (ابدأ هنا)", note: "تعلّم المنصة من جوالك — لا تتجاوز هذا القسم" },
  { tag: "ابدأ الآن", course: "⚙️ أساسيات الأتمتة", note: "نفّذ مهمة كل فيديو يوميًا" },
  { tag: "المستوى 2", course: "🤖 معسكر claude ai", note: "اهدف توصله خلال أول 30 يوم" },
  { tag: "بعد 30 يوم", course: "📱 كيف تبني تطبيقات بالذكاء الاصطناعي", note: "تبني تطبيقك بأساس قوي" },
  { tag: "بعد 30 يوم", course: "🏢 مكتبة أنظمة الشركات", note: "أنظمة متقدمة من تجارب حقيقية" },
  { tag: "المستوى 3", course: "🎁 مكتبة الورشات الخاصة", note: "مكافأة تفاعلك وعطائك للمجتمع" },
];

// A personalized line based on their self-rated AI level.
function recommendLine(a) {
  const lvl = Number(a.ai_level) || 1;
  if (lvl <= 2)
    return "إنت في بداية طريقك مع الذكاء الاصطناعي، وهذا أفضل وقت تبدأ فيه. خذها خطوة بخطوة — الأساس أهم من السرعة، ولا تتجاوز الأقسام.";
  if (lvl === 3)
    return "عندك أساس جيد. ركّز على الأتمتة وكلود في أول 30 يوم، وبتكون جاهز تبني تطبيقك بثقة.";
  return "خبرتك ممتازة وبتتحرك بسرعة — ثبّت الأساسيات أول، وخلّي هدفك توصل المستوى الثالث وتفتح الورشات الخاصة.";
}

function renderThankYou(q) {
  const wrap = el("div", "center");
  const score = computeScore(answers);
  const tier = scoreTier(score);
  const where = q.community || "the community";
  wrap.innerHTML = `
    ${brandLogo()}
    <div class="q-title">${q.title}</div>
    <div class="score-ring" style="--val:0">
      <div class="score-ring__inner">
        <span class="score-num">0</span><span class="score-max">/100</span>
      </div>
    </div>
    <div class="score-tier">${tier.label}</div>
    <div class="q-sub">${tier.msg}</div>

    <div class="reco" dir="rtl">
      <div class="reco__title">📍 من وين تبدأ</div>
      <div class="reco__line">${recommendLine(answers)}</div>
      <ol class="reco__list">
        ${LEARNING_PATH.map(
          (s) => `<li>
            <span class="reco__tag">${s.tag}</span>
            <span class="reco__body">
              <span class="reco__course">${s.course}</span>
              <span class="reco__note">${s.note}</span>
            </span>
          </li>`
        ).join("")}
      </ol>
    </div>

    <div class="score-share" dir="rtl">
      📸 <strong>صوّر نتيجتك ومسارك</strong> وانشرها في ${where} — شاركنا من وين بتبدأ! 🚀
    </div>
  `;

  // Animate the ring + number counting up.
  const ring = wrap.querySelector(".score-ring");
  const num = wrap.querySelector(".score-num");
  let cur = 0;
  const inc = Math.max(1, Math.round(score / 45));
  const tick = () => {
    cur = Math.min(score, cur + inc);
    ring.style.setProperty("--val", cur);
    num.textContent = cur;
    if (cur < score) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return wrap;
}

function questionNumber() {
  // Count only real questions (skip welcome) for the "N of M" label.
  const reals = QUESTIONS.filter((q) => q.id);
  const realIndex = reals.findIndex((q) => q === QUESTIONS[index]);
  return { n: realIndex + 1, total: reals.length };
}

function renderQuestion(q) {
  const wrap = el("div");
  const { n, total } = questionNumber();

  const kicker = el("div", "kicker");
  kicker.innerHTML = `<span class="num">${n} → ${total}</span>`;
  wrap.appendChild(kicker);

  const title = el("div", "q-title");
  title.innerHTML =
    q.title + (q.required ? ' <span class="required-star">*</span>' : "");
  wrap.appendChild(title);

  if (q.subtitle) {
    const sub = el("div", "q-sub");
    sub.textContent = q.subtitle;
    wrap.appendChild(sub);
  }

  const field = el("div", "field");
  let control;

  if (q.type === "short_text" || q.type === "email") {
    control = document.createElement("input");
    control.type = q.type === "email" ? "email" : "text";
    control.placeholder = q.placeholder || "";
    control.value = answers[q.id] || "";
    control.addEventListener("input", (e) => (answers[q.id] = e.target.value));
    control.addEventListener("keydown", onEnter);
  } else if (q.type === "long_text") {
    control = document.createElement("textarea");
    control.placeholder = q.placeholder || "";
    control.value = answers[q.id] || "";
    control.addEventListener("input", (e) => (answers[q.id] = e.target.value));
    control.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) goNext();
    });
  } else if (q.type === "choice") {
    control = renderChoice(q);
  } else if (q.type === "rating") {
    control = renderRating(q);
  }

  field.appendChild(control);
  wrap.appendChild(field);

  // Voice reminder on long-answer questions — nudges them to dictate.
  if (q.type === "long_text") {
    const vh = el("div", "voice-hint");
    vh.innerHTML = `
      <img class="voice-hint__img" src="${VOICE_IMG}" alt="" onerror="${ONERR}" />
      <span>Tip: tap the 🎤 on your keyboard and just talk — say as much as you want.</span>
    `;
    wrap.appendChild(vh);
  }

  const err = el("div", "error-msg");
  err.id = "err";
  wrap.appendChild(err);

  if (q.type !== "choice" && q.type !== "rating") {
    const row = el("div", "ok-row");
    const ok = button(isLast() ? "Submit ✓" : "OK", "btn btn--primary");
    ok.addEventListener("click", goNext);
    row.appendChild(ok);
    const note = el("span", "enter-note");
    note.innerHTML =
      q.type === "long_text" ? "or press <strong>Ctrl/⌘ + Enter</strong>" : "press <strong>Enter ↵</strong>";
    row.appendChild(note);
    wrap.appendChild(row);
  }

  return wrap;
}

function renderChoice(q) {
  const list = el("div", "options");
  q.options.forEach((opt, i) => {
    const o = el("div", "opt");
    if (answers[q.id] === opt.value) o.classList.add("selected");
    o.innerHTML = `<span class="key">${String.fromCharCode(65 + i)}</span><span>${opt.label}</span>`;
    o.addEventListener("click", () => {
      answers[q.id] = opt.value;
      list.querySelectorAll(".opt").forEach((x) => x.classList.remove("selected"));
      o.classList.add("selected");
      setTimeout(goNext, 220);
    });
    list.appendChild(o);
  });
  return list;
}

function renderRating(q) {
  const wrap = el("div");
  const row = el("div", "rating");
  for (let v = q.min; v <= q.max; v++) {
    const b = button(String(v), "");
    if (String(answers[q.id]) === String(v)) b.classList.add("selected");
    b.addEventListener("click", () => {
      answers[q.id] = v;
      row.querySelectorAll("button").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      setTimeout(goNext, 220);
    });
    row.appendChild(b);
  }
  wrap.appendChild(row);
  const labels = el("div", "rating__labels");
  labels.innerHTML = `<span>${q.minLabel || q.min}</span><span>${q.maxLabel || q.max}</span>`;
  wrap.appendChild(labels);
  return wrap;
}

/* ---------- Navigation ---------- */

function onEnter(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    goNext();
  }
}

function validate() {
  const q = QUESTIONS[index];
  if (!q.id || !q.required) return true;
  const val = answers[q.id];
  const errEl = document.getElementById("err");
  if (val === undefined || String(val).trim() === "") {
    if (errEl) errEl.textContent = "This one's required 🙂";
    return false;
  }
  if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim())) {
    if (errEl) errEl.textContent = "Hmm, that email doesn't look right.";
    return false;
  }
  if (errEl) errEl.textContent = "";
  return true;
}

function isLast() {
  // last real question is the one before the thankyou screen
  return index === QUESTIONS.length - 2;
}

function goNext() {
  if (!validate()) return;
  if (index === QUESTIONS.length - 2) {
    submit();
    return;
  }
  if (index < QUESTIONS.length - 1) {
    transition(() => {
      index++;
      render();
    });
  }
}

function goBack() {
  if (index > 0) {
    transition(() => {
      index--;
      render();
    });
  }
}

function transition(fn) {
  const card = stage.querySelector(".card");
  if (card) {
    card.classList.add("leaving");
    setTimeout(fn, 220);
  } else fn();
}

function updateProgress() {
  const pct = (index / (QUESTIONS.length - 1)) * 100;
  progressBar.style.width = pct + "%";
}

function updateNav() {
  const q = QUESTIONS[index];
  backBtn.disabled = index === 0;
  nextBtn.disabled = index >= QUESTIONS.length - 1;
  navHint.style.visibility =
    q.type === "welcome" || q.type === "thankyou" ? "hidden" : "visible";
}

backBtn.addEventListener("click", goBack);
nextBtn.addEventListener("click", goNext);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && document.activeElement.tagName !== "TEXTAREA") goBack();
});

/* ---------- Submission ---------- */

async function submit() {
  const errEl = document.getElementById("err");
  const payload = { ...answers, submitted_at: new Date().toISOString() };

  if (!CONFIG.ENDPOINT) {
    console.log("DEMO MODE — submission payload:", payload);
    downloadJSON(payload);
    advanceToThankYou();
    return;
  }

  try {
    if (errEl) errEl.textContent = "Saving…";
    // Submit as a GET with query params. Query params survive Apps Script's
    // redirect (they stay in the URL), so this is the most reliable method.
    const qs = new URLSearchParams(payload).toString();
    await fetch(CONFIG.ENDPOINT + "?" + qs, { mode: "no-cors" });
    advanceToThankYou();
  } catch (err) {
    console.error(err);
    if (errEl) errEl.textContent = "Couldn't save — please try again.";
  }
}

function advanceToThankYou() {
  transition(() => {
    index = QUESTIONS.length - 1;
    render();
  });
}

function downloadJSON(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `assessment-${(obj.name || "member").replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
}

/* ---------- Helpers ---------- */

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}
function button(text, cls) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = text;
  return b;
}

render();
