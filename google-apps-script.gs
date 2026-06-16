/**
 * Google Apps Script — receives assessment answers and appends a row
 * to your "Member Assessment Database — AI Coaching" sheet.
 * It also keeps the header row correct automatically.
 *
 * UPDATE STEPS (whenever this file changes):
 *  1. Sheet → Extensions → Apps Script → replace all code with this → Save.
 *  2. Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
 *     (Keeps the SAME /exec URL — never use "New deployment".)
 */

var SHEET_ID = "18MfNoDbJsFxcZk_Obmf2s6KW4ocKcaHC2IOzi4rijXM";

// Each brand writes to its own tab (created automatically if missing).
var TABS = {
  coaching: "اتمتها (Coaching)",
  community: "مجلس الاتمته + (Community)",
};

// Payload keys, in column order.
var COLUMNS = [
  "submitted_at", "name", "email", "brand", "role",
  "dx_usage", "dx_depth", "dx_automation", "dx_comfort", "dx_opportunity",
  "ai_score", "ai_stage",
  "problem", "obstacle", "goal", "belief", "wants",
  "lang", "pre_call_brief",
];

// Friendly header labels (row 1), same order as COLUMNS.
var HEADERS = [
  "Timestamp", "Name", "Email", "Brand", "Role / Industry",
  "AI Usage", "AI Depth", "Automation Exp", "Tech Comfort", "Opportunity",
  "AI Score", "AI Stage",
  "Biggest Problem", "Main Obstacle", "90-Day Goal", "Belief / Fear", "Wants from Calls",
  "Language", "Pre-Call Brief",
];

function handle(e) {
  try {
    var data = (e && e.parameter && Object.keys(e.parameter).length > 0) ? e.parameter : {};
    if (!hasData(data) && e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) {}
    }
    if (!hasData(data)) return json({ status: "alive" });

    var sheet = sheetFor(data.brand_key);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); // keep headers correct
    var row = COLUMNS.map(function (key) {
      return data[key] !== undefined ? data[key] : "";
    });
    sheet.appendRow(row);
    return json({ status: "ok", saved: row });
  } catch (err) {
    return json({ status: "error", message: String(err) });
  }
}

// Return the tab for a brand, creating it (with a header row) if needed.
function sheetFor(brandKey) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var name = TABS[brandKey] || TABS.community;
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
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
