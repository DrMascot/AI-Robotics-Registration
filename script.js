/*
  IMPORTANT:
  Paste your deployed Google Apps Script Web App URL into GOOGLE_SCRIPT_URL below.
*/
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbylaxyUBb7VAfcX_eJw91oc4lEGet2M9fwMtIO7wNqjw7zJZhbNPzYeaNMqN1crEOA9/exec";

const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");
const success = document.getElementById("success");
const cvInput = document.getElementById("cv");
const fileStatus = document.getElementById("fileStatus");

cvInput.addEventListener("change", () => {
  const file = cvInput.files[0];
  if (!file) {
    fileStatus.textContent = "Optional";
    return;
  }
  const allowed = ["application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
    cvInput.value = "";
    fileStatus.textContent = "Please select a PDF, DOC or DOCX file.";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    cvInput.value = "";
    fileStatus.textContent = "File is larger than 5MB.";
    return;
  }
  fileStatus.textContent = `${file.name} selected`;
});

function getCheckedInterests() {
  return [...document.querySelectorAll('input[name="interests"]:checked')]
    .map(el => el.value);
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        data: result.split(",")[1] || ""
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
    statusBox.textContent = "Please connect the Google Apps Script URL first.";
    return;
  }

  if (getCheckedInterests().length === 0) {
    statusBox.textContent = "Please select at least one area of interest.";
    return;
  }

  const file = cvInput.files[0];
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  statusBox.textContent = "Sending your registration...";

  try {
    const data = Object.fromEntries(new FormData(form).entries());
    data.interests = getCheckedInterests().join(", ");
    data.cv = await readFileAsBase64(file);
    data.submittedAt = new Date().toISOString();

    /*
      no-cors is intentional for a Google Apps Script web app.
      The browser cannot read the response, but Apps Script receives the POST.
    */
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(data)
    });

    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({behavior: "smooth", block: "center"});
  } catch (error) {
    console.error(error);
    statusBox.textContent = "Submission failed. Please check your internet connection and try again.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
  }
});