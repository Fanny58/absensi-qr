// Ganti URL ini dengan URL Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBcZyg8G1QOsV0KhXJbssgRYBJSMhKLGMuhh89aA-7/exec";

const scanner = new Html5Qrcode("reader");

function startScanner() {
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const backCamera = devices.find(device => device.label.toLowerCase().includes("back")) || devices[0];

      scanner.start(
        { deviceId: { exact: backCamera.id } },
        {
          fps: 10,
          qrbox: 250
        },
        qrCodeMessage => {
          scanner.stop(); // Hentikan pemindaian saat berhasil scan
          handleScan(qrCodeMessage);
        },
        errorMessage => {
          // console.warn(`QR error: ${errorMessage}`);
        }
      ).catch(err => {
        console.error("Camera start error:", err);
        showNotification("❌ Gagal mengakses kamera.");
      });
    }
  }).catch(err => {
    console.error("Camera not found:", err);
    showNotification("❌ Tidak ada kamera terdeteksi.");
  });
}

function handleScan(qrData) {
  showNotification("📡 Mengirim data absensi...");

  fetch(`${SCRIPT_URL}?qr_id=${encodeURIComponent(qrData)}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showNotification(`✅ ${data.nama} berhasil absen pada ${data.waktu}`);
      } else {
        showNotification(`⚠️ ${data.message}`);
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      showNotification("❌ Gagal mengirim data ke server.");
    })
    .finally(() => {
      setTimeout(() => {
        startScanner(); // Restart scanner
      }, 3000);
    });
}

function showNotification(message) {
  const notif = document.getElementById("notification");
  notif.innerText = message;
  notif.style.display = "block";
}
