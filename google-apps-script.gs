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
  "10x": "10x (Work Profile)",
};

// Diagnostic versions (community / coaching) — column keys + header labels.
var COLUMNS = [
  "submitted_at", "name", "email", "brand", "role",
  "dx_usage", "dx_depth", "dx_automation", "dx_comfort", "dx_opportunity",
  "ai_score", "ai_stage",
  "problem", "obstacle", "goal", "belief", "wants",
  "lang", "pre_call_brief",
];
var HEADERS = [
  "Timestamp", "Name", "Email", "Brand", "Role / Industry",
  "AI Usage", "AI Depth", "Automation Exp", "Tech Comfort", "Opportunity",
  "AI Score", "AI Stage",
  "Biggest Problem", "Main Obstacle", "90-Day Goal", "Belief / Fear", "Wants from Calls",
  "Language", "Pre-Call Brief",
];

// 10x work-profile version — its own columns.
var COLUMNS_10X = [
  "submitted_at", "name", "brand",
  "tx1", "tx2", "tx3", "tx4", "tx5", "tx6", "tx7", "tx8",
  "tx9", "tx10", "tx11", "tx12", "tx13", "tx14", "tx15",
  "ai_score", "ai_stage", "lang", "pre_call_brief",
];
var HEADERS_10X = [
  "Timestamp", "Name", "Brand",
  "Job", "Sector", "Company (what & who)", "Team & Hierarchy",
  "Top Responsibilities", "Recurring Outputs", "Success Measured By",
  "Normal Day", "Daily Tasks", "Weekly/Monthly Tasks", "Where Time Goes",
  "Tools Used", "Input → Output Chain", "Most Boring Task", "Biggest Time/Money Saver",
  "Profile Score", "Profile Level", "Language", "Pre-Call Brief",
];

function colsFor(key) { return key === "10x" ? COLUMNS_10X : COLUMNS; }
function headsFor(key) { return key === "10x" ? HEADERS_10X : HEADERS; }

function handle(e) {
  try {
    var data = (e && e.parameter && Object.keys(e.parameter).length > 0) ? e.parameter : {};
    if (!hasData(data) && e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) {}
    }
    if (!hasData(data)) return json({ status: "alive" });

    var key = data.brand_key;
    var cols = colsFor(key);
    var heads = headsFor(key);
    var sheet = sheetFor(key, heads);
    sheet.getRange(1, 1, 1, heads.length).setValues([heads]); // keep headers correct
    var row = cols.map(function (k) {
      return data[k] !== undefined ? data[k] : "";
    });
    sheet.appendRow(row);
    return json({ status: "ok", saved: row });
  } catch (err) {
    return json({ status: "error", message: String(err) });
  }
}

// Return the tab for a brand, creating it (with a header row) if needed.
function sheetFor(brandKey, heads) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var name = TABS[brandKey] || TABS.community;
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, heads.length).setValues([heads]);
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
