import { Buffer } from 'buffer';
import { addTrackToDb } from './index.js';
import SpotifyWebApi from 'spotify-web-api-js';





export async function clientCredentials(client_id, client_secret) {
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);

    if (response.ok) {
      const body = await response.json();
      const token = body.access_token;
      localStorage.setItem('access-token', token);
    } else {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.json();
      console.error(`Error details: ${JSON.stringify(errorBody)}`);
    }
  } catch (error) {
    console.error(`Fetch error: ${error}`);
  }
}


// Search spotify resources, 
async function searchSpotify() {
  const searchInput = document.getElementById("searchInput").value;
  const searchType = "track";
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
    console.log(data);
    displaySearchResults(data);
    const candy = document.getElementById("retro");
    candy.style.display = "none";
  } catch (error) {
    console.error('Error searching Spotify:', error);
  }
}

function displaySearchResults(data) {
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = '';

  const searchType = "track";
  let items = data[searchType + 's'].items;

  // Sort items by popularity in descending order
  items = items.sort((a, b) => b.popularity - a.popularity);

  for (const item of items) {
    // Only display tracks that are not explicit
    // if (item.explicit == false) {
    const div = document.createElement("div");
    div.classList.add("searchResultItem");
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.addEventListener("click", async () => {
      addTrackToStagingCard(item);
    });

    const section1 = document.createElement("div");
    section1.innerText = item.name; // Modify as needed for your use case
    section1.style.flex = '1';

    const section2 = document.createElement("div");
    section2.innerText = item.artists[0].name; // Modify as needed for your use case
    section2.style.flex = '1';

    const section3 = document.createElement("div");
    section3.innerText = item.album.name; // Modify as needed for your use case
    section3.style.flex = '1';

    const img = document.createElement("img");
    img.src = item.album.images[2].url;
    img.alt = item.name + " album art";
    img.style.width = '5%'; // Adjust as needed to make the image smaller
    div.appendChild(img);

    div.appendChild(section1);
    div.appendChild(section2);
    div.appendChild(section3);
    
    searchResults.appendChild(div);
    // }
    // Console log when an explicit song is found
    //else {
    //console.log("Explicit song found, skipping...");
    //}
  }
}


// Add a track to a staging card before adding to playlist
function addTrackToStagingCard(item) {
  // Get the elements
  const songTitle = document.getElementById("songTitle");
  const artistName = document.getElementById("artistName");
  const albumName = document.getElementById("albumName");
  const albumArt = document.getElementById("albumArt");

  // Populate the content
  songTitle.innerText = item.name;
  artistName.innerText = item.artists[0].name;
  albumName.innerText = item.album.name;
  albumArt.src = item.album.images[0].url;
  albumArt.alt = item.name + " album art";

  // Remove any existing event listeners from the submitButton 
  const button = document.getElementById('submitButton');
  const buttonWithoutListeners = removeAllEventListeners(button);

  // Add the addTrackToPlaylist function to the button with id submitButton
  buttonWithoutListeners.addEventListener('click', () => {
    addTrackToPlaylist(item);
    clearStagingCard();
  });
}

// Clear the staging card
function clearStagingCard() {
  // Get the elements
  const songTitle = document.getElementById("songTitle");
  const artistName = document.getElementById("artistName");
  const albumName = document.getElementById("albumName");
  const albumArt = document.getElementById("albumArt");

  // Clear the content
  songTitle.innerHTML = '';
  artistName.innerHTML = '';
  albumName.innerHTML = '';
  albumArt.src = '';
  albumArt.alt = '';
}


async function addTrackToPlaylist(item) {
  // Decrement the allowance of the user
  await addTrackToDb(item); // Pass an array with the trackUri
}

function removeAllEventListeners(element) {
  const clonedElement = element.cloneNode(true);
  element.parentNode.replaceChild(clonedElement, element);
  return clonedElement;
}

const search = document.getElementById("searchButton");
search.addEventListener("click", searchSpotify);

// also enact the search if the user presses enter
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key == 'Enter') {
      // call your function here
      searchSpotify();
  }
});



