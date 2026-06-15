/* ============================================================
   Typeform-style assessment engine — vanilla JS, no build step.
   Submits answers to a Google Apps Script Web App (see CONFIG).
   ============================================================ */

const CONFIG = {
  // Paste the Web App URL you get from deploying google-apps-script.gs.
  // Leave "" to run in demo mode (answers logged to console + downloaded as JSON).
  ENDPOINT: "",
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

function renderWelcome(q) {
  const wrap = el("div", "center");
  wrap.innerHTML = `
    <div class="q-title">${q.title}</div>
    <div class="q-sub">${q.subtitle}</div>
  `;
  const btn = button(q.cta || "Start →", "btn btn--primary");
  btn.addEventListener("click", goNext);
  wrap.appendChild(btn);
  return wrap;
}

function renderThankYou(q) {
  const wrap = el("div", "center");
  wrap.innerHTML = `
    <div class="big-emoji">🎉</div>
    <div class="q-title">${q.title}</div>
    <div class="q-sub">${q.subtitle}</div>
  `;
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
    await fetch(CONFIG.ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Apps Script web apps need this
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
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
