import './styles.css';
import { 
  detectAndRedirectMobile,
  hideLoginError, 
  showLoginState, 
  showLoginForm, 
  showApp,  
  btnLogin,
  btnSignup,
  btnLogout,
  showLoginError
} from './ui'

import { initializeApp } from 'firebase/app';

import { 
  getAuth,
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

import { getFirestore, collection, doc, setDoc, getDoc, query, onSnapshot, deleteDoc, where, getDocs} from "firebase/firestore";

import { clientCredentials} from './spotify'


import Swal from 'sweetalert2'


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
    await signInWithEmailAndPassword(auth, loginEmail, loginPassword)

    // Show the "Login with Spotify" button
    const loginButton = document.getElementById("btnLogout");
    loginButton.classList.remove("hidden");
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    showLoginError(error);
  }
}

async function createAccount() {
  const email = txtEmail.value;
  const password = txtPassword.value;
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Extract the part of the email before the "@" sign
    const userEmailPart = email.substring(0, email.indexOf("@"));

    // Create a new document in Firestore with the user's email part and initial allowance
    const userData = {
      userId: user.uid,
      userName: userEmailPart,
      allowance: 10,
    };

    await setDoc(doc(collection(db, "users"), user.uid), userData);
    const loginButton = document.getElementById("btnLogout");
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
      if (userData.userName == "Admin") {
        document.getElementById("userName").textContent = `User: ${userData.userName}`;
      }
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
      showApp()
      console.log(user)
      isAdmin(user)
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

// check Admin state
async function isAdmin(user){
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const userData = userDocSnap.data();
  console.log(userData);
  if (userData.userName == "Admin") {
    // Assuming the button has an id of "adminButton"
    document.getElementById("csvDown").style.display = "block";
  } else {
    document.getElementById("csvDown").style.display = "none";
  }
}

// Log out
const logout = async () => {
  const loginButton = document.getElementById("btnLogout");
  loginButton.classList.add("hidden");
  const candy = document.getElementById("retro")
  candy.style.display = "flex";
  await signOut(auth);
}

// Works
async function checkSongExistence(trackId) {
  // Create a query
  const songRef = collection(db, "addedSongs");
  const queryDuplicate = query(songRef, where("songId", "==", trackId));

  // Execute the query
  const querySnapshot = await getDocs(queryDuplicate);

  // Check if a document was found
  if (querySnapshot.empty) {
    return 1;
  }
  else {
    return 0;
  }
}

// Function to decrement the allowance of a user when they add a song
export async function addTrackToDb(item) {
  const user = auth.currentUser;
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const trackUri = item.uri;
  const trackId = item.id;
  const songHistoryDocRef = doc(db, "songHistory", trackId);
  const trackTitle = item.name;
  if (userDocSnap.exists()) {
    const addedSongDocRef = doc(db, "addedSongs", trackId);
    const dupCheck = await checkSongExistence(trackId);
    if (dupCheck == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lucky You!',
        text: 'This song has already been requested, use your credit for something else!',
      });
      return;
    }
    if (userDocSnap.data().allowance === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Credits!',
        text: "You have no allowance left. Please try again when you have credits",
      });
      return;
    }

    const userData = userDocSnap.data();
    const newAllowance = userData.allowance - 1;
    const newuserData = {
      userId: userData.userId,
      userName: userData.userName,
      allowance: newAllowance,
    };

    await setDoc(doc(collection(db, "users"), user.uid), newuserData);
    document.getElementById("userAllowance").textContent = `Allowance: ${newAllowance}`;

    const a = document.getElementById("songTitle");
    a.innerText = '';

    // Generate a unique ID for the added song
    await setDoc(addedSongDocRef, {
      songId: trackId,
      songUri: trackUri,
      songTitle: trackTitle
    },
    { merge: true })
        .then(async () => {
          // Add song to song history
          await setDoc(songHistoryDocRef, {
            songId: trackId,
            songUri: trackUri,
            songTitle: trackTitle
          },
          { merge: true });
        Swal.fire(
          'Success!',
          'You have added your music to the mix!',
          'success'
        );

        // Clear the search input field and the search results
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';

      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.' + error,
        });
      });
  }
}


// Its in the title...
function saveAsCSV(data) {
  const csvContent = data.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.download = `extractedURIs-${timestamp}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//Function to empty the database of all song documents
export async function deleteFirestoreDoc(songId) {
  await deleteDoc(doc(db, "addedSongs", songId));
}  

// get the firestore documents and display their contents in the console
export async function queryTrackUri() {
  const addedSongsCollectionRef = collection(db, "addedSongs");
  const q = query(addedSongsCollectionRef);
  const extractedURIs = [];
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      extractedURIs.push(data.songId);
      deleteFirestoreDoc(data.songId);
    });
  
    // You can remove the unsubscribe() call if you want the function to keep listening for updates
    unsubscribe();
    saveAsCSV(extractedURIs);
    return extractedURIs;
  });
}

async function showDownloadButton() {
  const csvDown = document.getElementById("csvDown")
  csvDown.classList.remove("hidden");
  csvDown.addEventListener("click", queryTrackUri);
}

// Request Client Secret and Client ID from the server
async function getClientInfo() {
  const DocRef = doc(db, "clientInfo", "gargoyle");
  const collect = await getDoc(DocRef);
  console.log(collect.data().ID, collect.data().secret)
  return clientCredentials(collect.data().ID, collect.data().secret);
}

document.getElementById("txtEmail").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
      event.preventDefault(); // Prevent form from being submitted
      loginEmailPassword(); // Replace this with your actual login function
  }
});

document.getElementById("txtPassword").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
      event.preventDefault(); // Prevent form from being submitted
      loginEmailPassword(); // Replace this with your actual login function
  }
});


// Event listeners
btnLogin.addEventListener("click", loginEmailPassword) 
btnSignup.addEventListener("click", createAccount)
btnLogout.addEventListener("click", logout)


monitorAuthState();
showDownloadButton();
detectAndRedirectMobile();
getClientInfo();
