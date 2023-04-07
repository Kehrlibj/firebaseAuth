import { Buffer } from 'buffer';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const clientSecret = '176140a51d994118aa47be82ff8b6094'; // Your secret



document.getElementById('login-button').addEventListener('click', login);


export function login() {
  console.log("im here")
  const clientId = '3cfeb414e83848a6bd70bee63a4c6996';
  const redirectUri = 'https://webpacktest-cca52.web.app';
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email';

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  // Redirect the user to the authorization URL
  window.location.href = authUrl.toString();
}

// Example of a simple function to generate a random string
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


window.addEventListener('DOMContentLoaded', async () => {
  const currentUrl = window.location.href;
  console.log("Called Back")
  // Check if the URL contains the 'code' and 'state' parameters
  if (currentUrl.includes('code=') && currentUrl.includes('state=')) {
    // Call the handleCallback function with the current URL
    await handleCallback(currentUrl);

    // Optionally, you can clear the URL parameters after handling the callback
    const newUrl = new URL(currentUrl);
    newUrl.searchParams.delete('code');
    newUrl.searchParams.delete('state');
    window.history.replaceState(null, null, newUrl.toString());
  }
});

async function handleCallback(callbackUrl) {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  // You might want to check the 'state' value against a stored value for security purposes

  if (code && state) {
    try {
      // Exchange the authorization code for an access token and refresh token
      const tokenData = await fetchAccessToken(code);
      // Set the access token in the Spotify Web API wrapper
      spotifyApi.setAccessToken(tokenData.access_token);

      // Hide the "Login with Spotify" button after successful authentication
      document.getElementById('login-button').style.display = 'none';

      // You can now make authorized requests using the Spotify Web API wrapper
    } catch (error) {
      console.error('Error handling callback:', error);
    }
  }
}

async function addTrack(playlistId, trackUri) {
  try {
    await spotifyApi.addTracksToPlaylist(playlistId, trackUri);
    console.log('Track added to playlist successfully');
  } catch (error) {
    console.error('Error adding track to playlist:', error);
  }
}

async function testPlaylistAdd() {
  const trackUri = 'spotify:track:6Pq9MmkDQYZiiCDpxnvrf6';
  const playlistId = '5TQSBRY3Ie9J7FQPr2nSU4';
  // Set the access token in the Spotify Web API wrapper
  addTrack(playlistId, trackUri)
      .then(data => {
      console.log('Track added to playlist:', data);
    })
    .catch(error => {
          console.error('Error adding track to playlist:', error);
  });
}

document.getElementById('test-button').addEventListener('click', testPlaylistAdd);



//Client only
// async function getSpotifyAccessToken(clientId, clientSecret) {
//   const tokenEndpoint = 'https://accounts.spotify.com/api/token';
//   const credentials = btoa(`${clientId}:${clientSecret}`);
//   const body = new URLSearchParams();
//   body.append('grant_type', 'client_credentials');

//   try {
//     const response = await fetch(tokenEndpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Authorization': `Basic ${credentials}`,
//       },
//       body: body.toString(),
//     });

//     if (!response.ok) {
//       throw new Error(`Error ${response.status}: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data.access_token;
//   } catch (error) {
//     console.error('Error fetching access token:', error);
//     return null;
//   }
// }

// getSpotifyAccessToken(clientId, clientSecret)
//   .then(accessToken => {
//     if (accessToken) {
//       console.log('Access token:', accessToken);
//       // Set access token for the SpotifyWebApi instance and make further requests
//       spotifyApi.setAccessToken(accessToken);
//       // Make your search request here, or call another function that makes the request
//       const trackUri = 'spotify:track:6Pq9MmkDQYZiiCDpxnvrf6';
//       const playlistId = '5TQSBRY3Ie9J7FQPr2nSU4';
//       addTrackToPlaylist(playlistId, trackUri)
//       .then(data => {
//         console.log('Track added to playlist:', data);
//       })
//       .catch(error => {
//         console.error('Error adding track to playlist:', error);
//       });
//     } else {
//       console.error('Failed to obtain access token');
//     }
//   })
//   .catch(error => {
//     console.error('Error fetching access token:', error);
//   });

// lets try to search for a track
// spotifyApi.searchTracks('I Am The Walrus')
//   .then(function(data) {
//     console.log('Search by "I Am The Walrus"', data);
//   }
// );

