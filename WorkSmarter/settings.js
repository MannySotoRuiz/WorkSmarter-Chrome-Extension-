

let output = document.getElementById('output');
let blockedDomains = [];

// call this when user opens popup
// display any saved  blocked URLs to the output div 
chrome.runtime.sendMessage({ cmd: 'GET_DATA' }, response => {
    if (response.link.length != 0) {
        blockedDomains = response.link;
        let listOfSites = document.getElementById('ListOfSites');
        for (let i = 0; i < blockedDomains.length; i++) {
            let newSiteDiv = document.createElement('div');
            let newSite = document.createElement('li');
            newSite.appendChild(document.createTextNode(blockedDomains[i]));
            let deleteURL = document.createElement('img');
            deleteURL.classList.add('hidden');
            deleteURL.classList.add('emojiDeleteURL');
            deleteURL.src = 'images/deleteURL.jpg';
            deleteURL.onclick = function(event) {
                let clickedURL = event.currentTarget.parentElement;
                chrome.runtime.sendMessage({ cmd: 'DELETE_URL', link: clickedURL.innerHTML });
                removeURL(clickedURL.innerHTML);
                clickedURL.remove();
            }
            newSite.appendChild(deleteURL);
            newSiteDiv.appendChild(newSite);
            newSiteDiv.onmouseover = function(event) {
                event.currentTarget.children[0].children[0].classList.remove('hidden');
            }
            newSiteDiv.onmouseout = function(event) {
                event.currentTarget.children[0].children[0].classList.add('hidden');
            }
            listOfSites.appendChild(newSiteDiv);
        }
    }
});

// when user clicks to save url
document.getElementById('submit').onclick = function(event) {
    let siteFromUser = document.getElementById('site').value;
    document.getElementById('limitReached').classList.add('hidden');
    document.getElementById('incorrectFormat').classList.add('hidden');
    document.getElementById('alreadyExists').classList.add('hidden');
    // user have reached limit of URLs
    if (blockedDomains.length == 11) {
        document.getElementById('limitReached').classList.remove('hidden');
    // user gave an incorrect URL input
    } else if (!ifValidURL(siteFromUser)) {
        console.log('incorrect format');
        document.getElementById('incorrectFormat').classList.remove('hidden');
    // user gave correct URL input
    } else {
        chrome.runtime.sendMessage({ cmd: 'STORE_URL', link: siteFromUser });
        chrome.runtime.sendMessage({ cmd: 'GET_DATA' }, response => {
            // URL input from user already exits in array of blocked URLs
            if (blockedDomains.length == response.link.length) {
                console.log('site already exists in array');
                document.getElementById('alreadyExists').classList.remove('hidden');
            // add the URL to blocked URLs array
            } else {
                blockedDomains = response.link;
                let listOfSites = document.getElementById('ListOfSites');
                let newSiteDiv = document.createElement('div');
                let newSite = document.createElement('li');
                newSite.appendChild(document.createTextNode(blockedDomains[blockedDomains.length - 1]));
                let deleteURL = document.createElement('img');          // give each URL to be deleted if wanted by user
                deleteURL.classList.add('hidden');
                deleteURL.classList.add('emojiDeleteURL');
                deleteURL.src = 'images/deleteURL.jpg';
                deleteURL.onclick = function(event) {
                    let clickedURL = event.currentTarget.parentElement;
                    chrome.runtime.sendMessage({ cmd: 'DELETE_URL', link: clickedURL.innerHTML });
                    removeURL(clickedURL.innerHTML);
                    clickedURL.remove();
                }
                newSite.appendChild(deleteURL);
                newSiteDiv.appendChild(newSite);
                newSiteDiv.onmouseover = function(event) {              // when user's mouse is over the div of a specific URL, display delete button
                    event.currentTarget.children[0].children[0].classList.remove('hidden');
                }
                newSiteDiv.onmouseout = function(event) {               // when user's mouse is over the div of a specific URL, display delete button
                    event.currentTarget.children[0].children[0].classList.add('hidden');
                }
                listOfSites.appendChild(newSiteDiv);
            }
        });
    }
}; // end of onclick call for submit button

// button to clear all array of blocked URLs
document.getElementById('clearAllURLS').onclick = function(event) {
    $("li").remove();
    blockedDomains = [];
    chrome.runtime.sendMessage({ cmd: 'CLEAR_URLs', arr: blockedDomains });
    document.getElementById('limitReached').classList.add('hidden');
    document.getElementById('incorrectFormat').classList.add('hidden');
    document.getElementById('alreadyExists').classList.add('hidden');
}; // end of onclick call for clear button

function removeURL(url) {
    for (let i = 0; i < blockedDomains.length; i++) {
        let testDomain = blockedDomains[i];
        if (url.includes(testDomain)) {
            blockedDomains.splice(i, 1);
            break;
        }
    }
}

// method to see if user input is a valid URL input
function ifValidURL(site) {
    try {
        const url = new URL(site);
        return true;
    } catch (error) {
        console.log('INVALID URL');
        return false;
    }
}