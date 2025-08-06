let scanner = new Instascan.Scanner({ video: document.getElementById('preview'), mirror: false });

scanner.addListener('scan', function (content) {
  const status = document.getElementById('status');
  status.innerText = 'QR ditemukan, mengirim...';

  fetch('https://script.google.com/macros/s/AKfycbz3eZP3OZlzcz0y5pSC-ycsOcF54Y2tYOj7X99nvVWC6AwYKHsqYMvU5pv8fBTqRshmVA/exec?qr_id=' + content, {
    method: 'POST',
  })
    .then(res => res.text())
    .then(text => {
      status.innerText = text;
    })
    .catch(err => {
      status.innerText = 'Gagal kirim data: ' + err;
    });
});

Instascan.Camera.getCameras().then(function (cameras) {
  let backCamera = cameras.find(cam => cam.name.toLowerCase().includes('back') || cam.name.toLowerCase().includes('environment'));
  if (backCamera) {
    scanner.start(backCamera);
  } else if (cameras.length > 0) {
    scanner.start(cameras[0]); // fallback ke kamera pertama
  } else {
    document.getElementById('status').innerText = 'Tidak ada kamera ditemukan.';
  }
}).catch(function (e) {
  console.error(e);
  document.getElementById('status').innerText = 'Kesalahan kamera: ' + e;
});
