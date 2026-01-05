import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  serverTimestamp, getDocs, deleteDoc, doc
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

/* NAME */
let username = prompt("Enter your name");
if (!username) username = "User" + Math.floor(Math.random() * 1000);

/* DOM */
const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const replyPreview = document.getElementById("replyPreview");

let replyTo = null;

/* LISTEN */
onSnapshot(collection(db, "messages"), (snap) => {
  chat.innerHTML = "";
  snap.forEach(d => {
    const m = d.data();
    const cls = m.name === username ? "me" : "other";

    const div = document.createElement("div");
    div.className = `msg ${cls}`;

    if (m.reply) {
      div.innerHTML += `<div class="reply-box">${m.reply}</div>`;
    }

    div.innerHTML += `<div class="name">${m.name}</div>${m.text}`;
    addSwipe(div, m.text);
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
});

/* SWIPE TO REPLY */
function addSwipe(el, text) {
  let startX = 0;

  el.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  el.addEventListener("touchmove", e => {
    const diff = e.touches[0].clientX - startX;
    if (diff > 40) el.style.transform = "translateX(40px)";
  });

  el.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    el.style.transform = "";
    if (diff > 60) setReply(text);
  });
}

/* SET REPLY */
function setReply(text) {
  replyTo = text;
  replyPreview.style.display = "block";
  replyPreview.innerText = "Replying to: " + text;
}

/* SEND */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    name: username,
    text,
    reply: replyTo,
    time: serverTimestamp()
  });

  input.value = "";
  replyTo = null;
  replyPreview.style.display = "none";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

/* GLOBAL */
window.clearChat = async function () {
  if (!confirm("Clear all messages?")) return;
  const snap = await getDocs(collection(db, "messages"));
  snap.forEach(d => deleteDoc(doc(db, "messages", d.id)));
};

window.logout = () => location.reload();