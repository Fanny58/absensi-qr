const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3eZP3OZlzcz0y5pSC-ycsOcF54Y2tYOj7X99nvVWC6AwYKHsqYMvU5pv8fBTqRshmVA/exec";

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
          scanner.stop(); // Stop kamera
          handleScan(qrCodeMessage);
        },
        errorMessage => {
          // error scanning (bisa dikosongkan)
        }
      ).catch(err => {
        console.error("Error membuka kamera:", err);
        showNotification("❌ Tidak bisa membuka kamera.");
      });
    }
  }).catch(err => {
    console.error("Kamera tidak ditemukan:", err);
    showNotification("❌ Kamera tidak tersedia.");
  });
}

function handleScan(qrData) {
  showNotification("📡 Mengirim absensi...");

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
      console.error("Error mengirim data:", error);
      showNotification("❌ Gagal mengirim data ke Google Sheet.");
    })
    .finally(() => {
      setTimeout(() => {
        startScanner(); // Mulai ulang scanner setelah 3 detik
      }, 3000);
    });
}

function showNotification(message) {
  const notif = document.getElementById("notification");
  notif.innerText = message;
  notif.style.display = "block";
}
