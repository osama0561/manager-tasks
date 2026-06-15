/* ============================================================
   Typeform-style assessment engine — vanilla JS, no build step.
   Bilingual (EN/AR) with a language toggle and RTL support.
   Submits answers to a Google Apps Script Web App (see CONFIG).
   ============================================================ */

const VOICE_IMG = "assets/keyboard-mic.png";
const ONERR = "this.style.display='none'";

const CONFIG = {
  // Paste the Web App URL from deploying google-apps-script.gs.
  // Leave "" for demo mode (answers download as JSON).
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxbwWkOM0gD7RvswKJCywcYT-3Tw2aWhReWIsjYKOfPHrZxouI250BTNvoUIDV0BRss/exec",
};

/* ---------- Language / i18n ---------- */

let LANG = localStorage.getItem("lang") || "en";

// Pick the active language from an { en, ar } object; plain strings pass through.
function t(val) {
  if (val == null) return "";
  if (typeof val === "object") return val[LANG] != null ? val[LANG] : (val.en || val.ar || "");
  return val;
}

// UI strings (everything that isn't in questions.js).
const UI = {
  ok: { en: "OK", ar: "تم" },
  submit: { en: "Submit ✓", ar: "إرسال ✓" },
  enterNote: { en: "press <strong>Enter ↵</strong>", ar: "اضغط <strong>Enter ↵</strong>" },
  ctrlEnterNote: { en: "or press <strong>Ctrl/⌘ + Enter</strong>", ar: "أو اضغط <strong>Ctrl/⌘ + Enter</strong>" },
  navHint: { en: "press <strong>Enter ↵</strong>", ar: "اضغط <strong>Enter ↵</strong>" },
  required: { en: "This one's required 🙂", ar: "هذا الحقل مطلوب 🙂" },
  badEmail: { en: "Hmm, that email doesn't look right.", ar: "تأكد من البريد الإلكتروني." },
  saving: { en: "Saving…", ar: "جارٍ الحفظ…" },
  saveErr: { en: "Couldn't save — please try again.", ar: "تعذّر الحفظ — حاول مرة ثانية." },
  voiceHint: {
    en: "Tip: tap the 🎤 on your keyboard and just talk — say as much as you want.",
    ar: "نصيحة: اضغط 🎤 في لوحة المفاتيح وتكلّم — قول اللي تبي بدون ما تكتب.",
  },
  recoTitle: { en: "📍 Where to start", ar: "📍 من وين تبدأ" },
  shareCta: {
    en: "📸 <strong>Screenshot your score & path</strong> and share it in {where} — show us where you're starting! 🚀",
    ar: "📸 <strong>صوّر نتيجتك ومسارك</strong> وانشرها في {where} — شاركنا من وين بتبدأ! 🚀",
  },
  // The toggle shows the language you'll switch TO.
  langToggle: { en: "العربية", ar: "English" },
};

function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  const tg = document.getElementById("langToggle");
  if (tg) tg.textContent = t(UI.langToggle);
}

function toggleLang() {
  LANG = LANG === "en" ? "ar" : "en";
  localStorage.setItem("lang", LANG);
  applyLang();
  render();
}

/* ---------- DOM refs ---------- */

const stage = document.getElementById("stage");
const progressBar = document.getElementById("progressBar");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const navHint = document.getElementById("navHint");
const langToggleBtn = document.getElementById("langToggle");

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
  return `<img class="brand-logo" src="assets/logo.png" alt="Logo" onerror="${ONERR}" />`;
}

function renderWelcome(q) {
  const wrap = el("div", "center");
  wrap.innerHTML = `
    ${brandLogo()}
    <div class="q-title">${t(q.title)}</div>
    <div class="q-sub">${t(q.subtitle)}</div>
  `;

  if (q.voiceTip) {
    const tip = el("div", "voice-tip");
    const visual = q.voiceImage
      ? `<img class="voice-tip__img" src="${q.voiceImage}" alt="" onerror="${ONERR}" />`
      : `<div class="voice-tip__mic" aria-hidden="true">🎤</div>`;
    tip.innerHTML = `${visual}<div class="voice-tip__text">${t(q.voiceTip)}</div>`;
    wrap.appendChild(tip);
  }

  const btn = button(t(q.cta) || "Start →", "btn btn--primary");
  btn.addEventListener("click", goNext);
  wrap.appendChild(btn);
  return wrap;
}

