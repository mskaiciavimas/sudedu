let userDataString = localStorage.getItem('userData');
let userData = null
if (userDataString) {
    userData = JSON.parse(userDataString)
}

if (userData?.accType === "admin" && !window.location.href.includes("admin.html")) {
    window.location.href = "./admin.html";
}

// WAKING UP RENDER SERVER START

let lastActive = Date.now();
const limit = 15 * 60 * 1000; // 15 min

function triggerMyFunction() {
  wakeUpServer();
}

function activityDetected() {
  const now = Date.now();

  if (now - lastActive >= limit) {
    triggerMyFunction();

    // Prevent multiple alerts from back-to-back events
    lastActive = now + limit;
    return;
  }

  lastActive = now;
}

["click","mousemove","keydown","scroll","touchstart"].forEach(event => {
  document.addEventListener(event, activityDetected);
});

async function wakeUpServer() {

    if (!userData) return

    let showMessageTimeout;
    let closer;

    const container = document.body;
    if (container) {
        Array.from(container.children).forEach(child => {
            child.style.pointerEvents = "none";
            child.style.opacity = "0.5";
        });
    }

    // Schedule showing the message after 500ms
    showMessageTimeout = setTimeout(() => {
        closer = messageToTheUser(
            "Laukiama žinutės iš serverio. Procesas gali užtrukti kelias minutes.",
            false, true
        );
    }, 500);

    try {
        const response = await fetch(apiBase + 'auth/wake-up', { method: 'GET' });

        if (!response) {
            throw new Error('No response from server');
        }

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.code !== 'OK') {
            throw new Error('Unexpected response code');
        }

        return true;
    } catch (error) {
        console.error("Wake-up failed:", error);
        messageToTheUser("Nepavyko susisiekti su serveriu. Praktikuotis vis dar galima, bet paskyros duomenys neprieinami ir užduočių rezultatai nebus išsaugoti!", 'error');
        return false;
    } finally {
        if (container) {
            Array.from(container.children).forEach(child => {
                child.style.pointerEvents = "auto";
                child.style.opacity = "1";
            });
        }

        clearTimeout(showMessageTimeout);

        // Close message if it was displayed
        if (closer) {
            setTimeout(() => closer(), 0);
        }
    }
}

// WAKING UP RENDER SERVER END


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

    // Close mobile menu when clicking or scrolling outside
    document.addEventListener('click', function(e) {
        if (!mainNavMobileMenu) return
        const isMenuOpen = mainNavMobileMenu.classList.contains('main-nav-mobile-open');
        if (isMenuOpen && !mainNavMobileMenu.contains(e.target) && !mainNavMobileBtn.contains(e.target)) {
            mainNavMobileBtn.classList.remove('main-nav-mobile-active');
            mainNavMobileMenu.classList.remove('main-nav-mobile-open');
        }
    });

    document.addEventListener('scroll', function() {
        if (!mainNavMobileMenu) return
        const isMenuOpen = mainNavMobileMenu.classList.contains('main-nav-mobile-open');
        if (isMenuOpen) {
            mainNavMobileBtn.classList.remove('main-nav-mobile-active');
            mainNavMobileMenu.classList.remove('main-nav-mobile-open');
        }
    }, true);
});

if (userData) {
    document.querySelector(".main-nav-log-in-btn")?.style.setProperty('display', 'none');
    document.querySelector(".main-nav-mobile-log-in-btn")?.style.setProperty('display', 'none');
    if (userData.accType === "teacher") {
        const augintiniaiLinkDesktop = document.querySelector('.main-nav-link[href="augintiniai.html"]');
        augintiniaiLinkDesktop?.style.setProperty('display', 'none');
        const augintiniaiLinkMobile = document.querySelector('.main-nav-mobile-link[href="augintiniai.html"]');
        augintiniaiLinkMobile?.style.setProperty('display', 'none');
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
    let previousPage = document.referrer.split('/').pop() || 'index.html';

    // Strip query params (fixes your issue)
    previousPage = previousPage.split('?')[0];

    const targetPages = ['index.html', 'uzduotys.html', 'klase.html'];

    if (targetPages.includes(previousPage)) {
        let url = previousPage;

        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}fromBack=true`;

        window.location.href = url;
    } else {
        window.location.href = 'index.html';
    }
}

