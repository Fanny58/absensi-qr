// File: script.js (VERSI FINAL - GOOGLE SHEETS)
document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const appContainer = document.getElementById("app-container");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const navDashboard = document.getElementById("nav-dashboard");
  const navTabungan = document.getElementById("nav-tabungan");
  const navKas = document.getElementById("nav-kas");
  const navAbsensi = document.getElementById("nav-absensi");
  const dashboardSection = document.getElementById("dashboard-section");
  const tabunganSection = document.getElementById("tabungan-section");
  const kasSection = document.getElementById("kas-section");
  const absensiSection = document.getElementById("absensi-section");
  const tabunganTbody = document.getElementById("tabungan-tbody");
  const tabunganLoader = document.getElementById("tabungan-loader");
  const tabunganTable = document.getElementById("tabungan-table");
  const modalTabungan = document.getElementById("modal-tabungan");
  const modalTabunganNama = document.getElementById("modal-tabungan-nama");
  const formTabungan = document.getElementById("form-tabungan");
  const kasLoader = document.getElementById("kas-loader");
  const kasPemasukanEl = document.getElementById("kas-pemasukan");
  const kasPengeluaranEl = document.getElementById("kas-pengeluaran");
  const kasSaldoEl = document.getElementById("kas-saldo");
  const kasLogTbody = document.getElementById("kas-log-tbody");
  const kasLogTable = document.getElementById("kas-log-table");
  const btnShowKasModal = document.getElementById("btn-show-kas-modal");
  const modalKas = document.getElementById("modal-kas");
  const formKas = document.getElementById("form-kas");
  const kasNamaAnggotaSelect = document.getElementById("kas-nama-anggota");
  const absensiLoader = document.getElementById("absensi-loader");
  const absensiLogTbody = document.getElementById("absensi-log-tbody");
  const summaryHadir = document.getElementById("summary-hadir");
  const summarySakit = document.getElementById("summary-sakit");
  const summaryIzin = document.getElementById("summary-izin");
  const summaryTotal = document.getElementById("summary-total");
  const startScanBtn = document.getElementById("start-scan-btn");
  const stopScanBtn = document.getElementById("stop-scan-btn");
  const qrReaderEl = document.getElementById("qr-reader");
  const qrScanFeedback = document.getElementById("qr-scan-feedback");
  const formAbsensiManual = document.getElementById("form-absensi-manual");
  const absensiNamaAnggotaSelect = document.getElementById(
    "absensi-nama-anggota"
  );
  const dbSaldoTabungan = document.getElementById("db-saldo-tabungan");
  const dbSaldoKas = document.getElementById("db-saldo-kas");
  const dbHadirHariIni = document.getElementById("db-hadir-hari-ini");
  const dbTotalAnggota = document.getElementById("db-total-anggota");

  let dataCache = { siswa: [], kasLog: [], anggotaKas: [], anggotaAbsen: [] };
  let html5QrCode = null;
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);

  // INISIALISASI
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    showApp();
  } else {
    showLogin();
  }

  // EVENT LISTENERS
  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
  navDashboard.addEventListener("click", () => switchTab("dashboard"));
  navTabungan.addEventListener("click", () => switchTab("tabungan"));
  navKas.addEventListener("click", () => switchTab("kas"));
  navAbsensi.addEventListener("click", () => switchTab("absensi"));

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener(
      "click",
      (e) => (e.target.closest(".modal").style.display = "none")
    );
  });

  btnShowKasModal.addEventListener("click", () => {
    formKas.reset();
    modalKas.style.display = "flex";
  });

  formTabungan.addEventListener("submit", handleTabunganSubmit);
  formKas.addEventListener("submit", handleKasSubmit);
  formAbsensiManual.addEventListener("submit", handleAbsensiManualSubmit);
  startScanBtn.addEventListener("click", handleScanStart);
  stopScanBtn.addEventListener("click", handleScanStop);

  // FUNGSI-FUNGSI UTAMA
  function handleLogin(e) {
    e.preventDefault();
    if (
      document.getElementById("username").value === CONFIG.USER.username &&
      document.getElementById("password").value === CONFIG.USER.password
    ) {
      sessionStorage.setItem("isLoggedIn", "true");
      showApp();
    } else {
      document.getElementById("login-error").textContent =
        "Username atau password salah.";
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("isLoggedIn");
    if (html5QrCode && html5QrCode.isScanning) handleScanStop();
    showLogin();
  }

  function showLogin() {
    loginContainer.classList.add("active");
    appContainer.classList.remove("active");
  }

  function showApp() {
    loginContainer.classList.remove("active");
    appContainer.classList.add("active");
    switchTab("dashboard");
  }

  function switchTab(tabName) {
    navDashboard.classList.toggle("active", tabName === "dashboard");
    navTabungan.classList.toggle("active", tabName === "tabungan");
    navKas.classList.toggle("active", tabName === "kas");
    navAbsensi.classList.toggle("active", tabName === "absensi");

    dashboardSection.style.display = tabName === "dashboard" ? "block" : "none";
    tabunganSection.style.display = tabName === "tabungan" ? "block" : "none";
    kasSection.style.display = tabName === "kas" ? "block" : "none";
    absensiSection.style.display = tabName === "absensi" ? "block" : "none";

    if (dataCache.siswa.length === 0 || tabName === "dashboard") {
      fetchInitialData();
    }

    if (tabName !== "absensi" && html5QrCode && html5QrCode.isScanning) {
      handleScanStop();
    }
  }

  async function fetchInitialData() {
    document.getElementById("dashboard-loader").style.display = "block";
    try {
      const res = await fetch(`${CONFIG.API_URL}?action=getInitialData`);
      const data = await res.json();
      if (data.error) {
        throw new Error("Error dari server: " + data.message);
      }
      dataCache = data;
      renderDashboard(data.dashboard);
      renderTabunganTable(data.siswa);
      renderKasView(data.kasLog, data.anggotaKas);
      renderAbsensiView(data.anggotaKas); // Anggota Kas digunakan untuk Absen juga
    } catch (error) {
      console.error("Gagal memuat data awal:", error);
      alert("Gagal memuat semua data. Coba refresh halaman.");
    } finally {
      document.getElementById("dashboard-loader").style.display = "none";
    }
  }

  function renderDashboard(data) {
    dbSaldoTabungan.textContent = formatRupiah(data.totalSaldoTabungan);
    dbSaldoKas.textContent = formatRupiah(data.totalSaldoKas);
    dbTotalAnggota.textContent = data.totalAnggota;
    fetchAbsensiLog(true); // Ambil log absen untuk update data hadir
  }

  function renderTabunganTable(siswa) {
    tabunganLoader.style.display = "block";
    tabunganTable.style.display = "none";
    tabunganTbody.innerHTML = "";
    if (!siswa || siswa.length === 0) {
      tabunganTbody.innerHTML = `<tr><td colspan="7">Tidak ada data siswa ditemukan.</td></tr>`;
    } else {
      // ... (kode render tabel tabungan yang sudah ada)
      const groupedData = { CACAPAS: [], PASBAR: [], Lainnya: [] };
      siswa.forEach((row) => {
        const kelas = row[3] || "";
        if (kelas.trim().toUpperCase().startsWith("X ")) {
          groupedData.CACAPAS.push(row);
        } else if (kelas.trim().toUpperCase().startsWith("XI ")) {
          groupedData.PASBAR.push(row);
        } else {
          groupedData.Lainnya.push(row);
        }
      });
      const groupOrder = ["CACAPAS", "PASBAR", "Lainnya"];
      groupOrder.forEach((groupName) => {
        const studentsInGroup = groupedData[groupName];
        if (studentsInGroup.length > 0) {
          const headerRow = document.createElement("tr");
          const headerCell = document.createElement("th");
          headerCell.colSpan = 7;
          headerCell.className = "group-header";
          headerCell.textContent = groupName;
          headerRow.appendChild(headerCell);
          tabunganTbody.appendChild(headerRow);
          studentsInGroup.sort((a, b) => {
            const namaA = a[2] || "";
            const namaB = b[2] || "";
            const kelasA = a[3] || "";
            const kelasB = b[3] || "";
            if (groupName === "PASBAR") {
              const bidangA = a[5] || "";
              const bidangB = b[5] || "";
              if (bidangA < bidangB) return -1;
              if (bidangA > bidangB) return 1;
              if (kelasA < kelasB) return -1;
              if (kelasA > kelasB) return 1;
            } else {
              if (kelasA < kelasB) return -1;
              if (kelasA > kelasB) return 1;
            }
            return namaA.localeCompare(namaB);
          });
          studentsInGroup.forEach(([no, nis, nama, kls, total, bidang]) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${no}</td><td>${nis}</td><td>${nama}</td><td>${kls}</td><td>${formatRupiah(
              total
            )}</td><td>${
              bidang || "-"
            }</td><td><button class="action-btn" data-nama="${nama}">Transaksi</button></td>`;
            tr.querySelector(".action-btn").addEventListener("click", (e) => {
              modalTabunganNama.textContent = e.target.dataset.nama;
              formTabungan.reset();
              modalTabungan.style.display = "flex";
            });
            tabunganTbody.appendChild(tr);
          });
        }
      });
    }
    tabunganLoader.style.display = "none";
    tabunganTable.style.display = "table";
  }

  async function handleTabunganSubmit(e) {
    e.preventDefault();
    const payload = {
      action: "addTransaksiTabungan",
      nama: modalTabunganNama.textContent,
      jenis: document.getElementById("jenis-tabungan").value,
      jumlah: document.getElementById("jumlah-tabungan").value,
    };
    await submitData({ payload, modalToHide: modalTabungan });
  }

  function renderKasView(log, anggota) {
    let pemasukan = 0,
      pengeluaran = 0;
    kasLogTbody.innerHTML = "";
    if (log) {
      log.forEach(([tanggal, nis, nama, keterangan, jenis, jumlah]) => {
        if (jenis === "Pemasukan") pemasukan += Number(jumlah);
        if (jenis === "Pengeluaran") pengeluaran += Number(jumlah);
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${new Date(tanggal).toLocaleDateString(
          "id-ID"
        )}</td><td>${
          nama || "-"
        }</td><td>${keterangan}</td><td><span class="chip ${jenis.toLowerCase()}">${jenis}</span></td><td>${formatRupiah(
          jumlah
        )}</td>`;
        kasLogTbody.prepend(tr);
      });
    }
    kasPemasukanEl.textContent = formatRupiah(pemasukan);
    kasPengeluaranEl.textContent = formatRupiah(pengeluaran);
    kasSaldoEl.textContent = formatRupiah(pemasukan - pengeluaran);
    populateAnggotaDropdown(anggota, kasNamaAnggotaSelect);
  }

  async function handleKasSubmit(e) {
    e.preventDefault();
    const [nis, nama] = kasNamaAnggotaSelect.value.split("|");
    const payload = {
      action: "addTransaksiKas",
      nis: nis || "",
      nama: nama || "",
      keterangan: document.getElementById("keterangan-kas").value,
      jenis: document.getElementById("jenis-kas").value,
      jumlah: document.getElementById("jumlah-kas").value,
    };
    await submitData({ payload, modalToHide: modalKas });
  }

  function renderAbsensiView(anggota) {
    const anggotaKelas11 = anggota.filter((row) =>
      (row[3] || "").startsWith("XI")
    );
    populateAnggotaDropdown(anggotaKelas11, absensiNamaAnggotaSelect);
    fetchAbsensiLog();
  }

  async function fetchAbsensiLog(isDashboard = false) {
    absensiLoader.style.display = "block";
    try {
      const res = await fetch(`${CONFIG.API_URL}?action=getAbsensiLog`);
      const log = await res.json();
      updateAbsensiUI(log, isDashboard);
    } catch (error) {
      console.error("Gagal memuat log absensi:", error);
    } finally {
      absensiLoader.style.display = "none";
    }
  }

  function updateAbsensiUI(log, isDashboard) {
    let counts = { Hadir: 0, Sakit: 0, Izin: 0 };
    if (!isDashboard) absensiLogTbody.innerHTML = "";

    if (log && log.length > 0) {
      log.forEach((row) => {
        const keterangan = row[5];
        counts[keterangan] = (counts[keterangan] || 0) + 1;
        if (!isDashboard) {
          const [timestamp, nis, nama, kelas, bidang] = row;
          const tr = document.createElement("tr");
          const waktu = new Date(timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          tr.innerHTML = `<td>${waktu}</td><td>${nis}</td><td>${nama}</td><td>${kelas}</td><td>${
            bidang || "-"
          }</td><td><span class="chip ${keterangan.toLowerCase()}">${keterangan}</span></td>`;
          absensiLogTbody.prepend(tr);
        }
      });
    } else {
      if (!isDashboard)
        absensiLogTbody.innerHTML =
          '<tr><td colspan="6">Belum ada absensi hari ini.</td></tr>';
    }

    if (isDashboard) {
      dbHadirHariIni.textContent = `${counts.Hadir} / ${
        dataCache.anggotaKas.filter((a) => (a[3] || "").startsWith("XI")).length
      }`;
    } else {
      summaryHadir.textContent = counts.Hadir;
      summarySakit.textContent = counts.Sakit;
      summaryIzin.textContent = counts.Izin;
      summaryTotal.textContent = dataCache.anggotaKas.filter((a) =>
        (a[3] || "").startsWith("XI")
      ).length;
    }
  }

  async function handleAbsensiManualSubmit(e) {
    e.preventDefault();
    const nis = absensiNamaAnggotaSelect.value;
    const keterangan = document.getElementById("absensi-keterangan").value;
    if (!nis) return alert("Silakan pilih anggota terlebih dahulu.");

    const anggota = dataCache.anggotaKas.find((row) => row[1] === nis);
    if (anggota) {
      const payload = {
        action: "addAbsensi",
        nis: anggota[1],
        nama: anggota[2],
        kelas: anggota[3],
        bidang: anggota[4] || "",
        keterangan: keterangan,
      };
      await submitData({ payload });
    }
  }

  function handleScanStart() {
    /* ... kode sama seperti sebelumnya ... */
  }
  function handleScanStop() {
    /* ... kode sama seperti sebelumnya ... */
  }

  async function submitData({ payload, modalToHide }) {
    const btn = modalToHide
      ? modalToHide.querySelector("button[type='submit']")
      : null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Menyimpan...";
    }
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.status !== "success")
        throw new Error(result.message || "Gagal menyimpan data.");
      if (modalToHide) modalToHide.style.display = "none";
      fetchInitialData();
    } catch (error) {
      alert(`Gagal menyimpan data. Coba lagi.\nError: ${error.message}`);
      console.error(error);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Simpan";
      }
    }
  }

  function populateAnggotaDropdown(anggota, selectElement) {
    const isKas = selectElement.id === "kas-nama-anggota";
    selectElement.innerHTML = isKas
      ? '<option value="|-- Transaksi Umum --">-- Transaksi Umum --</option>'
      : '<option value="">-- Pilih Anggota --</option>';
    if (anggota) {
      anggota
        .sort((a, b) => (a[2] || "").localeCompare(b[2] || ""))
        .forEach((row) => {
          const [no, nis, nama, kelas] = row;
          if (!nama) return;
          const opt = document.createElement("option");
          opt.value = isKas ? `${nis}|${nama}` : nis;
          opt.textContent = `${nama} (${kelas})`;
          selectElement.appendChild(opt);
        });
    }
  }

  function handleScanStart() {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("qr-reader");
    }
    startScanBtn.style.display = "none";
    stopScanBtn.style.display = "block";
    qrReaderEl.style.display = "block";
    qrScanFeedback.style.display = "none";
    qrScanFeedback.textContent = "";
    const e = (e, t) => {
      if (html5QrCode.isScanning) {
        handleScanStop();
        const t = e,
          n = dataCache.anggotaKas.find((e) => e[1] === t);
        n
          ? n[3].startsWith("XI")
            ? ((qrScanFeedback.textContent = `Sukses! Absen untuk ${n[2]} tercatat.`),
              (qrScanFeedback.className = "success"),
              (qrScanFeedback.style.display = "block"),
              submitData({
                payload: {
                  action: "addAbsensi",
                  nis: n[1],
                  nama: n[2],
                  kelas: n[3],
                  bidang: n[4] || "",
                  keterangan: "Hadir",
                },
              }))
            : ((qrScanFeedback.textContent = `Error: ${n[2]} bukan anggota kelas XI.`),
              (qrScanFeedback.className = "error"),
              (qrScanFeedback.style.display = "block"))
          : ((qrScanFeedback.textContent = `Error: Anggota dengan NIS ${t} tidak ditemukan.`),
            (qrScanFeedback.className = "error"),
            (qrScanFeedback.style.display = "block")),
          setTimeout(() => {
            qrScanFeedback.style.display = "none";
          }, 5e3);
      }
    };
    const t = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, t, e).catch((e) => {
      alert(
        "Gagal memulai kamera. Pastikan Anda memberikan izin akses kamera di browser."
      ),
        handleScanStop();
    });
  }
  function handleScanStop() {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        html5QrCode.stop().catch((e) => console.log("Kamera sudah berhenti."));
      } catch (e) {}
    }
    startScanBtn.style.display = "block";
    stopScanBtn.style.display = "none";
    qrReaderEl.style.display = "none";
  }
});
