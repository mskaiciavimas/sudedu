const userLogInDiv = document.querySelector('#user-login-div')
const userLoginAnchor = document.querySelector('#user-login-anchor')
const loggedInUserMenu = document.querySelector('#loggedin-user-menu')
const loggedInUserID = document.querySelector('#loggedin-user-id')
const loggedInUserNickname = document.querySelector('#loggedin-user-nickname')
let profile = document.querySelector('.profile');
let menu = document.querySelector('.menu');

profile.onclick = function () {
    menu.classList.toggle('active');
}

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