// File: script.js (Versi Firebase Lengkap & Sudah Diperbaiki)

import { db, ADMIN_USER } from "./config.js";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // === DEKLARASI ELEMEN DOM ===
  const loginContainer = document.getElementById("login-container");
  const appContainer = document.getElementById("app-container");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // Navigasi
  const navTabungan = document.getElementById("nav-tabungan");
  const navKas = document.getElementById("nav-kas");
  const navAbsensi = document.getElementById("nav-absensi");
  const tabunganSection = document.getElementById("tabungan-section");
  const kasSection = document.getElementById("kas-section");
  const absensiSection = document.getElementById("absensi-section");

  // Tabungan
  const tabunganTbody = document.getElementById("tabungan-tbody");
  const tabunganLoader = document.getElementById("tabungan-loader");
  const tabunganTable = document.getElementById("tabungan-table");
  const modalAddSiswa = document.getElementById("modal-add-siswa");
  const btnShowAddSiswaModal = document.getElementById(
    "btn-show-add-siswa-modal"
  );
  const formAddSiswa = document.getElementById("form-add-siswa");
  const modalTabungan = document.getElementById("modal-tabungan");
  const modalTabunganNama = document.getElementById("modal-tabungan-nama");
  const formTabungan = document.getElementById("form-tabungan");
  let currentStudentId = null;

  // Kas
  const kasLoader = document.getElementById("kas-loader");
  const kasPemasukanEl = document.getElementById("kas-pemasukan");
  const kasPengeluaranEl = document.getElementById("kas-pengeluaran");
  const kasSaldoEl = document.getElementById("kas-saldo");
  const kasLogTable = document.getElementById("kas-log-table");
  const kasLogTbody = document.getElementById("kas-log-tbody");
  const btnShowKasModal = document.getElementById("btn-show-kas-modal");
  const modalKas = document.getElementById("modal-kas");
  const formKas = document.getElementById("form-kas");
  const kasNamaAnggotaSelect = document.getElementById("kas-nama-anggota");
  let paskibraMembersCache = [];

  // === INISIALISASI & EVENT LISTENERS ===
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    showApp();
  } else {
    showLogin();
  }

  loginForm.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
  navTabungan.addEventListener("click", () => switchTab("tabungan"));
  navKas.addEventListener("click", () => switchTab("kas"));

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener(
      "click",
      () =>
        (document.getElementById(btn.dataset.modalId).style.display = "none")
    );
  });

  // Tabungan Listeners
  btnShowAddSiswaModal.addEventListener(
    "click",
    () => (modalAddSiswa.style.display = "flex")
  );
  formAddSiswa.addEventListener("submit", handleAddSiswa);
  formTabungan.addEventListener("submit", handleTabunganSubmit);

  // Kas Listeners
  btnShowKasModal.addEventListener(
    "click",
    () => (modalKas.style.display = "flex")
  );
  formKas.addEventListener("submit", handleKasSubmit);

  // === FUNGSI-FUNGSI UTAMA ===
  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      sessionStorage.setItem("isLoggedIn", "true");
      showApp();
    } else {
      document.getElementById("login-error").textContent =
        "Username atau password salah.";
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("isLoggedIn");
    showLogin();
  }

  function showLogin() {
    loginContainer.classList.add("active");
    appContainer.classList.remove("active");
  }

  function showApp() {
    loginContainer.classList.remove("active");
    appContainer.classList.add("active");
    switchTab("tabungan");
  }

  function switchTab(tabName) {
    document
      .querySelectorAll(".nav-tab")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => (content.style.display = "none"));
    if (tabName === "tabungan") {
      navTabungan.classList.add("active");
      tabunganSection.style.display = "block";
      if (tabunganTbody.innerHTML === "") listenToTabunganData();
    } else if (tabName === "kas") {
      navKas.classList.add("active");
      kasSection.style.display = "block";
      if (kasLogTbody.innerHTML === "") listenToKasData();
    }
  }

  // === FUNGSI-FUNGSI TABUNGAN ===
  function listenToTabunganData() {
    tabunganLoader.style.display = "block";
    tabunganTable.style.display = "none";
    const studentsCol = collection(db, "students");
    onSnapshot(
      studentsCol,
      (snapshot) => {
        let allSiswa = [];
        snapshot.forEach((doc) => {
          allSiswa.push({ id: doc.id, ...doc.data() });
        });
        renderTabunganTable(allSiswa);
        tabunganLoader.style.display = "none";
        tabunganTable.style.display = "table";
      },
      (error) => {
        console.error("Error mendengarkan data:", error);
        tabunganLoader.textContent = "Gagal memuat data.";
      }
    );
  }

  function renderTabunganTable(siswa) {
    tabunganTbody.innerHTML = "";
    siswa.sort((a, b) =>
      a.kelas > b.kelas
        ? 1
        : a.kelas === b.kelas
        ? a.nama > b.nama
          ? 1
          : -1
        : -1
    );
    siswa.forEach((s, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${index + 1}</td><td>${s.nis || "-"}</td><td>${
        s.nama || "-"
      }</td><td>${s.kelas || "-"}</td><td>${formatRupiah(
        s.totalTabungan || 0
      )}</td><td>${
        s.bidang || "-"
      }</td><td><button class="action-btn" data-id="${s.id}" data-nama="${
        s.nama
      }">Transaksi</button></td>`;
      tabunganTbody.appendChild(tr);
    });
    document.querySelectorAll("#tabungan-table .action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        currentStudentId = e.target.dataset.id;
        modalTabunganNama.textContent = e.target.dataset.nama;
        formTabungan.reset();
        modalTabungan.style.display = "flex";
      });
    });
  }

  async function handleAddSiswa(e) {
    e.preventDefault();
    const newSiswa = {
      nis: document.getElementById("add-nis").value,
      nama: document.getElementById("add-nama").value,
      kelas: document.getElementById("add-kelas").value,
      bidang: document.getElementById("add-bidang").value,
      totalTabungan: 0,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "students"), newSiswa);
      formAddSiswa.reset();
      modalAddSiswa.style.display = "none";
    } catch (error) {
      console.error("Error menambah siswa:", error);
      alert("Gagal menambah siswa baru.");
    }
  }

  async function handleTabunganSubmit(e) {
    e.preventDefault();
    const jenis = document.getElementById("jenis-tabungan").value;
    const jumlah = Number(document.getElementById("jumlah-tabungan").value);
    if (!currentStudentId || jumlah <= 0) return;
    const studentRef = doc(db, "students", currentStudentId);
    const amountToUpdate = jenis === "Setoran" ? jumlah : -jumlah;
    try {
      await updateDoc(studentRef, { totalTabungan: increment(amountToUpdate) });
      await addDoc(collection(db, "savingsTransactions"), {
        studentId: currentStudentId,
        nama: modalTabunganNama.textContent,
        jenis: jenis,
        jumlah: jumlah,
        timestamp: serverTimestamp(),
      });
      modalTabungan.style.display = "none";
    } catch (error) {
      console.error("Error transaksi:", error);
      alert("Gagal melakukan transaksi.");
    }
  }

  // === FUNGSI-FUNGSI KAS ===
  function listenToKasData() {
    kasLoader.style.display = "block";
    const membersCol = collection(db, "paskibraMembers");
    onSnapshot(membersCol, (snapshot) => {
      paskibraMembersCache = [];
      snapshot.forEach((doc) => {
        paskibraMembersCache.push({ id: doc.id, ...doc.data() });
      });
      populateAnggotaDropdown(paskibraMembersCache, kasNamaAnggotaSelect);
    });
    const transactionsQuery = query(
      collection(db, "treasuryTransactions"),
      orderBy("timestamp", "desc")
    );
    onSnapshot(transactionsQuery, (snapshot) => {
      let transactions = [];
      snapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      renderKasView(transactions);
      kasLoader.style.display = "none";
    });
  }

  function renderKasView(transactions) {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    kasLogTbody.innerHTML = "";
    transactions.forEach((trx) => {
      const jumlah = Number(trx.jumlah || 0);
      if (trx.jenis === "Pemasukan") totalPemasukan += jumlah;
      if (trx.jenis === "Pengeluaran") totalPengeluaran += jumlah;
      const tr = document.createElement("tr");
      const tanggal = trx.timestamp
        ? trx.timestamp.toDate().toLocaleDateString("id-ID")
        : "N/A";
      tr.innerHTML = `<td>${tanggal}</td><td>${trx.nama || "-"}</td><td>${
        trx.keterangan || "-"
      }</td><td><span class="chip ${trx.jenis.toLowerCase()}">${
        trx.jenis
      }</span></td><td>${formatRupiah(jumlah)}</td>`;
      kasLogTbody.appendChild(tr);
    });
    kasPemasukanEl.textContent = formatRupiah(totalPemasukan);
    kasPengeluaranEl.textContent = formatRpiah(totalPengeluaran);
    kasSaldoEl.textContent = formatRupiah(totalPemasukan - totalPengeluaran);
  }

  function populateAnggotaDropdown(anggota, selectElement) {
    selectElement.innerHTML = '<option value="">-- Transaksi Umum --</option>';
    anggota.sort((a, b) => (a.nama > b.nama ? 1 : -1));
    anggota.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = `${member.nama} (${member.kelas})`;
      option.dataset.nama = member.nama;
      option.dataset.nis = member.nis;
      selectElement.appendChild(option);
    });
  }

  async function handleKasSubmit(e) {
    e.preventDefault();
    const selectedOption = kasNamaAnggotaSelect.selectedOptions[0];
    const newTransaction = {
      jenis: document.getElementById("jenis-kas").value,
      jumlah: Number(document.getElementById("jumlah-kas").value),
      keterangan: document.getElementById("keterangan-kas").value,
      timestamp: serverTimestamp(),
    };
    if (selectedOption && selectedOption.value) {
      newTransaction.memberId = selectedOption.value;
      newTransaction.nama = selectedOption.dataset.nama;
      newTransaction.nis = selectedOption.dataset.nis;
    }
    try {
      await addDoc(collection(db, "treasuryTransactions"), newTransaction);
      formKas.reset();
      modalKas.style.display = "none";
    } catch (error) {
      console.error("Error menambah transaksi kas:", error);
      alert("Gagal menambah transaksi kas.");
    }
  }
});
