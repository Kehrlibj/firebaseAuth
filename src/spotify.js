import { Buffer } from 'buffer';
import SpotifyWebApi from 'spotify-web-api-js';
import {decrementAllowance} from './index.js';
const spotifyApi = new SpotifyWebApi(); // Your secret
const clientId = '3cfeb414e83848a6bd70bee63a4c6996'; 
const redirectUri = 'https://webpacktest-cca52.web.app/callback';

function generateRandomString(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// Generate random string for state
let codeVerifier = generateRandomString(128);

//generate the value using the SHA256 algorithm from the given data
async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

async function getAuthorizationUrl() {
  try {
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-library-read user-library-modify playlist-modify-public playlist-modify-private';

    localStorage.setItem('code-verifier', codeVerifier);

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });

    return 'https://accounts.spotify.com/authorize?' + args.toString();
  } catch (error) {
    console.error('Error:', error);
  }
}

//This seems like the current problem...
// async function redirectToSpotify() {
//   try {
//     const codeChallenge = await generateCodeChallenge(codeVerifier);
//     const state = generateRandomString(16);
//     const scope = 'user-read-private user-read-email';

//     localStorage.setItem('code-verifier', codeVerifier);

//     const args = new URLSearchParams({
//       response_type: 'code',
//       client_id: clientId,
//       scope: scope,
//       redirect_uri: redirectUri,
//       state: state,
//       code_challenge_method: 'S256',
//       code_challenge: codeChallenge
//     });

//     window.location.href = 'https://accounts.spotify.com/authorize?' + args.toString();
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// document.getElementById('login-button').addEventListener('click', redirectToSpotify);

async function handleCallback(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const storedCodeVerifier = localStorage.getItem('code-verifier');

  const APIbody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: storedCodeVerifier
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: APIbody
    });

    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }

    const data = await response.json();
    localStorage.setItem('access-token', data.access_token);
    spotifyApi.setAccessToken(localStorage.getItem('access-token'));

    // Redirect to a different URL, for example, '/app'
    window.location.href = '/app'; // Change this to the desired URL
  } catch (error) {
    console.error('Error:', error);
  }
}

async function requestUserAuthorization() {

  const clientId = '3cfeb414e83848a6bd70bee63a4c6996'; // Your client id
  let codeVerifier = generateRandomString(128);
// Request user authorization
  generateCodeChallenge(codeVerifier).then(codeChallenge => {
  let state = generateRandomString(16);
  let scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-library-read user-library-modify';

  localStorage.setItem('code-verifier', codeVerifier);

  let args = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  window.location = 'https://accounts.spotify.com/authorize?' + args;
  });
}


async function getProfile() {
  let accessToken = localStorage.getItem('access-token');

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  console.log(data);
}
  


// Page manager to check if the user is authenticated
window.addEventListener('DOMContentLoaded', async () => {
  const currentUrl = window.location.href;
  // Check if the URL contains the 'code' and 'state' parameters
  if (currentUrl.includes('code=') && currentUrl.includes('state=')) {
    // Call the handleCallback function with the current URL
    await handleCallback(currentUrl);

    // Optionally, you can clear the URL parameters after handling the callback
  }

  // Set the href attribute of the login button to the authorization URL
  const loginButton = document.getElementById('login-button');
  loginButton.href = await getAuthorizationUrl();
});


// Get the Adds a track to the playlist
async function addTrack(playlistId, [trackUri]) {
  const accessToken = localStorage.getItem('access-token');
  console.log(trackUri)
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: JSON.stringify({
        uris: [trackUri]
      })
    });

    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }

    console.log('Track added to playlist successfully');
  } catch (error) {
    console.error('Error adding track to playlist:', error);
  }
}


// Search spotify resources, 
async function searchSpotify() {
  const searchInput = document.getElementById("searchInput").value;
  const searchType = document.getElementById("searchType").value;
  const accessToken = localStorage.getItem('access-token');

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=${searchType}&limit=10`, {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    });

    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }

    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error('Error searching Spotify:', error);
  }
}

//post the results neatly to the DOM
function displaySearchResults(data) {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = '';

  const searchType = document.getElementById("searchType").value;
  const items = data[searchType + 's'].items;

  for (const item of items) {
    const div = document.createElement("div");
    div.innerText = item.name;
    div.classList.add("searchResultItem");
    div.addEventListener("click", async () => {
      await addTrackToStagingCard(item);
    });
    searchResults.appendChild(div);
  }
}

// Add a track to a staging card before adding to playlist
function addTrackToStagingCard(item) {
  // Clear the staging card before adding new track information
  const a = document.getElementById("songTitle");
  a.innerText = item.name;
  a.classList.add("stagingCardItem");

  // Remove any existing event listeners from the submitButton 
  // const submitButton = document.getElementById('submitButton');
  
  const button = document.getElementById('submitButton');
  const buttonWithoutListeners = removeAllEventListeners(button);

  // Add the addTrackToPlaylist function to the button with id submitButton
  buttonWithoutListeners.addEventListener('click', () => addTrackToPlaylist(item));
}

async function addTrackToPlaylist(item) {
  const trackUri = item.uri;
  const playlistId = '5TQSBRY3Ie9J7FQPr2nSU4'; // Replace this with the desired playlist ID
  // Clear the current name of the staged track from the staging card
  const a = document.getElementById("songTitle");
  a.innerText = '';
  // Decrement the allowance of the user
  decrementAllowance()
  await addTrack(playlistId, [trackUri]); // Pass an array with the trackUri
}

function removeAllEventListeners(element) {
  const clonedElement = element.cloneNode(true);
  element.parentNode.replaceChild(clonedElement, element);
  return clonedElement;
}


document.getElementById('searchButton').addEventListener('click', searchSpotify);

document.getElementById('login-button-2').addEventListener('click', getProfile);
//handleCallback();

