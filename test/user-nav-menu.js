const userLogInDiv = document.querySelector('#user-login-div');
const userLoginAnchor = document.querySelector('#user-login-anchor');
const loggedInUserMenu = document.querySelector('#loggedin-user-menu');
const loggedInUserID = document.querySelector('#loggedin-user-id');
const loggedInUserNickname = document.querySelector('#loggedin-user-nickname');
let profile = document.querySelector('.profile');
let menu = document.querySelector('.menu');

// Toggle menu when profile is clicked
profile.onclick = function(e) {
    e.stopPropagation(); // Prevent this click from bubbling up to document
    menu.classList.toggle('active');
};

// Close menu when clicking anywhere outside
document.addEventListener('click', function(e) {
    if (!menu.contains(e.target) && e.target !== profile) {
        menu.classList.remove('active');
    }
});

let userDataString = localStorage.getItem('userData');

if (userDataString) {
    const userData = JSON.parse(userDataString);
    userLoginAnchor.style.display = 'none';
    loggedInUserID.innerHTML = `ID: ${userData.userId}`;
    loggedInUserNickname.innerHTML = userData.nickname;
} else {
    loggedInUserMenu.style.display = 'none';
}

function clearUserData() {
    localStorage.removeItem('userData');
    window.location.reload();
}

function resizeFont() {
    var element = document.getElementById('loggedin-user-nickname');
    var parentWidth = element.parentElement.offsetWidth;
    var fontSize = 26;
    

    if (window.innerWidth <= 575) {
        fontSize = 22; 
    }

    element.style.fontSize = fontSize + 'px';
    
    while (element.scrollWidth > parentWidth && fontSize > 10) {
        fontSize -= 1; // Decrease font size
        element.style.fontSize = fontSize + 'px';
    }
}

// Call the function initially and on window resize
window.addEventListener('load', resizeFont);
window.addEventListener('resize', resizeFont);


// Assuming the nickname is fetched dynamically from the database and inserted into the #loggedin-user-nickname element
const nickname = document.getElementById('loggedin-user-nickname').innerText; // Example: "John Doe"

// Get the first letter of the nickname
const firstLetter = nickname.charAt(0).toUpperCase(); // Ensure it's uppercase

// Set the first letter inside the .img-box
document.getElementById('user-initial').innerText = firstLetter;
