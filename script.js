import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔥 Firebase config */
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

/* 🔐 ASK NAME — EVERY REFRESH */
let username = prompt("Enter your name");
if (!username || username.trim() === "") {
  username = "User" + Math.floor(Math.random() * 1000);
}

/* DOM */
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

/* 🔁 LISTEN FOR MESSAGES */
onSnapshot(collection(db, "messages"), (snapshot) => {
  chat.innerHTML = "";
  snapshot.forEach(d => {
    const msg = d.data();
    const cls = msg.name === username ? "me" : "other";

    chat.innerHTML += `
      <div class="msg ${cls}">
        <div class="name">${msg.name}</div>
        ${msg.text}
      </div>
    `;
  });
  chat.scrollTop = chat.scrollHeight;
});

/* 📤 SEND MESSAGE */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    name: username,
    text: text,
    time: serverTimestamp()
  });

  input.value = "";
}

/* Button + Enter key */
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* 🧹 CLEAR CHAT — MUST BE GLOBAL */
window.clearChat = async function () {
  if (!confirm("Clear all messages for everyone?")) return;

  const snap = await getDocs(collection(db, "messages"));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "messages", d.id));
  }
};

/* 🚪 LOGOUT — MUST BE GLOBAL */
window.logout = function () {
  location.reload(); // refresh → asks name again
};