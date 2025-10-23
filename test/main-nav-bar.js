let userDataString = localStorage.getItem('userData');
let userData = null
if (userDataString) {
    userData = JSON.parse(userDataString)
}

document.addEventListener('DOMContentLoaded', function() {
    
    const navbar = document.getElementById('mainNavbar');
    const mainNavMobileBtn = document.getElementById('mainNavMobileBtn');
    const mainNavMobileMenu = document.getElementById('mainNavMobileMenu');
    const mainNavLinks = document.querySelectorAll('.main-nav-link');
    const mainNavMobileLinks = document.querySelectorAll('.main-nav-mobile-link');

    // Language dropdown functionality
    const languageDropdown = document.getElementById('languageDropdown');
    const languageBtn = document.getElementById('languageBtn');
    const currentLanguage = document.getElementById('currentLanguage');
    const languageOptions = document.querySelectorAll('.main-nav-language-option');

    
    languageBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!languageDropdown?.contains(e.target)) {
            languageDropdown?.classList.remove('open');
        }
    });

    // Language option click
    languageOptions?.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            languageDropdown.classList.remove('open');
        });
    });

    // Mobile menu toggle
    mainNavMobileBtn?.addEventListener('click', function() {
        mainNavMobileBtn.classList.toggle('main-nav-mobile-active');
        mainNavMobileMenu.classList.toggle('main-nav-mobile-open');
    });

    // Active link management
    function setActiveLink(href) {
        mainNavLinks.forEach(l => l.classList.remove('main-nav-link-active'));
        mainNavLinks.forEach(l => {
            if (l.getAttribute('href') === href) {
                l.classList.add('main-nav-link-active');
            }
        });
    }

    // Connect buttons
    document.querySelectorAll('.main-nav-log-out-btn, .main-nav-mobile-log-out-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showCustomConfirm(`Ar tikrai norite atsijungti?`, logout)
        });
    });

    document.querySelectorAll('.main-nav-log-in-btn, .main-nav-mobile-log-in-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'prisijungimas.html';
        });
    });

    [document.getElementById('mobileBackBtn'), document.getElementById('desktopBackBtn')]
    .forEach(btn => {
        if (btn) {
        btn.addEventListener('click', e => {
            e.preventDefault(); // prevent default link behavior
            backToPreviousPage();
        });
        }
    });
});

if (userData) {
    document.querySelector(".main-nav-log-in-btn")?.style.setProperty('display', 'none');
    document.querySelector(".main-nav-mobile-log-in-btn")?.style.setProperty('display', 'none');
    if (userData.accType === "teacher") {
        const augintiniaiLink = document.querySelector('.main-nav-link[href="augintiniai.html"]');
        augintiniaiLink?.style.setProperty('display', 'none');
    }
} else {
    document.querySelector(".main-nav-log-out-btn")?.style.setProperty('display', 'none');
    document.querySelector(".main-nav-mobile-log-out-btn")?.style.setProperty('display', 'none');

    document.querySelectorAll('.main-nav-link').forEach(navLink => {
        if (navLink.getAttribute('href') !== 'apie.html' && navLink.getAttribute('href') !== 'index.html') {
            navLink.style.display = 'none';
        }
    });

    document.querySelectorAll('.main-nav-mobile-link').forEach(navLink => {
        if (navLink.getAttribute('href') !== 'apie.html' && navLink.getAttribute('href') !== 'index.html') {
            navLink.style.display = 'none';
        }
    });
}

document.querySelector('.main-nav-links.invisible').classList.remove('invisible');

function setLanguage(lang) {
    // Update desktop dropdown
    document.querySelectorAll('.main-nav-language-option').forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('selected');
        }
    });
    
    // Update mobile buttons
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('.language-option-' + lang).forEach(option => {
        option.classList.add('selected');
    });
    
    // Update displayed language
    document.getElementById('currentLanguage').textContent = lang;
    
    console.log('Language changed to:', lang);
    // Add your language switching logic here
}

function backToPreviousPage() {
    // Get the previous page filename
    const previousPage = document.referrer.split('/').pop() || 'index.html';
    const targetPages = ['index.html', 'uzduotys.html', 'klase.html'];

    if (targetPages.includes(previousPage)) {
        // Use relative path instead of absolute
        let url = previousPage;

        // Append query parameter to indicate "came from back"
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}fromBack=true`;

        // Navigate to previous page
        window.location.href = url;
    } else {
        window.location.href = 'index.html';
    }
}

