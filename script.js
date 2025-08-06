// ========================
// LOGIN LOGIC
// ========================
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const msg = document.getElementById("login-msg");

  if (
    (user === "admin1" && pass === "1234") ||
    (user === "admin2" && pass === "abcd")
  ) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "scan.html";
  } else {
    msg.innerText = "Username atau password salah.";
  }
}

// ========================
// QR SCAN + POST KE SHEET
// ========================
if (window.location.pathname.includes("scan.html")) {
  // Cek login
  if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "index.html";
  }

  const status = document.getElementById("status");

  let scanner = new Instascan.Scanner({ video: document.getElementById("preview") });
  scanner.addListener("scan", function (content) {
    status.innerText = "QR ditemukan, mengirim...";

    fetch(
      "https://script.google.com/macros/s/AKfycbz3eZP3OZlzcz0y5pSC-ycsOcF54Y2tYOj7X99nvVWC6AwYKHsqYMvU5pv8fBTqRshmVA/exec?qr_id=" + encodeURIComponent(content),
      {
        method: "POST",
      }
    )
      .then((res) => res.text())
      .then((text) => {
        status.innerText = text.includes("berhasil") ? `✅ ${text}` : `⚠️ ${text}`;
      })
      .catch((err) => {
        status.innerText = "❌ Gagal kirim data: " + err;
      });
  });

  Instascan.Camera.getCameras()
    .then(function (cameras) {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      } else {
        status.innerText = "❌ Tidak ada kamera ditemukan.";
      }
    })
    .catch(function (e) {
      console.error(e);
      status.innerText = "❌ Kesalahan kamera: " + e;
    });
}
