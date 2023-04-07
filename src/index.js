import './styles.css';
import { 
  hideLoginError, 
  showLoginState, 
  showLoginForm, 
  showApp, 
  showLoginError, 
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

import { testFunction } from './spotify';

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

const auth = getAuth(firebaseConfig);

// Login using email/password
const loginEmailPassword = async () => {
  const loginEmail = txtEmail.value;
  const loginPassword = txtPassword.value;
  console.log(`Logging in with ${loginEmail} and ${loginPassword}`);
  // step 2: add error handling
  try {
    const userAuth = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    console.log(userAuth)
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error)
  }
}

// Create new account using email/password
const createAccount = async () => {
  const email = txtEmail.value
  const password = txtPassword.value

  try {
    await createUserWithEmailAndPassword(auth, email, password)
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error)
  } 
}

// Monitor auth state
const monitorAuthState = async () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log(user)
      showApp()
      showLoginState(user)
      hideLoginError()
      hideLoginError()
      
    }
    else {
      showLoginForm()
      lblAuthState.innerHTML = `You're not logged in.`
    }
  })
}

// Log out
const logout = async () => {
  await signOut(auth);
}

btnLogin.addEventListener("click", loginEmailPassword) 
btnSignup.addEventListener("click", createAccount)
btnLogout.addEventListener("click", logout)


monitorAuthState();
