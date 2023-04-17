import './styles.css';
import { 
  hideLoginError, 
  showLoginState, 
  showLoginForm, 
  showApp,  
  btnLogin,
  btnSignup,
  btnLogout
} from './ui'

import { initializeApp } from 'firebase/app';

import { 
  getAuth,
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";

import { login } from './spotify'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = initializeApp({
  apiKey: "AIzaSyB9jitBqaTWho3K6-vZl71DESAs4j69sDQ",
  authDomain: "webpacktest-cca52.firebaseapp.com",
  databaseURL: "https://webpacktest-cca52-default-rtdb.firebaseio.com",
  projectId: "webpacktest-cca52",
  storageBucket: "webpacktest-cca52.appspot.com",
  messagingSenderId: "413574358702",
  appId: "1:413574358702:web:80b0fe2ff98c9a60e02f3f",
  measurementId: "G-EW92BM3LVV"
});



// Initialize Firestore
const db = getFirestore(firebaseConfig);
const auth = getAuth(firebaseConfig);
// Login with email/password
const loginEmailPassword = async () => {
  const loginEmail = txtEmail.value;
  const loginPassword = txtPassword.value;
  console.log(`Logging in with ${loginEmail} and ${loginPassword}`);
  // step 2: add error handling
  try {
    const userAuth = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    console.log(userAuth);

    // Show the "Login with Spotify" button
    const loginButton = document.getElementById("login-button");
    loginButton.classList.remove("hidden");
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error);
  }
}

const createAccount = async () => {
  const email = txtEmail.value;
  const password = txtPassword.value;
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Extract the part of the email before the "@" sign
    const userEmailPart = email.substring(0, email.indexOf("@"));

    // Create a new document in Firestore with the user's email part and initial allowance
    const userData = {
      user: userEmailPart,
      allowance: 600,
    };

    await setDoc(doc(collection(db, "users"), user.uid), userData);
    const loginButton = document.getElementById("login-button");
    console.log("User created and Firestore document added");
    loginButton.classList.remove("hidden");
  } catch (error) {
    console.log(`There was an error: ${error}`);
    showLoginError(error);
  }
};

// Display user data
const displayUserData = async (userId) => {
  try {
    // Fetch the user document from Firestore
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Update the HTML elements with the fetched data
      const userData = userDocSnap.data();
      document.getElementById("userName").textContent = `User: ${userData.user}`;
      document.getElementById("userAllowance").textContent = `Allowance: ${userData.allowance}`;
    } else {
      console.log("User data not found in Firestore");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Monitor auth state
const monitorAuthState = async () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log(user)
      showApp()
      showLoginState(user)
      hideLoginError()
      displayUserData(user.uid)
    }
    else {
      showLoginForm()
      document.getElementById("userName").textContent = "";
      document.getElementById("userAllowance").textContent = "";
    }
  })
}

// Log out
const logout = async () => {
  const loginButton = document.getElementById("login-button");
  loginButton.classList.add("hidden");
  await signOut(auth);
}

// Function to decrement the allowance of a user when they add a song
export async function decrementAllowance() {
  const user = auth.currentUser;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    const newAllowance = userData.allowance - 1;
    await setDoc(userDocRef, { allowance: newAllowance });
    document.getElementById("userAllowance").textContent = `Allowance: ${newAllowance}`;
  }
}

// Event listeners
btnLogin.addEventListener("click", loginEmailPassword) 
btnSignup.addEventListener("click", createAccount)
btnLogout.addEventListener("click", logout)


monitorAuthState();