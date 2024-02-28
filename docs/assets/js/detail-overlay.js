
let clicked = false;

/**************************************************************************************************************/
/**********************************     Haltestellenauskunft     **********************************************/
/**************************************************************************************************************/

function calculateDelayInMinutes(date1, date2) {
    let delayMilliseconds = new Date(date2) - new Date(date1);

    if (delayMilliseconds === 0) {
        return `<span class="highlight--green">pünktlich</span>`;
    }

    let delayMiniutes = delayMilliseconds / 60000; // calculate in Miniutes

    if (delayMiniutes < 0) {
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

function getLinesHtml(lines) {
    if (lines.length === 0) {
        return "";
    }

    let markup = '';

    lines.forEach(line => {
        markup = markup.concat(`<li class="type--${line.type}">${line.line}</li>`);
    });

    return markup;
}

function getDeparturesHtml(depatures) {
    let markup = '';
  
    if (depatures.length === 0) {
        return `<div>Keine Abfahrten geplant</div>`;
    }
  
    depatures.forEach(departure => {
      let difference = calculateTimeDifferenceInMinutes(departure.realTimeDto);
      let delay = calculateDelayInMinutes(departure.realTimeDto, departure.scheduledTimeDto);
  
      markup = markup.concat(`
          <li>
              <div class="overlay__content-departures-info">
                  <span>${departure.lineName} ${departure.direction}</span>
                  <span>${difference}</span>
              </div>
              <div class="overlay__content-departures-detail-info">${departure.scheduledTime} Uhr ${delay}</div>
          </li>
      `);
    });
  
    return markup;
  }

function getRouteChangesHtml(routeChanges) {
    if (routeChanges.length === 0) {
        return "<div>Derzeit gibt es keine Umleitungen für diese Haltestelle.</div>";
    }

    let markup = '';

    routeChanges.forEach(route => {
        markup = markup.concat(`
            <li>
                <button class="overlay__content-detour-header">
                    <div>
                        <div class="overlay__content-detour-line">
                            ${route.line}
                            <span class="detour-line-type--${route.type}">${route.type}</span>
                        </div>
                        <div class="overlay__content-detour-short-info">${route.short}</div>
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
/**********************************           Overlay            **********************************************/
/**************************************************************************************************************/

function getOverlay(data) {
    let routeChangesMarkup = getRouteChangesHtml(data.routeChanges);
    let overlay = ``;

    if (data.lines.length === 0) {
        overlay = `
            <div class="overlay__header">
                <h2>${data.name}</h2>

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

            <button type="button" class="overlay__header-close-button">
            <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
            </button>
        </div>

        <div class="overlay__content">
            <div class="overlay__content-lines">
                <div class="tooltip__wrapper">
                    <h3>Linien</h3>
                    <div class="tooltip">
                        <button type="button" class="button tooltip__button">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.2 12H8.8V7.2H7.2V12ZM8 5.6C8.22667 5.6 8.4168 5.5232 8.5704 5.3696C8.724 5.216 8.80053 5.02613 8.8 4.8C8.8 4.57333 8.7232 4.38347 8.5696 4.2304C8.416 4.07733 8.22613 4.00053 8 4C7.77333 4 7.58347 4.0768 7.4304 4.2304C7.27733 4.384 7.20053 4.57387 7.2 4.8C7.2 5.02667 7.2768 5.2168 7.4304 5.3704C7.584 5.524 7.77387 5.60053 8 5.6ZM8 16C6.89333 16 5.85333 15.7899 4.88 15.3696C3.90667 14.9493 3.06 14.3795 2.34 13.66C1.62 12.94 1.05013 12.0933 0.6304 11.12C0.210667 10.1467 0.000533333 9.10667 0 8C0 6.89333 0.210133 5.85333 0.6304 4.88C1.05067 3.90667 1.62053 3.06 2.34 2.34C3.06 1.62 3.90667 1.05013 4.88 0.6304C5.85333 0.210667 6.89333 0.000533333 8 0C9.10667 0 10.1467 0.210133 11.12 0.6304C12.0933 1.05067 12.94 1.62053 13.66 2.34C14.38 3.06 14.9501 3.90667 15.3704 4.88C15.7907 5.85333 16.0005 6.89333 16 8C16 9.10667 15.7899 10.1467 15.3696 11.12C14.9493 12.0933 14.3795 12.94 13.66 13.66C12.94 14.38 12.0933 14.9501 11.12 15.3704C10.1467 15.7907 9.10667 16.0005 8 16ZM8 14.4C9.78667 14.4 11.3 13.78 12.54 12.54C13.78 11.3 14.4 9.78667 14.4 8C14.4 6.21333 13.78 4.7 12.54 3.46C11.3 2.22 9.78667 1.6 8 1.6C6.21333 1.6 4.7 2.22 3.46 3.46C2.22 4.7 1.6 6.21333 1.6 8C1.6 9.78667 2.22 11.3 3.46 12.54C4.7 13.78 6.21333 14.4 8 14.4Z"/>
                            </svg>
                        </button>
                        <div class="tooltip__content hidden">
                            <div class="type--tram">Tram</div>
                            <div class="type--bus">Bus</div>
                        </div>
                    </div>
                </div>

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

function handleOverlay(dataDepartures, box) {
    if (box.dataset.overlayinitialized === "false") {
        const stop = box.dataset.name;
        let overlay = box.nextElementSibling;
    
        let info = dataDepartures.data.dmDepartures.find(e => e.name.includes(stop));
    
    
        let overlayMarkup  = getOverlay(info);
        console.log(overlay)
    
        overlay.insertAdjacentHTML('afterbegin', overlayMarkup);
    
        // set event listeners
        let overlayCloseButton = overlay.querySelector('.overlay .overlay__header-close-button');
    
        overlayCloseButton.addEventListener('click', function() {
            box.nextElementSibling.classList.remove('open');
        });
    
        let accordionButtons = overlay.querySelectorAll('.overlay__content-detour-header');
    
        accordionButtons.forEach(button => {
            button.addEventListener('click', function() {
            button.nextElementSibling.classList.toggle('hide');
            button.classList.toggle('open');
            });
        });

        let tooltipButton = overlay.querySelector('.tooltip__button');

        tooltipButton.addEventListener('click', function(event) {
            tooltipButton.nextElementSibling.classList.toggle('hidden');
        });

        box.dataset.overlayinitialized = "true";
    }

    box.nextElementSibling.classList.add('open');
    clicked = false;
}

function initOverlay(box) {
    fetch('./data-detail.json')
    .then((response) => response.json())
    .then((json) => handleOverlay(json, box));
}


AFRAME.registerComponent('cursor-listener', {
    init: function() {
      var el = this.el;

      el.addEventListener('click', function(event) {
        if (!clicked) {
            clicked = true;
            initOverlay(el);
        }
      });
    }
});



