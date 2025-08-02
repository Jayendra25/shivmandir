// auth.js

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBHyFRMnx2rLrVIfUW5hsFz1mdbXgQsI5E",
  authDomain: "templecommittee-2de4f.firebaseapp.com",
  projectId: "templecommittee-2de4f",
  storageBucket: "templecommittee-2de4f.firebasestorage.app",
  messagingSenderId: "739412456793",
  appId: "1:739412456793:web:de0f3399644623722d8848",
  measurementId: "G-24Y4SN2YXG"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 🔐 Login function (only call this from login.html)
function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// 🔒 Check if user is logged in, redirect to login.html if not
function checkAuthAndRedirect() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

// 🚪 Logout function
function logoutAndRedirect() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ⛳ Get current user
function getCurrentUser() {
  return auth.currentUser;
}