/* ---------- Score + recommendation ---------- */

function computeScore(a) {
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
    return {
      label: { en: "🚀 Automation Ready", ar: "🚀 جاهز للأتمتة" },
      msg: {
        en: "You're primed to turn AI into real hours back. Let's build.",
        ar: "إنت جاهز تحوّل الذكاء الاصطناعي لساعات توفرها فعليًا. يلا نبدأ.",
      },
    };
  if (s >= 70)
    return {
      label: { en: "⚡ High Potential", ar: "⚡ إمكانيات عالية" },
      msg: {
        en: "Big wins are hiding in your week — we'll unlock them together.",
        ar: "فيه مكاسب كبيرة مخبّأة في أسبوعك — بنفتحها مع بعض.",
      },
    };
  return {
    label: { en: "🌱 Ready to Grow", ar: "🌱 جاهز تنمو" },
    msg: {
      en: "A perfect starting point — the gains from here are the biggest.",
      ar: "نقطة بداية مثالية — المكاسب من هنا هي الأكبر.",
    },
  };
}

// Fixed unlock path. Course names stay in Arabic (proper names); tags/notes translate.
const LEARNING_PATH = [
  { tag: { en: "Start now", ar: "ابدأ الآن" }, course: "🚀 (ابدأ هنا)", note: { en: "Learn the platform from your phone — don't skip it", ar: "تعلّم المنصة من جوالك — لا تتجاوز هذا القسم" } },
  { tag: { en: "Start now", ar: "ابدأ الآن" }, course: "⚙️ أساسيات الأتمتة", note: { en: "Do the task in every video, daily", ar: "نفّذ مهمة كل فيديو يوميًا" } },
  { tag: { en: "Level 2", ar: "المستوى 2" }, course: "🤖 معسكر claude ai", note: { en: "Aim to reach it within your first 30 days", ar: "اهدف توصله خلال أول 30 يوم" } },
  { tag: { en: "After 30 days", ar: "بعد 30 يوم" }, course: "📱 كيف تبني تطبيقات بالذكاء الاصطناعي", note: { en: "Build your app on a strong foundation", ar: "تبني تطبيقك بأساس قوي" } },
  { tag: { en: "After 30 days", ar: "بعد 30 يوم" }, course: "🏢 مكتبة أنظمة الشركات", note: { en: "Advanced systems from real-world builds", ar: "أنظمة متقدمة من تجارب حقيقية" } },
  { tag: { en: "Level 3", ar: "المستوى 3" }, course: "🎁 مكتبة الورشات الخاصة", note: { en: "Your reward for giving back to the community", ar: "مكافأة تفاعلك وعطائك للمجتمع" } },
];

function recommendLine(a) {
  const lvl = Number(a.ai_level) || 1;
  if (lvl <= 2)
    return {
      en: "You're at the start of your AI journey — the best time to begin. Take it step by step; foundations matter more than speed. Don't skip sections.",
      ar: "إنت في بداية طريقك مع الذكاء الاصطناعي، وهذا أفضل وقت تبدأ فيه. خذها خطوة بخطوة — الأساس أهم من السرعة، ولا تتجاوز الأقسام.",
    };
  if (lvl === 3)
    return {
      en: "You've got a solid base. Focus on Automation + Claude in your first 30 days, and you'll be ready to build your app with confidence.",
      ar: "عندك أساس جيد. ركّز على الأتمتة وكلود في أول 30 يوم، وبتكون جاهز تبني تطبيقك بثقة.",
    };
  return {
    en: "Your experience is strong and you'll move fast — lock in the fundamentals first, and aim for Level 3 to unlock the private workshops.",
    ar: "خبرتك ممتازة وبتتحرك بسرعة — ثبّت الأساسيات أول، وخلّي هدفك توصل المستوى الثالث وتفتح الورشات الخاصة.",
  };
}

