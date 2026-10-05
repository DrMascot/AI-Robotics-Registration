/*
 AI & Robotics Candidate Registration
 Google Apps Script backend

 1. Create a Google Sheet.
 2. Rename the first sheet to Candidates.
 3. Extensions > Apps Script.
 4. Replace the default code with this file.
 5. Save.
 6. Deploy > New deployment > Web app.
 7. Execute as: Me.
 8. Who has access: Anyone.
 9. Copy the Web App URL into script.js.
*/

const SHEET_NAME = "Candidates";
const DRIVE_FOLDER_NAME = "AI Robotics Candidate CVs";

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const headers = [
    "Timestamp",
    "Full Name",
    "Email",
    "Phone",
    "Location",
    "Education",
    "Experience",
    "AI/Robotics Interests",
    "Skills",
    "Projects / Portfolio",
    "Motivation",
    "CV File",
    "Consent"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

function doGet() {
  return ContentService
    .createTextOutput("AI & Robotics registration backend is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      setup();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    let cvLink = "";
    if (data.cv && data.cv.data && data.cv.name) {
      cvLink = saveCvToDrive_(data.cv);
    }

    sheet.appendRow([
      new Date(),
      clean_(data.fullName),
      clean_(data.email),
      clean_(data.phone),
      clean_(data.location),
      clean_(data.education),
      clean_(data.experience),
      clean_(data.interests),
      clean_(data.skills),
      clean_(data.projects),
      clean_(data.motivation),
      cvLink,
      data.consent ? "Yes" : "No"
    ]);

    return json_({success: true});
  } catch (err) {
    console.error(err);
    return json_({success: false, error: String(err)});
  }
}

function saveCvToDrive_(cv) {
  const folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
  const bytes = Utilities.base64Decode(cv.data);
  const blob = Utilities.newBlob(bytes, cv.mimeType || MimeType.PDF, cv.name);
  const file = folder.createFile(blob);
  return file.getUrl();
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function clean_(value) {
  return value == null ? "" : String(value).trim();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}