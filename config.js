// File: config.js

// Import fungsi yang kita butuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// =======================================================
// === KODE KONFIGURASI "ARTAKITA" ANDA ===
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyBP7DUADOb1yh6sj0XMvN3OqhEtAE4tfg0",
  authDomain: "artakita-ca7fd.firebaseapp.com",
  projectId: "artakita-ca7fd",
  storageBucket: "artakita-ca7fd.appspot.com",
  messagingSenderId: "733822646721",
  appId: "1:733822646721:web:cfb9f73afb0739425a9740",
};
// =======================================================

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Konfigurasi login admin (tetap sama)
const ADMIN_USER = {
  username: "admin",
  password: "12345",
};

// Ekspor variabel db dan ADMIN_USER agar bisa dipakai di script.js
export { db, ADMIN_USER };
