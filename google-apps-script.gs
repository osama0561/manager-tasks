/**
 * Google Apps Script — receives assessment answers and appends a row
 * to your "Member Assessment Database — AI Coaching" sheet.
 *
 * SETUP (one time, ~3 minutes):
 *  1. Open your Sheet:
 *     https://docs.google.com/spreadsheets/d/18MfNoDbJsFxcZk_Obmf2s6KW4ocKcaHC2IOzi4rijXM
 *  2. Extensions → Apps Script. Delete any code, paste THIS file.
 *  3. Click Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  4. Copy the Web app URL it gives you.
 *  5. Paste that URL into CONFIG.ENDPOINT at the top of app.js. Done.
 */

var SHEET_ID = "18MfNoDbJsFxcZk_Obmf2s6KW4ocKcaHC2IOzi4rijXM";

// Order must match your sheet's header row.
var COLUMNS = [
  "submitted_at", // Timestamp
  "name",
  "email",
  "community",
  "role",
  "industry",       // (folded into "role" answer; left blank unless you split it)
  "problem",
  "obstacle",
  "tried",          // (folded into "obstacle")
  "goal",
  "success",        // (folded into "goal")
  "belief",
  "ai_level",
  "hours_lost",
  "tools",
  "wants",
  "notes",          // "Anything else"
  "pre_call_brief", // filled later by your AI brief
];

// Both GET and POST go through here, so the app can submit either way and you
// can also test by simply visiting a URL with ?name=...&email=... in a browser.
function handle(e) {
  try {
    var data = (e && e.parameter) ? e.parameter : {};
    // Fallback: JSON body, for backwards compatibility.
    if (!hasData(data) && e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) {}
    }
    // No real data → health check.
    if (!hasData(data)) return json({ status: "alive" });

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var row = COLUMNS.map(function (key) {
      return data[key] !== undefined ? data[key] : "";
    });
    sheet.appendRow(row);
    return json({ status: "ok", saved: row });
  } catch (err) {
    return json({ status: "error", message: String(err) });
  }
}

function hasData(d) {
  return d && (d.name || d.email || d.problem || d.community);
}

function doGet(e) { return handle(e); }
function doPost(e) { return handle(e); }

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
