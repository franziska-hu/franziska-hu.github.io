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

function calculateDelayInMinutes(date1, date2) {
    let delayMilliseconds = new Date(date2) - new Date(date1);

    if (delayMilliseconds === 0) {
        return `<span class="highlight--green">pünktlich</span>`;
    }

    let delayMiniutes = delayMilliseconds / 60000; // calculate in Miniutes

    if (delayMiniutes > 0) {
        return `<span class="highlight--red">+ ${delayMiniutes} min</span>`;
    }
    
    return `<span class="highlight--blue">${delayMiniutes} min</span>`
}

function calculateTimeDifferenceInMinutes(time) {
    let simulatedTime = "2024-02-01T10:20:00.000+01:00"
    let differenceMilliseconds = new Date(time) - new Date(simulatedTime);
    let differenceMiniutes = differenceMilliseconds / 60000;
    
    if (differenceMiniutes === 0) {
        return "jetzt";
    }

    return differenceMiniutes + " min";
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

function getDeparturesHtml(depatures, detailed = false) {
    let markup = '';

    if (depatures.length === 1 && depatures.lineName === undefined) {
        return `<div>Keine Abfahrten geplant</div>`;
    }

    depatures.forEach(departure => {
        let difference = calculateTimeDifferenceInMinutes(departure.realTimeDto);
        let delay = calculateDelayInMinutes(departure.realTimeDto, departure.scheduledTimeDto);

        if (detailed) {

            markup = markup.concat(`
                <li>
                    <div class="overlay__content-departures-info">
                        <span>${departure.lineName} ${departure.direction}</span>
                        <span>${difference}</span>
                    </div>
                    <div class="overlay__content-departures-detail-info">${departure.scheduledTime} ${delay}</div>
                </li>
            `);
        } else {
            markup = markup.concat(`
                <li>
                    <div>${departure.lineName} ${departure.direction}</div>
                    <div>${difference}</div>
                </li>
            `);
        }
    });

    return markup;
}

function getLinesHtml(lines) {
    if (lines.length === 1 && lines[0].line === undefined) {
        return "";
    }

    let markup = '';

    lines.forEach(line => {
        markup = markup.concat(`<li class="type--${line.type}">${line.line}</li>`);
    });

    return markup;
}

function getRouteChangesHtml(routeChanges) {
    if (routeChanges.length === 1 && routeChanges[0].line === undefined) {
        return "<div>Derzeit gibt es keine Umleitungen für diese Haltestelle.</div>";
    }

    let markup = '';

    routeChanges.forEach(route => {
        markup = markup.concat(`
            <li>
                <button class="overlay__content-detour-header">
                    <div>
                    <div class="overlay__content-detour-line">${route.line}</div>
                    <div class="overlay__content-detour-type">${route.type}</div>
                    </div>

                    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path  fill="none" d="M1 1L11 11L21 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <div class="overlay__content-detour-content hide">
                    ${route.description}
                </div>
            </li>
        `);
    });

    return markup;
}

/**************************************************************************************************************/
/**********************************        Overlay Details       **********************************************/
/**************************************************************************************************************/

function getOverlay(data) {
    let routeChangesMarkup = getRouteChangesHtml(data.routeChanges);
    let overlay = ``;

    if (data.lines.length === 1 && data.lines[0].line === undefined) {
        overlay = `
            <div class="overlay__header">
                <h2>${data.name}</h2>
                <div class="overlay__header-platform">${data.platform}</div>

                <button type="button" class="overlay__header-close-button">
                <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                </button>
            </div>

            <div class="overlay__content">
                <div class="overlay__warning">Diese Haltestelle wird momentan nicht bedient.</div>

                <div class="overlay__content-detour">
                    <h3>Aktuelle Umleitungen</h3>
                    <ul class="overlay__content-detour-wrapper">
                        ${routeChangesMarkup}
                    </ul>
                </div>
            </div>
        `
        return overlay;
    }

    let lineMarkup = getLinesHtml(data.lines);
    let departureMarkup = getDeparturesHtml(data.departures, true);

    overlay = `
        <div class="overlay__header">
            <h2>${data.name}</h2>
            <div class="overlay__header-platform">${data.platform}</div>

            <button type="button" class="overlay__header-close-button">
            <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
            </button>
        </div>

        <div class="overlay__content">
            <div class="overlay__content-lines">
                <h3>Linien</h3>
                <ul class="overlay__content-lines-wrapper">
                    ${lineMarkup}
                </ul>
                </div>

                <div class="overlay__content-departures">
                    <div class="overlay_content-depatures-header">
                        <h3>Abfahrten</h3>
                        <div class="live-hint">
                        Live
                        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.53225 12.622L3.42075 13.7507C1.3275 12.1 0 9.691 0 7C0 4.309 1.3275 1.9 3.42075 0.25L4.53225 1.378C2.78775 2.75425 1.67925 4.762 1.67925 7C1.67925 9.238 2.78775 11.2458 4.53225 12.622ZM5.0385 7C5.0385 5.65675 5.70375 4.45225 6.75 3.6265L5.63925 2.5C4.24425 3.60025 3.35925 5.206 3.35925 7C3.35925 8.794 4.24425 10.3997 5.63925 11.5L6.75 10.3735C5.703 9.54775 5.0385 8.34325 5.0385 7ZM16.3207 7C16.3207 4.762 15.2123 2.75425 13.4678 1.378L14.5792 0.25C16.6725 1.9 18 4.309 18 7C18 9.691 16.6725 12.1 14.5792 13.7507L13.4678 12.622C15.2123 11.2458 16.3207 9.238 16.3207 7ZM11.25 10.3735L12.3608 11.5C13.7558 10.3997 14.6407 8.794 14.6407 7C14.6407 5.206 13.7558 3.60025 12.3608 2.5L11.25 3.6265C12.297 4.45225 12.9615 5.65675 12.9615 7C12.9615 8.34325 12.297 9.54775 11.25 10.3735ZM9 4.75C7.758 4.75 6.75 5.75725 6.75 7C6.75 8.24275 7.758 9.25 9 9.25C10.242 9.25 11.25 8.24275 11.25 7C11.25 5.75725 10.242 4.75 9 4.75Z" fill="white"/>
                        </svg>  
                    </div>
                </div>

                <ul class="overlay__content-departures-wrapper">
                    ${departureMarkup}
                </ul>
            </div>

            <div class="overlay__content-detour">
            <h3>Aktuelle Umleitungen</h3>
            <ul class="overlay__content-detour-wrapper">
                ${routeChangesMarkup}
            </ul>
            </div>
        </div>
    `
    return overlay;
}

function createOverlay(dataDepartures) {
    const stop = getSearchedStop();
    let overlay = document.querySelector('.overlay');

    let info = dataDepartures.data.dmDepartures.find(e => e.name.includes(stop));
    let overlayMarkup  = getOverlay(info);

    overlay.insertAdjacentHTML('afterbegin', overlayMarkup);

      
    // set event listeners
    let overlayCloseButton = document.querySelector('.overlay .overlay__header-close-button');

    overlayCloseButton.addEventListener('click', function() {
        document.querySelector('.overlay').classList.remove('open');
    });

    let accordionButtons = document.querySelectorAll('.overlay__content-detour-header');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
        button.nextElementSibling.classList.toggle('hide');
        button.classList.toggle('open');
        });
    });
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
    
    let depaturesMarkup = getDeparturesHtml(stopInfo.departures);

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

            <div class="button__wrapper">
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
        document.querySelector('.overlay').classList.add('open');
    });

    intervalId = setInterval(calculateDistance, 10000);

    setTimeout(() => {
        calculateDistance();
    }, 1000);
}

/**************************************************************************************************************/
/**********************************             main             **********************************************/
/**************************************************************************************************************/

let intervalId;

window.addEventListener("DOMContentLoaded", (event) => {
    // Init
    checkTheme();

    fetch('./search-response.json')
    .then((response) => response.json())
    .then((json) => createInfoBox(json));

    fetch('./search-detail-response.json')
    .then((response) => response.json())
    .then((json) => createOverlay(json));
});

window.addEventListener("beforeunload", (event) => {
    clearInterval(intervalId);
});
