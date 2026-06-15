/* ============================================================
   AI Coaching — Member Assessment questions (bilingual EN/AR)
   Each text field is an object { en, ar }. The app shows the
   active language and flips to RTL for Arabic automatically.
   Each question's `id` is the column key in your Google Sheet.
   ============================================================ */

const QUESTIONS = [
  {
    type: "welcome",
    title: {
      en: "Let's make our calls actually move your needle.",
      ar: "خلّي مكالماتنا تنقلك نقلة حقيقية.",
    },
    subtitle: {
      en: "2 minutes, 12 questions. The more honest you are, the more useful I can be on every call.",
      ar: "دقيقتين، ١٢ سؤال. كل ما كنت صادق أكثر، كل ما قدرت أفيدك أكثر في كل مكالمة.",
    },
    voiceTip: {
      en: "Don't type — talk. Tap the 🎤 microphone on your keyboard and just answer out loud. The more you say, the more I understand you.",
      ar: "لا تكتب — تكلّم. اضغط 🎤 في لوحة المفاتيح وجاوب بصوتك. كل ما قلت أكثر، فهمتك أكثر.",
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
    subtitle: {
      en: "So I can match you to your account.",
      ar: "عشان أربطك بحسابك.",
    },
    placeholder: { en: "you@email.com", ar: "you@email.com" },
    required: true,
  },
  {
    id: "community",
    type: "choice",
    title: { en: "Which program did you join?", ar: "أي برنامج اشتركت فيه؟" },
    required: true,
    options: [
      { label: { en: "The $68 Community", ar: "مجتمع الـ ٦٨$" }, value: "Community ($68)" },
      { label: { en: "1:1 / Coaching Program", ar: "برنامج الكوتشينج / ١:١" }, value: "Coaching" },
      { label: { en: "Both", ar: "الاثنين" }, value: "Both" },
    ],
  },

  // --- Context ---
  {
    id: "role",
    type: "short_text",
    title: { en: "What's your role and industry?", ar: "وش دورك ومجال شغلك؟" },
    subtitle: {
      en: 'e.g. "Operations Manager, logistics"',
      ar: 'مثال: "مدير عمليات، قطاع اللوجستيات"',
    },
    placeholder: { en: "Role, industry…", ar: "الدور، المجال…" },
    required: true,
  },
  {
    id: "problem",
    type: "long_text",
    title: {
      en: "What's the #1 problem you want AI to solve for you right now?",
      ar: "وش أكبر مشكلة تبي الذكاء الاصطناعي يحلها لك الحين؟",
    },
    placeholder: {
      en: "Be specific — the thing that actually bugs you…",
      ar: "كن دقيق — الشي اللي فعلاً يزعجك…",
    },
    required: true,
  },
  {
    id: "obstacle",
    type: "long_text",
    title: {
      en: "What's the main obstacle in your way — and what have you already tried?",
      ar: "وش أكبر عائق في طريقك — ووش جربت قبل؟",
    },
    placeholder: {
      en: "What's blocking you, and what hasn't worked…",
      ar: "وش اللي يعطّلك، ووش اللي ما نفع…",
    },
    required: true,
  },
  {
    id: "goal",
    type: "long_text",
    title: {
      en: "What does success in the next 90 days look like?",
      ar: "وش شكل النجاح بالنسبة لك في الـ ٩٠ يوم الجاية؟",
    },
    placeholder: {
      en: "If this works, what changes for you?",
      ar: "لو نجح هذا، وش بيتغيّر لك؟",
    },
    required: true,
  },
  {
    id: "belief",
    type: "long_text",
    title: {
      en: "What's your biggest belief or fear about AI that's holding you back?",
      ar: "وش أكبر قناعة أو خوف عندك من الذكاء الاصطناعي يوقفك؟",
    },
    subtitle: {
      en: "Totally honest — no judgement.",
      ar: "بصراحة تامة — ما فيه أحكام.",
    },
    placeholder: {
      en: 'e.g. "I\'m worried it\'s too technical for me"…',
      ar: 'مثال: "أخاف يكون تقني زيادة عليّ"…',
    },
    required: false,
  },

  // --- Quick gauges ---
  {
    id: "ai_level",
    type: "rating",
    title: {
      en: "How would you rate your AI experience today?",
      ar: "كيف تقيّم خبرتك بالذكاء الاصطناعي اليوم؟",
    },
    min: 1,
    max: 5,
    minLabel: { en: "Total beginner", ar: "مبتدئ تمامًا" },
    maxLabel: { en: "Very advanced", ar: "متقدّم جدًا" },
    required: true,
  },
  {
    id: "hours_lost",
    type: "choice",
    title: {
      en: "How many hours a week do you lose to boring, repetitive tasks?",
      ar: "كم ساعة بالأسبوع تضيع في مهام مملة ومتكررة؟",
    },
    required: true,
    options: [
      { label: { en: "0–2 hours", ar: "٠–٢ ساعة" }, value: "0-2" },
      { label: { en: "3–5 hours", ar: "٣–٥ ساعات" }, value: "3-5" },
      { label: { en: "6–10 hours", ar: "٦–١٠ ساعات" }, value: "6-10" },
      { label: { en: "10+ hours", ar: "أكثر من ١٠ ساعات" }, value: "10+" },
    ],
  },
  {
    id: "tools",
    type: "short_text",
    title: {
      en: "Which tools do you already use day-to-day?",
      ar: "وش الأدوات اللي تستخدمها يوميًا؟",
    },
    subtitle: { en: "Optional", ar: "اختياري" },
    placeholder: {
      en: "e.g. ChatGPT, Excel, WhatsApp, Notion…",
      ar: "مثال: ChatGPT، Excel، واتساب، Notion…",
    },
    required: false,
  },
  {
    id: "wants",
    type: "long_text",
    title: {
      en: "What do you most want to get out of the weekly calls?",
      ar: "وش أكثر شي تبي تطلع فيه من المكالمات الأسبوعية؟",
    },
    placeholder: {
      en: "Optional — what would make these worth your time?",
      ar: "اختياري — وش اللي يخلي المكالمات تستاهل وقتك؟",
    },
    required: false,
  },

  {
    type: "thankyou",
    title: {
      en: "Your AI Automation Score",
      ar: "نتيجتك في الأتمتة بالذكاء الاصطناعي",
    },
    // The community name shown in the share call-to-action.
    community: "مجلس الاتمته +",
  },
];
