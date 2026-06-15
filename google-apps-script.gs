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

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var row = COLUMNS.map(function (key) {
      return data[key] !== undefined ? data[key] : "";
    });
    sheet.appendRow(row);
    return json({ status: "ok" });
  } catch (err) {
    return json({ status: "error", message: String(err) });
  }
}

function doGet() {
  return json({ status: "alive" });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
