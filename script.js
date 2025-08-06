const scriptURL = "https://script.google.com/macros/s/AKfycbz3eZP3OZlzcz0y5pSC-ycsOcF54Y2tYOj7X99nvVWC6AwYKHsqYMvU5pv8fBTqRshmVA/exec";


function showStatus(message, success = true) {
  const statusEl = document.getElementById("status");
  statusEl.innerText = message;
  statusEl.style.color = success ? "green" : "red";
}

function sendToSheet(qrData) {
  fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams({ qr_id: qrData }),
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        showStatus("Absensi berhasil!");
      } else {
        showStatus(res.message, false);
      }
    })
    .catch(() => showStatus("Gagal mengirim data!", false));
}

function onScanSuccess(decodedText) {
  html5QrcodeScanner.clear().then(() => {
    sendToSheet(decodedText.trim());
  });
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
}, false);

html5QrcodeScanner.render(onScanSuccess);
