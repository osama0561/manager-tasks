/* ============================================================
   AI Coaching — Member Assessment questions
   Each question maps to a column in your Google Sheet.
   Edit freely: change text, add/remove questions, reorder.
   ============================================================ */

const QUESTIONS = [
  {
    type: "welcome",
    title: "Let's make our calls actually move your needle.",
    subtitle:
      "2 minutes, 12 questions. The more honest you are, the more useful I can be on every call.",
    // 🎤 Voice nudge — encourages longer, richer answers.
    voiceTip:
      "Don't type — talk. Tap the 🎤 microphone on your keyboard and just answer out loud. The more you say, the more I understand you.",
    // Shows your keyboard screenshot from /assets. If the file is missing the
    // image simply hides (the tip text still shows). Set "" to use the 🎤 icon.
    voiceImage: "assets/keyboard-mic.png",
    cta: "Start →",
  },

  // --- Identity ---
  {
    id: "name",
    type: "short_text",
    title: "First, what's your name?",
    placeholder: "Type your name…",
    required: true,
  },
  {
    id: "email",
    type: "email",
    title: "And your best email?",
    subtitle: "So I can match you to your account.",
    placeholder: "you@email.com",
    required: true,
  },
  {
    id: "community",
    type: "choice",
    title: "Which program did you join?",
    required: true,
    options: [
      { label: "The $68 Community", value: "Community ($68)" },
      { label: "1:1 / Coaching Program", value: "Coaching" },
      { label: "Both", value: "Both" },
    ],
  },

  // --- Context ---
  {
    id: "role",
    type: "short_text",
    title: "What's your role and industry?",
    subtitle: "e.g. \"Operations Manager, logistics\"",
    placeholder: "Role, industry…",
    required: true,
  },
  {
    id: "problem",
    type: "long_text",
    title: "What's the #1 problem you want AI to solve for you right now?",
    placeholder: "Be specific — the thing that actually bugs you…",
    required: true,
  },
  {
    id: "obstacle",
    type: "long_text",
    title: "What's the main obstacle in your way — and what have you already tried?",
    placeholder: "What's blocking you, and what hasn't worked…",
    required: true,
  },
  {
    id: "goal",
    type: "long_text",
    title: "What does success in the next 90 days look like?",
    placeholder: "If this works, what changes for you?",
    required: true,
  },
  {
    id: "belief",
    type: "long_text",
    title: "What's your biggest belief or fear about AI that's holding you back?",
    subtitle: "Totally honest — no judgement.",
    placeholder: "e.g. \"I'm worried it's too technical for me\"…",
    required: false,
  },

  // --- Quick gauges ---
  {
    id: "ai_level",
    type: "rating",
    title: "How would you rate your AI experience today?",
    min: 1,
    max: 5,
    minLabel: "Total beginner",
    maxLabel: "Very advanced",
    required: true,
  },
  {
    id: "hours_lost",
    type: "choice",
    title: "How many hours a week do you lose to boring, repetitive tasks?",
    required: true,
    options: [
      { label: "0–2 hours", value: "0-2" },
      { label: "3–5 hours", value: "3-5" },
      { label: "6–10 hours", value: "6-10" },
      { label: "10+ hours", value: "10+" },
    ],
  },
  {
    id: "tools",
    type: "short_text",
    title: "Which tools do you already use day-to-day?",
    subtitle: "Optional",
    placeholder: "e.g. ChatGPT, Excel, WhatsApp, Notion…",
    required: false,
  },
  {
    id: "wants",
    type: "long_text",
    title: "What do you most want to get out of the weekly calls?",
    placeholder: "Optional — what would make these worth your time?",
    required: false,
  },

  {
    type: "thankyou",
    title: "Your AI Automation Score",
    // The community handle/name to nudge sharing — edit to match yours.
    community: "the community",
  },
];
