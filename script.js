// File: script.js (VERSI FINAL - GOOGLE SHEETS)
document.addEventListener("DOMContentLoaded", () => {
  const e = document.getElementById("login-container"),
    t = document.getElementById("app-container"),
    n = document.getElementById("login-form"),
    a = document.getElementById("logout-btn"),
    o = document.getElementById("nav-dashboard"),
    d = document.getElementById("nav-tabungan"),
    s = document.getElementById("nav-kas"),
    l = document.getElementById("nav-absensi"),
    i = document.getElementById("nav-cetak-qr"),
    c = document.getElementById("dashboard-section"),
    r = document.getElementById("tabungan-section"),
    u = document.getElementById("kas-section"),
    m = document.getElementById("absensi-section"),
    b = document.getElementById("cetak-qr-section"),
    p = document.getElementById("tabungan-tbody"),
    h = document.getElementById("tabungan-loader"),
    g = document.getElementById("tabungan-table"),
    y = document.getElementById("modal-tabungan"),
    f = document.getElementById("modal-tabungan-nama"),
    k = document.getElementById("form-tabungan"),
    v = document.getElementById("kas-loader"),
    B = document.getElementById("kas-pemasukan"),
    E = document.getElementById("kas-pengeluaran"),
    L = document.getElementById("kas-saldo"),
    w = document.getElementById("kas-log-tbody"),
    S = document.getElementById("kas-log-table"),
    A = document.getElementById("btn-show-kas-modal"),
    x = document.getElementById("modal-kas"),
    I = document.getElementById("form-kas"),
    N = document.getElementById("kas-nama-anggota"),
    q = document.getElementById("absensi-loader"),
    H = document.getElementById("absensi-log-tbody"),
    C = document.getElementById("summary-hadir"),
    j = document.getElementById("summary-sakit"),
    T = document.getElementById("summary-izin"),
    D = document.getElementById("summary-total"),
    M = document.getElementById("start-scan-btn"),
    _ = document.getElementById("stop-scan-btn"),
    U = document.getElementById("qr-reader"),
    z = document.getElementById("qr-scan-feedback"),
    W = document.getElementById("form-absensi-manual"),
    O = document.getElementById("absensi-nama-anggota"),
    Z = document.getElementById("db-saldo-tabungan"),
    K = document.getElementById("db-saldo-kas"),
    Q = document.getElementById("db-hadir-hari-ini"),
    X = document.getElementById("db-total-anggota");
  let G = { siswa: [], kasLog: [], anggotaKas: [] },
    J = null;
  const ee = (e) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(e || 0);
  sessionStorage.getItem("isLoggedIn") === "true" ? te() : ne(),
    n.addEventListener("submit", ae),
    a.addEventListener("click", oe),
    o.addEventListener("click", () => se("dashboard")),
    d.addEventListener("click", () => se("tabungan")),
    s.addEventListener("click", () => se("kas")),
    l.addEventListener("click", () => se("absensi")),
    i.addEventListener("click", () => se("cetak-qr")),
    document.querySelectorAll(".close-btn").forEach((e) => {
      e.addEventListener(
        "click",
        (e) => (e.target.closest(".modal").style.display = "none")
      );
    }),
    A.addEventListener("click", () => {
      I.reset(), (x.style.display = "flex");
    }),
    k.addEventListener("submit", de),
    I.addEventListener("submit", le),
    W.addEventListener("submit", ie),
    M.addEventListener("click", ce),
    _.addEventListener("click", re);
  function ne() {
    e.classList.add("active"), t.classList.remove("active");
  }
  function te() {
    e.classList.remove("active"), t.classList.add("active"), se("dashboard");
  }
  function ae(t) {
    t.preventDefault(),
      document.getElementById("username").value === CONFIG.USER.username &&
      document.getElementById("password").value === CONFIG.USER.password
        ? (sessionStorage.setItem("isLoggedIn", "true"), te())
        : (document.getElementById("login-error").textContent =
            "Username atau password salah.");
  }
  function oe() {
    sessionStorage.removeItem("isLoggedIn"), J && J.isScanning && re(), ne();
  }
  function se(e) {
    o.classList.toggle("active", e === "dashboard"),
      d.classList.toggle("active", e === "tabungan"),
      s.classList.toggle("active", e === "kas"),
      l.classList.toggle("active", e === "absensi"),
      i.classList.toggle("active", e === "cetak-qr"),
      (c.style.display = e === "dashboard" ? "block" : "none"),
      (r.style.display = e === "tabungan" ? "block" : "none"),
      (u.style.display = e === "kas" ? "block" : "none"),
      (m.style.display = e === "absensi" ? "block" : "none"),
      (b.style.display = e === "cetak-qr" ? "block" : "none"),
      (G.siswa.length === 0 || "dashboard" === e) && ue(),
      e !== "absensi" && J && J.isScanning && re();
  }
  async function ue() {
    document.getElementById("dashboard-loader").style.display = "block";
    try {
      const e = await fetch(`${CONFIG.API_URL}?action=getInitialData`),
        t = await e.json();
      if (t.error) throw new Error("Error dari server: " + t.message);
      (G = t),
        be(G.dashboard),
        pe(G.siswa),
        he(G.kasLog, G.anggotaKas),
        ge(G.anggotaKas),
        ye(G.anggotaKas);
    } catch (e) {
      console.error("Gagal memuat data awal:", e),
        alert("Gagal memuat semua data. Coba refresh halaman.");
    } finally {
      document.getElementById("dashboard-loader").style.display = "none";
    }
  }
  function be(e) {
    (Z.textContent = ee(e.totalSaldoTabungan)),
      (K.textContent = ee(e.totalSaldoKas)),
      (X.textContent = e.totalAnggota),
      fetchAbsensiLog(!0);
  }
  function pe(e) {
    (g.style.display = "none"),
      (h.style.display = "block"),
      (p.innerHTML = ""),
      e && 0 !== e.length
        ? ((groupedData = { CACAPAS: [], PASBAR: [], Lainnya: [] }),
          e.forEach((e) => {
            const t = e[3] || "";
            t.trim().toUpperCase().startsWith("X ")
              ? groupedData.CACAPAS.push(e)
              : t.trim().toUpperCase().startsWith("XI ")
              ? groupedData.PASBAR.push(e)
              : groupedData.Lainnya.push(e);
          }),
          (groupOrder = ["CACAPAS", "PASBAR", "Lainnya"]),
          groupOrder.forEach((t) => {
            const n = groupedData[t];
            if (n.length > 0) {
              const e = document.createElement("tr"),
                a = document.createElement("th");
              (a.colSpan = 7),
                (a.className = "group-header"),
                (a.textContent = t),
                e.appendChild(a),
                p.appendChild(e),
                n.sort((e, t) => {
                  const n = e[2] || "",
                    a = t[2] || "",
                    o = e[3] || "",
                    d = t[3] || "";
                  if ("PASBAR" === t) {
                    const t = e[5] || "",
                      n = t[5] || "";
                    if (t < n) return -1;
                    if (t > n) return 1;
                    if (o < d) return -1;
                    if (o > d) return 1;
                  } else {
                    if (o < d) return -1;
                    if (o > d) return 1;
                  }
                  return n.localeCompare(a);
                }),
                n.forEach(([e, t, n, a, o, d]) => {
                  const s = document.createElement("tr");
                  (s.innerHTML = `<td>${e}</td><td>${t}</td><td>${n}</td><td>${a}</td><td>${ee(
                    o
                  )}</td><td>${
                    d || "-"
                  }</td><td><button class="action-btn" data-nama="${n}">Transaksi</button></td>`),
                    s
                      .querySelector(".action-btn")
                      .addEventListener("click", (e) => {
                        (f.textContent = e.target.dataset.nama),
                          k.reset(),
                          (y.style.display = "flex");
                      }),
                    p.appendChild(s);
                });
            }
          }))
        : (p.innerHTML =
            '<tr><td colspan="7">Tidak ada data siswa ditemukan.</td></tr>'),
      (h.style.display = "none"),
      (g.style.display = "table");
  }
  async function de(e) {
    e.preventDefault();
    const t = {
      action: "addTransaksiTabungan",
      nama: f.textContent,
      jenis: document.getElementById("jenis-tabungan").value,
      jumlah: document.getElementById("jumlah-tabungan").value,
    };
    await fe({ payload: t, modalToHide: y });
  }
  function he(e, t) {
    let n = 0,
      a = 0;
    (w.innerHTML = ""),
      e &&
        e.forEach(([e, t, o, d, s, l]) => {
          "Pemasukan" === s && (n += Number(l)),
            "Pengeluaran" === s && (a += Number(l));
          const i = document.createElement("tr");
          (i.innerHTML = `<td>${new Date(e).toLocaleDateString(
            "id-ID"
          )}</td><td>${
            o || "-"
          }</td><td>${d}</td><td><span class="chip ${s.toLowerCase()}">${s}</span></td><td>${ee(
            l
          )}</td>`),
            w.prepend(i);
        }),
      (B.textContent = ee(n)),
      (E.textContent = ee(a)),
      (L.textContent = ee(n - a)),
      ke(t, N);
  }
  function ke(e, t) {
    (t.innerHTML =
      '<option value="|-- Transaksi Umum --">-- Transaksi Umum --</option>'),
      e &&
        e.forEach(([e, n, a, o, d]) => {
          if (!a) return;
          const s = document.createElement("option");
          (s.value = `${n}|${a}`),
            (s.textContent = `${a} (${o})`),
            t.appendChild(s);
        });
  }
  async function le(e) {
    e.preventDefault();
    const [t, n] = N.value.split("|"),
      a = {
        action: "addTransaksiKas",
        nis: t || "",
        nama: n || "",
        keterangan: document.getElementById("keterangan-kas").value,
        jenis: document.getElementById("jenis-kas").value,
        jumlah: document.getElementById("jumlah-kas").value,
      };
    await fe({ payload: a, modalToHide: x });
  }
  function ge(e) {
    const t = e.filter((e) => (e[3] || "").startsWith("XI"));
    ke(t, O), fetchAbsensiLog();
  }
  async function fetchAbsensiLog(e = !1) {
    q.style.display = "block";
    try {
      const t = await fetch(`${CONFIG.API_URL}?action=getAbsensiLog`),
        n = await t.json();
      ve(n, e);
    } catch (e) {
      console.error("Gagal memuat log absensi:", e);
    } finally {
      q.style.display = "none";
    }
  }
  function ve(e, t) {
    H.innerHTML = "";
    let n = { Hadir: 0, Sakit: 0, Izin: 0 };
    e && e.length > 0
      ? e.forEach(([e, a, o, d, s, l]) => {
          n[l] = (n[l] || 0) + 1;
          const i = document.createElement("tr"),
            c = new Date(e).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
          (i.innerHTML = `<td>${c}</td><td>${a}</td><td>${o}</td><td>${d}</td><td>${
            s || "-"
          }</td><td><span class="chip ${l.toLowerCase()}">${l}</span></td>`),
            H.prepend(i);
        })
      : (H.innerHTML =
          '<tr><td colspan="6">Belum ada absensi hari ini.</td></tr>'),
      t
        ? (Q.textContent = `${n.Hadir} / ${
            G.anggotaKas.filter((e) => (e[3] || "").startsWith("XI")).length
          }`)
        : ((C.textContent = n.Hadir),
          (j.textContent = n.Sakit),
          (T.textContent = n.Izin),
          (D.textContent = G.anggotaKas.filter((e) =>
            (e[3] || "").startsWith("XI")
          ).length));
  }
  async function fe(e) {
    const t = e.modalToHide
      ? e.modalToHide.querySelector("button[type='submit']")
      : null;
    t && ((t.disabled = !0), (t.textContent = "Menyimpan..."));
    try {
      const n = await fetch(CONFIG.API_URL, {
          method: "POST",
          body: JSON.stringify(e.payload),
          headers: { "Content-Type": "application/json" },
        }),
        a = await n.json();
      if ("success" !== a.status)
        throw new Error(a.message || "Gagal menyimpan data.");
      e.modalToHide && (e.modalToHide.style.display = "none"), ue();
    } catch (e) {
      alert(`Gagal menyimpan data. Coba lagi.\nError: ${e.message}`),
        console.error(e);
    } finally {
      t && ((t.disabled = !1), (t.textContent = "Simpan"));
    }
  }
  async function ie(e) {
    e.preventDefault();
    const t = O.value,
      n = document.getElementById("absensi-keterangan").value;
    if (!t) return void alert("Silakan pilih anggota terlebih dahulu.");
    const a = G.anggotaKas.find((e) => e[1] === t);
    a &&
      fe({
        payload: {
          action: "addAbsensi",
          nis: a[1],
          nama: a[2],
          kelas: a[3],
          bidang: a[4] || "",
          keterangan: n,
        },
      });
  }
  function ce() {
    J || (J = new Html5Qrcode("qr-reader")),
      (M.style.display = "none"),
      (_.style.display = "block"),
      (U.style.display = "block"),
      (z.style.display = "none"),
      (z.textContent = "");
    const e = (e, t) => {
      if (J.isScanning) {
        re();
        const t = e,
          n = G.anggotaKas.find((e) => e[1] === t);
        n
          ? n[3].startsWith("XI")
            ? ((z.textContent = `Sukses! Absen untuk ${n[2]} tercatat.`),
              (z.className = "success"),
              (z.style.display = "block"),
              fe({
                payload: {
                  action: "addAbsensi",
                  nis: n[1],
                  nama: n[2],
                  kelas: n[3],
                  bidang: n[4] || "",
                  keterangan: "Hadir",
                },
              }))
            : ((z.textContent = `Error: ${n[2]} bukan anggota kelas XI.`),
              (z.className = "error"),
              (z.style.display = "block"))
          : ((z.textContent = `Error: Anggota dengan NIS ${t} tidak ditemukan.`),
            (z.className = "error"),
            (z.style.display = "block")),
          setTimeout(() => {
            z.style.display = "none";
          }, 5e3);
      }
    };
    const t = { fps: 10, qrbox: { width: 250, height: 250 } };
    J.start({ facingMode: "environment" }, t, e).catch((e) => {
      alert(
        "Gagal memulai kamera. Pastikan Anda memberikan izin akses kamera di browser."
      ),
        re();
    });
  }
  function re() {
    J &&
      J.isScanning &&
      (() => {
        try {
          J.stop();
        } catch (e) {
          console.error(
            "Gagal menghentikan kamera, mungkin sudah berhenti.",
            e
          );
        }
      })(),
      (M.style.display = "block"),
      (_.style.display = "none"),
      (U.style.display = "none");
  }
  function ye(e) {
    const t = document.getElementById("qr-card-container");
    (t.innerHTML = ""),
      e
        .sort((e, t) =>
          e[3] > t[3] ? 1 : e[3] === t[3] ? (e[2] > t[2] ? 1 : -1) : -1
        )
        .forEach(([e, n, a, o, d]) => {
          if (!n) return;
          const s = document.createElement("div");
          (s.className = "qr-card"),
            (s.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${n}" alt="QR Code for ${a}">
            <h4>${a}</h4>
            <p>${o}</p>
        `),
            t.appendChild(s);
        });
  }
});
