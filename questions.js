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

const QUESTION_SETS = {};

QUESTION_SETS.default = [
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
  },
];

/* ============================================================
   10x — Work Profile builder (اتمتها). Detailed open questions
   that produce a profile any AI can use. Scored by completeness.
   ============================================================ */
QUESTION_SETS.tenx = [
  {
    type: "welcome",
    title: { en: "Work Profile — Who I Am & What I Do", ar: "ملف عملي — مَن أنا وماذا أفعل" },
    subtitle: {
      en: "Fill this out in detail with concrete examples. By the end you'll have a complete profile that lets any AI understand your work precisely. 🔒 Work only — no client names or private data; talk about roles and tasks, not specific people.",
      ar: "املأه بالتفصيل وبأمثلة ملموسة. في النهاية بيصير عندك ملف كامل يخلي أي ذكاء اصطناعي يفهم عملك ومهامك بدقة. 🔒 أسئلة عن عملك فقط — لا تكتب أسماء عملاء أو بيانات سرية، تكلم عن الأدوار والمهام مو عن أشخاص.",
    },
    voiceTip: {
      en: "Use the 🎤 mic button on your keyboard to answer — just talk, don't worry about typos. The more detail, the smarter the result.",
      ar: "استعمل زر المايك 🎤 في لوحة المفاتيح للإجابة — تكلّم ولا تخاف من الأخطاء الكتابية. كل ما زاد التفصيل، طلعت النتيجة أذكى.",
    },
    voiceImage: "assets/keyboard-mic.png",
    cta: { en: "Start →", ar: "نبدأ →" },
  },

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
    placeholder: { en: "you@email.com", ar: "you@email.com" },
    required: true,
  },

  // Section 1 — Who you are at work
  {
    id: "tx1", type: "long_text",
    group: { en: "1 · Who you are at work", ar: "١ · من أنت في العمل" },
    title: { en: "What's your job title? Are you an employee or a business owner?", ar: "ما هو مسمّاك الوظيفي؟ وهل أنت موظف أو صاحب عمل؟" },
    placeholder: { en: "e.g. Operations manager at a contracting firm / online store owner", ar: "مثال: مدير تشغيل في شركة مقاولات / صاحب متجر إلكتروني" },
    required: true,
  },
  {
    id: "tx2", type: "long_text",
    group: { en: "1 · Who you are at work", ar: "١ · من أنت في العمل" },
    title: { en: "Exactly what sector or field do you work in?", ar: "في أي قطاع أو مجال تعمل بالضبط؟" },
    placeholder: { en: "Be specific: not 'retail' but 'retail for coffee supplies'", ar: "كن دقيق: مو «تجارة» بل «تجارة تجزئة لمستلزمات القهوة»" },
    required: true,
  },
  {
    id: "tx3", type: "long_text",
    group: { en: "1 · Who you are at work", ar: "١ · من أنت في العمل" },
    title: { en: "Describe your company or department in two sentences: what do you offer and to whom?", ar: "صف شركتك أو قسمك في جملتين: ماذا تقدّمون ولمن؟" },
    placeholder: { en: "The product/service, and the target customer", ar: "ايش المنتج/الخدمة، ومين العميل المستهدف" },
    required: true,
  },
  {
    id: "tx4", type: "long_text",
    group: { en: "1 · Who you are at work", ar: "١ · من أنت في العمل" },
    title: { en: "How big is your team? Who's above you and who's below you?", ar: "ما حجم فريقك؟ مَن فوقك ومَن تحتك في العمل؟" },
    placeholder: { en: "Roles, not names: 'I report to a GM, and 3 sales staff report to me'", ar: "اذكر الأدوار لا الأسماء: «أرفع تقاريري لمدير عام، وتحتي ٣ موظفين مبيعات»" },
    required: true,
  },

  // Section 2 — Responsibilities & outputs
  {
    id: "tx5", type: "long_text",
    group: { en: "2 · Responsibilities & outputs", ar: "٢ · مسؤولياتك ومخرجاتك" },
    title: { en: "What are the top 3–5 responsibilities you own?", ar: "ما هي أهم ٣ إلى ٥ مسؤوليات أنت مسؤول عنها؟" },
    placeholder: { en: "The things that, if undone, someone would notice", ar: "الأشياء اللي لو ما سويتها، أحد بيلاحظ غيابها" },
    required: true,
  },
  {
    id: "tx6", type: "long_text",
    group: { en: "2 · Responsibilities & outputs", ar: "٢ · مسؤولياتك ومخرجاتك" },
    title: { en: "What outputs are you repeatedly asked to deliver?", ar: "ما هي المخرجات التي يُطلب منك تسليمها بشكل متكرر؟" },
    placeholder: { en: "e.g. weekly sales reports, quotes, customer replies, invoices, schedules", ar: "مثال: تقارير مبيعات أسبوعية، عروض أسعار، ردود على العملاء، فواتير، جداول مواعيد" },
    required: true,
  },
  {
    id: "tx7", type: "long_text",
    group: { en: "2 · Responsibilities & outputs", ar: "٢ · مسؤولياتك ومخرجاتك" },
    title: { en: "How is your success measured at work?", ar: "على أي أساس يُقاس نجاحك في عملك؟" },
    placeholder: { en: "The numbers/targets you're judged on: sales, satisfaction, turnaround…", ar: "الأرقام أو الأهداف اللي تُحاسب عليها: مبيعات، رضا عملاء، سرعة إنجاز..." },
    required: true,
  },

  // Section 3 — A normal day
  {
    id: "tx8", type: "long_text",
    group: { en: "3 · A normal workday", ar: "٣ · يومك العادي في العمل" },
    title: { en: "Walk through a normal workday step by step — from opening your device to end of day.", ar: "اشرح يوم عمل عادي خطوة بخطوة، من أول ما تفتح جهازك إلى نهاية الدوام." },
    placeholder: { en: "'First I open email, then…' — as much detail as you can", ar: "«أول شي أفتح الإيميل، بعدها...» بقدر ما تقدر من التفصيل" },
    required: true,
  },
  {
    id: "tx9", type: "long_text",
    group: { en: "3 · A normal workday", ar: "٣ · يومك العادي في العمل" },
    title: { en: "What do you do almost every day?", ar: "ما الأشياء التي تفعلها بشكل يومي تقريباً؟" },
    placeholder: { en: "The fixed, repeated tasks in your day", ar: "المهام المتكررة الثابتة في يومك" },
    required: true,
  },
  {
    id: "tx10", type: "long_text",
    group: { en: "3 · A normal workday", ar: "٣ · يومك العادي في العمل" },
    title: { en: "What weekly or monthly tasks take up your time?", ar: "ما الأشياء التي تفعلها أسبوعياً أو شهرياً وتأخذ منك وقتاً؟" },
    placeholder: { en: "e.g. end-of-week report, monthly meeting prep, accounts review", ar: "مثال: تقرير نهاية الأسبوع، تجهيز اجتماع شهري، مراجعة حسابات" },
    required: true,
  },
  {
    id: "tx11", type: "long_text",
    group: { en: "3 · A normal workday", ar: "٣ · يومك العادي في العمل" },
    title: { en: "Where does most of your time actually go?", ar: "أين يذهب معظم وقتك فعلياً؟" },
    placeholder: { en: "Be honest: not what you wish, but what really eats your time", ar: "كن صادق: مو اللي تتمنى تشتغل عليه، بل اللي يأكل وقتك فعلاً" },
    required: true,
  },

  // Section 4 — Tools & data
  {
    id: "tx12", type: "long_text",
    group: { en: "4 · Tools & data", ar: "٤ · الأدوات والبيانات" },
    title: { en: "What tools and apps do you work in daily?", ar: "ما الأدوات والبرامج التي تعمل عليها يومياً؟" },
    placeholder: { en: "e.g. WhatsApp, Excel, email, a specific accounting system, a social platform", ar: "مثال: واتساب، إكسل، إيميل، نظام محاسبة معيّن، منصة تواصل اجتماعي" },
    required: true,
  },
  {
    id: "tx13", type: "long_text",
    group: { en: "4 · Tools & data", ar: "٤ · الأدوات والبيانات" },
    title: { en: "Where do your inputs come from, and where do your outputs go?", ar: "من أين تأتيك المعلومات والمدخلات التي تعمل عليها، وإلى من تذهب مخرجاتك؟" },
    placeholder: { en: "Describe the chain: 'orders come from the store → I process → send to the courier'", ar: "صف سلسلة العمل: «تجيني الطلبات من المتجر → أجهزها → أرسلها للمندوب»" },
    required: true,
  },

  // Section 5 — Friction & time-wasters
  {
    id: "tx14", type: "long_text",
    group: { en: "5 · Friction & time-wasters", ar: "٥ · الاحتكاكات ومضيّعات الوقت" },
    title: { en: "What's the most repetitive, boring task you wish someone would do for you?", ar: "ما أكثر شيء متكرر وممل في عملك تتمنى لو أحد يفعله بدلاً عنك؟" },
    placeholder: { en: "The task that makes you sigh when it's time for it", ar: "المهمة اللي تتنهد لما تجي وقتها" },
    required: true,
  },
  {
    id: "tx15", type: "long_text",
    group: { en: "5 · Friction & time-wasters", ar: "٥ · الاحتكاكات ومضيّعات الوقت" },
    title: { en: "What, if solved, would clearly save you time or money?", ar: "ما الشيء الذي لو تم حلّه سيوفر لك وقتاً أو مالاً بشكل واضح؟" },
    placeholder: { en: "Think impact: hours per week? cost? recurring errors?", ar: "فكر بالأثر: ساعات أسبوعياً؟ تكلفة؟ أخطاء تتكرر؟" },
    required: true,
  },

  {
    type: "thankyou",
    title: { en: "Your Work-Profile Strength", ar: "قوة ملفك العملي" },
  },
];