function renderThankYou(q) {
  const wrap = el("div", "center");
  const score = computeScore(answers);
  const tier = scoreTier(score);
  const where = q.community || "the community";
  const dir = LANG === "ar" ? "rtl" : "ltr";

  wrap.innerHTML = `
    ${brandLogo()}
    <div class="q-title">${t(q.title)}</div>
    <div class="score-ring" style="--val:0">
      <div class="score-ring__inner">
        <span class="score-num">0</span><span class="score-max">/100</span>
      </div>
    </div>
    <div class="score-tier">${t(tier.label)}</div>
    <div class="q-sub">${t(tier.msg)}</div>

    <div class="reco" dir="${dir}">
      <div class="reco__title">${t(UI.recoTitle)}</div>
      <div class="reco__line">${t(recommendLine(answers))}</div>
      <ol class="reco__list">
        ${LEARNING_PATH.map(
          (s) => `<li>
            <span class="reco__tag">${t(s.tag)}</span>
            <span class="reco__body">
              <span class="reco__course">${s.course}</span>
              <span class="reco__note">${t(s.note)}</span>
            </span>
          </li>`
        ).join("")}
      </ol>
    </div>

    <div class="score-share" dir="${dir}">
      ${t(UI.shareCta).replace("{where}", where)}
    </div>
  `;

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
  title.innerHTML = t(q.title) + (q.required ? ' <span class="required-star">*</span>' : "");
  wrap.appendChild(title);

  if (q.subtitle) {
    const sub = el("div", "q-sub");
    sub.textContent = t(q.subtitle);
    wrap.appendChild(sub);
  }

  const field = el("div", "field");
  let control;

  if (q.type === "short_text" || q.type === "email") {
    control = document.createElement("input");
    control.type = q.type === "email" ? "email" : "text";
    control.placeholder = t(q.placeholder) || "";
    control.value = answers[q.id] || "";
    control.addEventListener("input", (e) => (answers[q.id] = e.target.value));
    control.addEventListener("keydown", onEnter);
  } else if (q.type === "long_text") {
    control = document.createElement("textarea");
    control.placeholder = t(q.placeholder) || "";
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

  // Voice reminder on long-answer questions.
  if (q.type === "long_text") {
    const vh = el("div", "voice-hint");
    vh.innerHTML = `
      <img class="voice-hint__img" src="${VOICE_IMG}" alt="" onerror="${ONERR}" />
      <span>${t(UI.voiceHint)}</span>
    `;
    wrap.appendChild(vh);
  }

  const err = el("div", "error-msg");
  err.id = "err";
  wrap.appendChild(err);

  if (q.type !== "choice" && q.type !== "rating") {
    const row = el("div", "ok-row");
    const ok = button(isLast() ? t(UI.submit) : t(UI.ok), "btn btn--primary");
    ok.addEventListener("click", goNext);
    row.appendChild(ok);
    const note = el("span", "enter-note");
    note.innerHTML = q.type === "long_text" ? t(UI.ctrlEnterNote) : t(UI.enterNote);
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
    o.innerHTML = `<span class="key">${String.fromCharCode(65 + i)}</span><span>${t(opt.label)}</span>`;
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
  labels.innerHTML = `<span>${t(q.minLabel) || q.min}</span><span>${t(q.maxLabel) || q.max}</span>`;
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
    if (errEl) errEl.textContent = t(UI.required);
    return false;
  }
  if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim())) {
    if (errEl) errEl.textContent = t(UI.badEmail);
    return false;
  }
  if (errEl) errEl.textContent = "";
  return true;
}

function isLast() {
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
  navHint.innerHTML = t(UI.navHint);
  navHint.style.visibility =
    q.type === "welcome" || q.type === "thankyou" ? "hidden" : "visible";
}

backBtn.addEventListener("click", goBack);
nextBtn.addEventListener("click", goNext);
if (langToggleBtn) langToggleBtn.addEventListener("click", toggleLang);
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && document.activeElement.tagName !== "TEXTAREA") goBack();
});

/* ---------- Submission ---------- */

async function submit() {
  const errEl = document.getElementById("err");
  const payload = { ...answers, lang: LANG, submitted_at: new Date().toISOString() };

  if (!CONFIG.ENDPOINT) {
    console.log("DEMO MODE — submission payload:", payload);
    downloadJSON(payload);
    advanceToThankYou();
    return;
  }

  try {
    if (errEl) errEl.textContent = t(UI.saving);
    // GET with query params survives Apps Script's redirect (most reliable).
    const qs = new URLSearchParams(payload).toString();
    await fetch(CONFIG.ENDPOINT + "?" + qs, { mode: "no-cors" });
    advanceToThankYou();
  } catch (err) {
    console.error(err);
    if (errEl) errEl.textContent = t(UI.saveErr);
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

applyLang();
render();
