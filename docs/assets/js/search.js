function switchTheme(theme) {
    document.querySelector('html').setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    let infoboxes = document.querySelectorAll("a-box");

    if (theme === 'dark') {
        infoboxes.forEach(box => {
        box.setAttribute('color', '#2D2D2D');
        });
    } else {
        infoboxes.forEach(box => {
        box.setAttribute('color', '#fff');
        });
    }
}
  
function checkTheme() {
    const localStorageTheme = localStorage.getItem("theme");
    const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

    if (localStorageTheme !== null) {
        switchTheme(localStorageTheme);
        return;
    }

    if (systemSettingDark.matches) {
        switchTheme("dark");
        return;
    }

    switchTheme("light");
}

const params = new URLSearchParams(window.location.search);
const stop = params.get('stop');

window.addEventListener("DOMContentLoaded", (event) => {
    // Init
    checkTheme();
  
    // get needed elements
    let accordionButton = document.querySelector('.stop-information-box__header');
    let detailButton = document.querySelector('.detail-button');
    let overlayCloseButton = document.querySelector('.overlay .overlay__header-close-button');
  
    // Set Event Listeners
    accordionButton.addEventListener('click', function() {
        accordionButton.nextElementSibling.classList.toggle('hide');
        accordionButton.classList.toggle('open');
    });

    detailButton.addEventListener('click', function() {
        document.querySelector('.overlay').classList.add('open');
    });

    overlayCloseButton.addEventListener('click', function() {
        document.querySelector('.overlay').classList.remove('open');
    });


  });