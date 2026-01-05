import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔥 FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyBDdyBI_y8pDHtvCY8IzKH6aU_l4br8m7c",
  authDomain: "chat-anywhere-test.firebaseapp.com",
  projectId: "chat-anywhere-test",
  storageBucket: "chat-anywhere-test.appspot.com",
  messagingSenderId: "153337832150",
  appId: "1:153337832150:web:ba87a5b49d04ceccbd1f77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🔐 PASSWORDS — SET THESE */
const PUBLIC_PASSWORD = "khushi";
const PRIVATE_PASSWORD = "Loki";

/* WAIT FOR DOM (CRITICAL FIX) */
window.addEventListener("DOMContentLoaded", () => {

  const loginDiv = document.getElementById("login");
  const appDiv = document.getElementById("app");
  const chat = document.getElementById("chat");
  const input = document.getElementById("msg");
  const roomTitle = document.getElementById("roomTitle");

  const nameInput = document.getElementById("nameInput");
  const passwordInput = document.getElementById("passwordInput");
  const enterBtn = document.getElementById("enterBtn");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let username = "";
  let roomId = "";
  let unsubscribe = null;

  function enterRoom() {
    const name = nameInput.value.trim();
    const pass = passwordInput.value;

    if (!name || !pass) {
      alert("Enter name and password");
      return;
    }

    if (pass === PUBLIC_PASSWORD) {
      roomId = "room_public";
      roomTitle.innerText = "Chat Anywhere";
    } else if (pass === PRIVATE_PASSWORD) {
      roomId = "room_private";
      roomTitle.innerText = "Private Room";
    } else {
      alert("Wrong password");
      return;
    }

    username = name;
    loginDiv.style.display = "none";
    appDiv.style.display = "block";

    loadMessages();
  }

  function loadMessages() {
    if (unsubscribe) unsubscribe();

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("time")
    );

    unsubscribe = onSnapshot(q, snap => {
      chat.innerHTML = "";
      snap.forEach(d => {
        const m = d.data();
        chat.innerHTML += `<div><b>${m.name}:</b> ${m.text}</div>`;
      });
      chat.scrollTop = chat.scrollHeight;
    });
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      name: username,
      text,
      time: serverTimestamp()
    });

    input.value = "";
  }

  async function clearChat() {
    if (!confirm("Clear chat?")) return;
    const snap = await getDocs(collection(db, "rooms", roomId, "messages"));
    snap.forEach(d => deleteDoc(doc(db, "rooms", roomId, "messages", d.id)));
  }

  /* EVENTS */
  enterBtn.addEventListener("click", enterRoom);
  passwordInput.addEventListener("keydown", e => e.key === "Enter" && enterRoom());

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

  clearBtn.addEventListener("click", clearChat);
  logoutBtn.addEventListener("click", () => location.reload());
});