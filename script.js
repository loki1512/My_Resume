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

// 🔐 Ask name EVERY load
let username = prompt("Enter your name");
if (!username) {
  username = "User" + Math.floor(Math.random() * 1000);
}

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

// 🔁 Listen for messages
onSnapshot(collection(db, "messages"), (snapshot) => {
  chat.innerHTML = "";
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const cls = d.name === username ? "me" : "other";

    chat.innerHTML += `
      <div class="msg ${cls}">
        <div class="name">${d.name}</div>
        ${d.text}
      </div>
    `;
  });
  chat.scrollTop = chat.scrollHeight;
});

// ✅ SEND (fixed)
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

// Button click
sendBtn.addEventListener("click", sendMessage);

// Enter key
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// 🧹 CLEAR CHAT (delete all messages)
window.clearChat = async function () {
  if (!confirm("Clear all messages?")) return;

  const snap = await getDocs(collection(db, "messages"));
  snap.forEach(d => deleteDoc(doc(db, "messages", d.id)));
};

// 🚪 LOGOUT
window.logout = function () {
  location.reload();
};