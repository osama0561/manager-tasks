/* ============================================================
   AI Coaching — Member Assessment questions (bilingual EN/AR)

   Two parts:
   1) DIAGNOSTIC — 5 dropdown questions that score the member's
      AI stage (these drive the algorithm / score).
   2) UNDERSTAND YOU — open questions (problem, fears, goals…)
      so the coach knows each client. Not scored.

   Each text field is { en, ar }. `id` = Google Sheet column key.
   Diagnostic options carry a `score` (0–100) used by the algorithm.
   ============================================================ */

const QUESTIONS = [
  {
    type: "welcome",
    title: {
      en: "Let's find your AI stage — and make our calls count.",
      ar: "خلّينا نحدد مستواك في الذكاء الاصطناعي — ونخلي مكالماتنا تستاهل.",
    },
    subtitle: {
      en: "5 quick questions to score your AI stage, then a few so I understand you. 2 minutes — just be honest.",
      ar: "٥ أسئلة سريعة نحسب فيها مستواك، وبعدها كم سؤال عشان أفهمك. دقيقتين — بس كن صادق.",
    },
    voiceTip: {
      en: "On the open questions: don't type — talk. Tap the 🎤 on your keyboard and answer out loud. The more you say, the more I understand you.",
      ar: "بالأسئلة المفتوحة: لا تكتب — تكلّم. اضغط 🎤 في لوحة المفاتيح وجاوب بصوتك. كل ما قلت أكثر، فهمتك أكثر.",
    },
    voiceImage: "assets/keyboard-mic.png",
    cta: { en: "Start →", ar: "نبدأ →" },
  },

  // --- Identity ---
  {
    id: "name",
    type: "short_text",
    title: { en: "First, what's your name?", ar: "بالبداية، وش اسمك؟" },
    placeholder: { en: "Type your name…", ar: "اكتب اسمك…" },
    required: true,
  },
  {
    id: "email",
    type: "email",
    title: { en: "And your best email?", ar: "وش أفضل إيميل لك؟" },
    subtitle: { en: "So I can match you to your account.", ar: "عشان أربطك بحسابك." },
    placeholder: { en: "you@email.com", ar: "you@email.com" },
    required: true,
  },
  {
    id: "role",
    type: "short_text",
    title: { en: "What's your role and industry?", ar: "وش دورك ومجال شغلك؟" },
    subtitle: { en: 'e.g. "Operations Manager, logistics"', ar: 'مثال: "مدير عمليات، قطاع اللوجستيات"' },
    placeholder: { en: "Role, industry…", ar: "الدور، المجال…" },
    required: true,
  },

  // ============ DIAGNOSTIC (scored) ============
  {
    id: "dx_usage",
    type: "select",
    section: "diagnostic",
    title: { en: "How often do you use AI tools (ChatGPT, Claude…) today?", ar: "كم تستخدم أدوات الذكاء الاصطناعي (ChatGPT، Claude…) اليوم؟" },
    required: true,
    options: [
      { label: { en: "I don't use AI yet", ar: "ما أستخدمها بعد" }, value: "None", score: 0 },
      { label: { en: "Rarely — simple questions", ar: "نادرًا — أسئلة بسيطة" }, value: "Rarely", score: 25 },
      { label: { en: "Most days, for real work", ar: "أغلب الأيام، لشغل حقيقي" }, value: "Most days", score: 60 },
      { label: { en: "Daily — part of my workflow", ar: "يوميًا — جزء من شغلي" }, value: "Daily", score: 85 },
      { label: { en: "Constantly — I build with it", ar: "باستمرار — أبني فيها" }, value: "Constantly", score: 100 },
    ],
  },
  {
    id: "dx_depth",
    type: "select",
    section: "diagnostic",
    title: { en: "What's the most advanced thing you've done with AI?", ar: "وش أكثر شي متقدّم سويته بالذكاء الاصطناعي؟" },
    required: true,
    options: [
      { label: { en: "Nothing yet", ar: "ولا شي بعد" }, value: "Nothing", score: 0 },
      { label: { en: "Emails, text, summaries", ar: "إيميلات، نصوص، تلخيص" }, value: "Basic text", score: 30 },
      { label: { en: "Detailed prompts that save time", ar: "برومبتات مفصّلة توفّر وقت" }, value: "Prompts", score: 55 },
      { label: { en: "A multi-step workflow", ar: "سير عمل متعدد الخطوات" }, value: "Workflow", score: 80 },
      { label: { en: "An automation or an app", ar: "أتمتة أو تطبيق" }, value: "Built app", score: 100 },
    ],
  },
  {
    id: "dx_automation",
    type: "select",
    section: "diagnostic",
    title: { en: "Have you automated repetitive tasks before?", ar: "سبق أتمتت مهام متكررة من قبل؟" },
    required: true,
    options: [
      { label: { en: "No, everything is manual", ar: "لا، كل شي يدوي" }, value: "None", score: 0 },
      { label: { en: "Tried but couldn't make it work", ar: "جربت وما زبط" }, value: "Tried", score: 25 },
      { label: { en: "I use ready-made templates", ar: "أستخدم قوالب جاهزة" }, value: "Templates", score: 55 },
      { label: { en: "I build my own simple automations", ar: "أبني أتمتة بسيطة بنفسي" }, value: "DIY", score: 80 },
      { label: { en: "I build advanced systems", ar: "أبني أنظمة متقدمة" }, value: "Advanced", score: 100 },
    ],
  },
  {
    id: "dx_comfort",
    type: "select",
    section: "diagnostic",
    title: { en: "How comfortable are you with new tools / building?", ar: "قد إيش مرتاح مع الأدوات الجديدة / البناء؟" },
    required: true,
    options: [
      { label: { en: "Not at all — tech intimidates me", ar: "أبدًا — التقنية تخوّفني" }, value: "Low", score: 15 },
      { label: { en: "I can follow tutorials step by step", ar: "أتابع شروحات خطوة بخطوة" }, value: "Tutorials", score: 40 },
      { label: { en: "I try new tools on my own", ar: "أجرّب أدوات جديدة بنفسي" }, value: "Self", score: 65 },
      { label: { en: "I connect tools/APIs with some help", ar: "أربط أدوات/APIs بمساعدة بسيطة" }, value: "Integrations", score: 85 },
      { label: { en: "Very comfortable — I build confidently", ar: "مرتاح جدًا — أبني بثقة" }, value: "Confident", score: 100 },
    ],
  },
  {
    id: "dx_opportunity",
    type: "select",
    section: "diagnostic",
    title: { en: "How much of your week is repetitive, automatable work?", ar: "قد إيش من أسبوعك شغل متكرر يصلح للأتمتة؟" },
    required: true,
    options: [
      { label: { en: "Very little", ar: "قليل جدًا" }, value: "Little", score: 30 },
      { label: { en: "A few hours", ar: "كم ساعة" }, value: "Few hours", score: 55 },
      { label: { en: "A big chunk — many hours", ar: "جزء كبير — ساعات كثيرة" }, value: "Many hours", score: 80 },
      { label: { en: "Most of my week", ar: "أغلب أسبوعي" }, value: "Most", score: 100 },
    ],
  },

  // ============ UNDERSTAND YOU (not scored) ============
  {
    id: "problem",
    type: "long_text",
    title: { en: "What's the #1 problem you want AI to solve for you right now?", ar: "وش أكبر مشكلة تبي الذكاء الاصطناعي يحلها لك الحين؟" },
    placeholder: { en: "Be specific — the thing that actually bugs you…", ar: "كن دقيق — الشي اللي فعلاً يزعجك…" },
    required: true,
  },
  {
    id: "obstacle",
    type: "long_text",
    title: { en: "What's the main obstacle in your way — and what have you already tried?", ar: "وش أكبر عائق في طريقك — ووش جربت قبل؟" },
    placeholder: { en: "What's blocking you, and what hasn't worked…", ar: "وش اللي يعطّلك، ووش اللي ما نفع…" },
    required: true,
  },
  {
    id: "goal",
    type: "long_text",
    title: { en: "What does success in the next 90 days look like?", ar: "وش شكل النجاح بالنسبة لك في الـ ٩٠ يوم الجاية؟" },
    placeholder: { en: "If this works, what changes for you?", ar: "لو نجح هذا، وش بيتغيّر لك؟" },
    required: true,
  },
  {
    id: "belief",
    type: "long_text",
    title: { en: "What's your biggest belief or fear about AI that's holding you back?", ar: "وش أكبر قناعة أو خوف عندك من الذكاء الاصطناعي يوقفك؟" },
    subtitle: { en: "Totally honest — no judgement.", ar: "بصراحة تامة — ما فيه أحكام." },
    placeholder: { en: 'e.g. "I\'m worried it\'s too technical for me"…', ar: 'مثال: "أخاف يكون تقني زيادة عليّ"…' },
    required: false,
  },
  {
    id: "wants",
    type: "long_text",
    title: { en: "What do you most want to get out of the weekly calls?", ar: "وش أكثر شي تبي تطلع فيه من المكالمات الأسبوعية؟" },
    placeholder: { en: "Optional — what would make these worth your time?", ar: "اختياري — وش اللي يخلي المكالمات تستاهل وقتك؟" },
    required: false,
  },

  {
    type: "thankyou",
    title: { en: "Your AI Stage", ar: "مستواك في الذكاء الاصطناعي" },
    community: "مجلس الاتمته +",
  },
];
