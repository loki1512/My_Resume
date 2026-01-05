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

/* FIREBASE */
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

/* PASSWORDS (CHANGE ANYTIME) */
const PUBLIC_PASSWORD = "PUBLIC_PASSWORD";
const PRIVATE_PASSWORD = "PRIVATE_PASSWORD";

/* STATE */
let username = "";
let roomId = "";
let unsubscribe = null;

/* DOM */
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

/* ENTER ROOM (FIXED) */
function enterRoom() {
  const name = nameInput.value.trim();
  const pass = passwordInput.value;

  if (!name || !pass) {
    alert("Enter name and password");
    return;
  }

  if (pass === khushi) {
    roomId = "room_public";
    roomTitle.innerText = "Chat Anywhere";
  } else if (pass === Loki) {
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

/* LOAD MESSAGES */
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

      const row = document.createElement("div");
      row.className = "msg-row " + (m.name === username ? "me-row" : "other-row");

      const bubble = document.createElement("div");
      bubble.className = "msg " + (m.name === username ? "me" : "other");

      bubble.innerHTML = `
        <div class="name">${m.name}</div>
        ${m.text}
      `;

      row.appendChild(bubble);
      chat.appendChild(row);
    });

    chat.scrollTop = chat.scrollHeight;
  });
}

/* SEND MESSAGE */
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

/* CLEAR CURRENT ROOM */
async function clearChat() {
  if (!confirm("Clear this chat?")) return;

  const snap = await getDocs(collection(db, "rooms", roomId, "messages"));
  snap.forEach(d => deleteDoc(doc(db, "rooms", roomId, "messages", d.id)));
}

/* LOGOUT */
function logout() {
  location.reload();
}

/* EVENTS (NO INLINE HANDLERS) */
enterBtn.addEventListener("click", enterRoom);
passwordInput.addEventListener("keydown", e => e.key === "Enter" && enterRoom());

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

clearBtn.addEventListener("click", clearChat);
logoutBtn.addEventListener("click", logout);