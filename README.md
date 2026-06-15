# AI Coaching — Member Assessment App

A Typeform-style, one-question-at-a-time assessment that new members fill out
when they join. Answers land in your Google Sheet so you walk into every weekly
call already knowing who you're talking to.

**Stack:** plain HTML/CSS/JS. No build step, no framework, no dependencies.
Host it anywhere static (GitHub Pages, Netlify, Vercel) or embed it in Skool.

---

## Files

| File | What it does |
|------|--------------|
| `index.html` | Page shell + progress bar + nav |
| `styles.css` | The Typeform-style look (dark, animated, mobile-ready) |
| `questions.js` | **Your questions.** Edit text / add / remove / reorder here |
| `app.js` | The form engine (rendering, keyboard nav, validation, submit) |
| `google-apps-script.gs` | Backend that appends answers to your Google Sheet |

---

## Run it locally

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

With no endpoint set, the app runs in **demo mode**: answers are logged to the
console and downloaded as a JSON file so you can test the full flow.

---

## Connect it to your Google Sheet (≈3 min)

1. Open your Sheet → **Extensions → Apps Script**.
2. Paste the contents of `google-apps-script.gs`, then **Deploy → New deployment
   → Web app** (Execute as *Me*, Access *Anyone*).
3. Copy the Web app URL.
4. Paste it into `CONFIG.ENDPOINT` at the top of `app.js`.

That's it — submissions now append a row to:
`Member Assessment Database — AI Coaching`.

---

## Going live

- **GitHub Pages:** push this repo → Settings → Pages → deploy from branch.
- **Netlify/Vercel:** drag-and-drop this folder, or connect the repo.
- **Skool:** host it (above) and embed the link, or drop it in your welcome step.

Then **DM the link to every new member** when they join (your manual step).

---

## Edit the questions

Open `questions.js`. Each entry is one screen. Types supported:
`welcome`, `short_text`, `email`, `long_text`, `choice`, `rating`, `thankyou`.
`required: true` makes an answer mandatory. The `id` is the Sheet column key.

---

## The loop, end to end

1. Member joins → you DM them the link.
2. They answer → row appears in your Sheet.
3. ~1 hr before the call → run the **Pre-Call AI Brief** prompt over the new
   rows, drop the result in the `pre_call_brief` column.
4. Walk in fully loaded. 🎯
