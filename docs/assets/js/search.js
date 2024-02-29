/**************************************************************************************************************/
/**********************************         Permissions          **********************************************/
/**************************************************************************************************************/
/*
*  wait for permission event (trigger in ar.js) and check camera and location permission
*/

window.addEventListener('checkPermissions', event => {
    let cameraPermissionState = localStorage.getItem("cameraPermission");
    let locationPermissionState = localStorage.getItem("gpsPermission");
  
    if (cameraPermissionState === "denied") {
        document.querySelectorAll(".permission-box--camera").forEach(box => {
            box.classList.add("permission-denied");
            box.querySelector('span').innerHTML = 'Berechtigung für Kamera wird benötigt';
        });
    }
  
    if (locationPermissionState === "denied") {
        document.querySelectorAll(".permission-box--location").forEach(box => {
            box.classList.add("permission-denied");
            box.querySelector('span').innerHTML = 'Berechtigung für Standort wird benötigt';
        });
    }
  
    if (cameraPermissionState === "denied" || locationPermissionState === "denied") {
        document.querySelector(".warning-box").classList.remove("hidden");
    } else {
        document.querySelector(".overlay--permission-warning").classList.remove("open");
    }
  });

/**************************************************************************************************************/
/**********************************         Theme Mode           **********************************************/
/**************************************************************************************************************/

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

/**************************************************************************************************************/
/**********************************     Haltestellenauskunft     **********************************************/
/**************************************************************************************************************/

function getSearchedStop() {
    const params = new URLSearchParams(window.location.search);
    return params.get('stop');
}

let originalDistance;
let initialized = false;

function calculateDistance() {
    let pin = document.querySelector('a-sphere');
    let wrapper = document.querySelector('.pin-distance--wrapper');

    if (pin.components === undefined || pin.components['gps-new-entity-place'].distance === undefined) {
        wrapper.classList.add('hide');
        return;
    }

    let distance = pin.components['gps-new-entity-place'].distance;
    let displayDistance = document.querySelector('.pin-distance');

    displayDistance.innerHTML = Math.round(distance);
    wrapper.classList.remove('hide');

    if (Math.abs(originalDistance - distance) < 20 && initialized) return;
    initialized = true;
    originalDistance = distance;

    let scalingFactor = distance * 0.1;

    pin.setAttribute('scale', scalingFactor + " " + scalingFactor + " " + scalingFactor);
}

function calculateTimeDifference(time) {
    let simulatedTime = "2024-02-01T10:20:00.000+01:00"
    let differenceMilliseconds = new Date(time) - new Date(simulatedTime);
    let differenceMiniutes = differenceMilliseconds / 60000;
    
    if (differenceMiniutes === 0) {
        return "jetzt";
    }

    return differenceMiniutes + " min";
}

function getBoxDepartureHtml(depatures, detailed = false) {
    let markup = '';

    if (depatures.length === 0) {
        return `<div>Keine Abfahrten geplant</div>`;
    }

    depatures.forEach(departure => {
        let difference = calculateTimeDifference(departure.realTimeDto);

        markup = markup.concat(`
            <li>
                <div>${departure.lineName} ${departure.direction}</div>
                <div>${difference}</div>
            </li>
        `);
    });

    return markup;
}

/**************************************************************************************************************/
/**********************************            Infobox           **********************************************/
/**************************************************************************************************************/

function createInfoBox(dataBox) {
    const stop = getSearchedStop();
    let scene = document.querySelector('a-scene');
    let infobox = document.querySelector('.stop-information-box');
    
    let stopInfo = dataBox.data.dmDepartures.find(e => e.name.includes(stop));

    let pinMarkup = `
        <a-sphere gps-new-entity-place="latitude: ${stopInfo.lat}; longitude: ${stopInfo.lng}" color="#CC4747" radius="1"></a-sphere>
    `

    scene.insertAdjacentHTML('beforeend', pinMarkup);
    
    let depaturesMarkup = getBoxDepartureHtml(stopInfo.departures);

    let boxMarkup = `
        <button class="stop-information-box__header">
            <div>
                <h2>${stopInfo.name}</h2>
                <div class="pin-distance--wrapper">Du bist <span class="pin-distance">x</span> m entfernt</div>
            </div>

            <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path  fill="none" d="M1 1L11 11L21 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>

        <div class="stop-information-box__content hide">
            <ul class="stop-information-box__departures">
                ${depaturesMarkup}
            </ul>

            <div class="detail-button__wrapper">
                <button class="button detail-button" type="button">mehr Details</button>
            </div>
        </div>
    `

    infobox.insertAdjacentHTML('afterbegin', boxMarkup);

    let accordionButton = document.querySelector('.stop-information-box__header');
    let detailButton = document.querySelector('.detail-button');

    accordionButton.addEventListener('click', function() {
        accordionButton.nextElementSibling.classList.toggle('hide');
        accordionButton.classList.toggle('open');
    });

    detailButton.addEventListener('click', function() {
        document.querySelector('.overlay--detail').classList.add('open');
    });

    intervalId = setInterval(calculateDistance, 3000);

    setTimeout(() => {
        calculateDistance();
    }, 1000);
}

/**************************************************************************************************************/
/**********************************             Main             **********************************************/
/**************************************************************************************************************/

let intervalId;

window.addEventListener("DOMContentLoaded", () => {
    // Init
    checkTheme();

    fetch('./search-response.json')
    .then((response) => response.json())
    .then((json) => createInfoBox(json));

    let warningOverlay = document.querySelector('.overlay--permission-warning');
    let warningOverlayCloseButton = warningOverlay.querySelector('.button');

    warningOverlayCloseButton.addEventListener('click', function() {
        warningOverlay.classList.remove('open');
    });
});

window.addEventListener("beforeunload", () => {
    clearInterval(intervalId);
});
