let userDataString = localStorage.getItem('userData');

document.addEventListener('DOMContentLoaded', function() {
    
    const mainNavbar = document.getElementById('mainNavbar');
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
    document.querySelectorAll('.main-nav-connect-btn, .main-nav-mobile-connect').forEach(btn => {
        btn.addEventListener('click', function() {
            clearUserData();
        });
    });
});

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

function clearUserData() {
    localStorage.removeItem('userData');
    window.location.reload();
}

function hideNavbar() {
    navbar.classList.add('keyboard-open');
    navbarToggle.classList.add('show');
}

function showNavbar() {
    navbar.classList.remove('keyboard-open');
    navbarToggle.classList.remove('show');
    isManuallyHidden = false;
}

window.visualViewport?.addEventListener('resize', () => {
    const currentHeight = window.visualViewport.height;
    const heightDiff = initialHeight - currentHeight;
    
    // If viewport shrunk significantly (keyboard opened)
    if (heightDiff > 150) {
        hideNavbar();
    } else if (!isManuallyHidden) {
        showNavbar();
    }
});