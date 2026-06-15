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
  selectPlaceholder: { en: "Choose one…", ar: "اختر إجابة…" },
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

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Look up the score of the selected option for a diagnostic question.
function diagScore(qid) {
  const q = QUESTIONS.find((x) => x.id === qid);
  if (!q || !q.options) return 0;
  const opt = q.options.find((o) => o.value === answers[qid]);
  return opt ? opt.score || 0 : 0;
}

// The algorithm: 5 diagnostic answers → overall AI Stage score + breakdown.
function computeScore() {
  const usage = diagScore("dx_usage");
  const depth = diagScore("dx_depth");
  const automation = diagScore("dx_automation");
  const comfort = diagScore("dx_comfort");
  const opportunity = diagScore("dx_opportunity");

  const skill = Math.round((usage + depth) / 2);
  const overall = clampScore(
    skill * 0.3 + automation * 0.3 + comfort * 0.2 + opportunity * 0.2
  );

  return {
    overall,
    breakdown: [
      { label: { en: "AI Skill", ar: "مهارة الذكاء الاصطناعي" }, value: skill, emoji: "🧠" },
      { label: { en: "Automation", ar: "الأتمتة" }, value: automation, emoji: "🔧" },
      { label: { en: "Tech Comfort", ar: "الراحة التقنية" }, value: comfort, emoji: "🛠️" },
      { label: { en: "Opportunity", ar: "الفرصة" }, value: opportunity, emoji: "⏳" },
    ],
  };
}

// Stage label + message shown to the member.
function aiStage(s) {
  if (s >= 76)
    return {
      label: { en: "Stage 4 · 🚀 Advanced", ar: "المستوى ٤ · 🚀 متقدم" },
      msg: {
        en: "You're already building with AI — now let's make it systematic and scalable.",
        ar: "إنت فعلاً تبني بالذكاء الاصطناعي — خلّينا نخليها منهجية وقابلة للتوسّع.",
      },
    };
  if (s >= 51)
    return {
      label: { en: "Stage 3 · 🔧 Builder", ar: "المستوى ٣ · 🔧 بانٍ" },
      msg: {
        en: "You've got real momentum. A few systems and you'll be saving serious hours.",
        ar: "عندك زخم حقيقي. كم نظام وبتوفّر ساعات كثيرة.",
      },
    };
  if (s >= 26)
    return {
      label: { en: "Stage 2 · ⚡ Beginner", ar: "المستوى ٢ · ⚡ مبتدئ" },
      msg: {
        en: "You've started — now it's about consistency and your first real automations.",
        ar: "بدأت — الحين الموضوع ثبات وأول أتمتة حقيقية لك.",
      },
    };
  return {
    label: { en: "Stage 1 · 🌱 Explorer", ar: "المستوى ١ · 🌱 مستكشف" },
    msg: {
      en: "A perfect starting point. The foundations will change how you work, fast.",
      ar: "نقطة بداية مثالية. الأساسيات بتغيّر طريقة شغلك بسرعة.",
    },
  };
}

// English stage name (no emoji) saved to the Sheet.
function stageNameEN(s) {
  if (s >= 76) return "Stage 4 · Advanced";
  if (s >= 51) return "Stage 3 · Builder";
  if (s >= 26) return "Stage 2 · Beginner";
  return "Stage 1 · Explorer";
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

function recommendLine(overall) {
  if (overall >= 76)
    return {
      en: "You're advanced — move fast through the foundations to fill any gaps, then aim for Level 3 to unlock the private workshops and company systems.",
      ar: "إنت متقدّم — مرّ بسرعة على الأساسيات تسد أي ثغرة، وبعدها اهدف للمستوى الثالث وتفتح الورشات الخاصة وأنظمة الشركات.",
    };
  if (overall >= 51)
    return {
      en: "You've got a solid base. Lock in Automation + Claude in your first 30 days and you'll be ready to build your app with confidence.",
      ar: "عندك أساس جيد. ثبّت الأتمتة وكلود في أول 30 يوم وبتكون جاهز تبني تطبيقك بثقة.",
    };
  if (overall >= 26)
    return {
      en: "You've started — now it's about consistency. Do the daily task in every video and build your first real automations.",
      ar: "بدأت — الحين الموضوع ثبات. نفّذ مهمة كل فيديو يوميًا وابنِ أول أتمتة حقيقية لك.",
    };
  return {
    en: "Perfect starting point. Take it step by step — foundations matter more than speed. Don't skip any section.",
    ar: "نقطة بداية مثالية. خذها خطوة بخطوة — الأساس أهم من السرعة. لا تتجاوز أي قسم.",
  };
}

function renderThankYou(q) {
  const wrap = el("div", "center");
  const result = computeScore();
  const score = result.overall;
  const tier = aiStage(score);
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

    <div class="breakdown" dir="${dir}">
      ${result.breakdown
        .map(
          (b) => `<div class="bd-row">
            <span class="bd-label">${b.emoji} ${t(b.label)}</span>
            <span class="bd-bar"><span class="bd-fill" style="width:0%" data-val="${b.value}"></span></span>
            <span class="bd-val">${b.value}</span>
          </div>`
        )
        .join("")}
    </div>

    <div class="reco" dir="${dir}">
      <div class="reco__title">${t(UI.recoTitle)}</div>
      <div class="reco__line">${t(recommendLine(score))}</div>
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

  // Animate the breakdown bars filling in.
  setTimeout(() => {
    wrap.querySelectorAll(".bd-fill").forEach((f) => {
      f.style.width = f.dataset.val + "%";
    });
  }, 200);

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
  } else if (q.type === "select") {
    control = renderSelect(q);
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

  if (q.type !== "choice" && q.type !== "rating" && q.type !== "select") {
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

function renderSelect(q) {
  const wrap = el("div");
  const sel = document.createElement("select");
  sel.className = "select-input";

  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = t(UI.selectPlaceholder);
  ph.disabled = true;
  ph.selected = !answers[q.id];
  sel.appendChild(ph);

  q.options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = t(opt.label);
    if (answers[q.id] === opt.value) o.selected = true;
    sel.appendChild(o);
  });

  sel.addEventListener("change", () => {
    answers[q.id] = sel.value;
    setTimeout(goNext, 250);
  });

  wrap.appendChild(sel);
  return wrap;
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
  const result = computeScore();
  const payload = {
    ...answers,
    ai_score: result.overall,
    ai_stage: stageNameEN(result.overall),
    lang: LANG,
    submitted_at: new Date().toISOString(),
  };

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
