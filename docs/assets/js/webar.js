let intervalId;

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
/**********************************         Dark Mode            **********************************************/
/**************************************************************************************************************/

/**
 * Switch to light or dark theme
 * @param {string} theme 
 */
function switchTheme(theme) {
  document.querySelector('html').setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  let infoboxes = document.querySelectorAll("a-box");
  let textElements = document.querySelectorAll("a-text");

  if (theme === 'dark') {
    infoboxes.forEach(box => {
      box.setAttribute('color', '#2D2D2D');
    });

    textElements.forEach(text => {
      text.setAttribute('text', 'color', '#fff')
    });
  } else {
    infoboxes.forEach(box => {
      box.setAttribute('color', '#fff');
    });


    textElements.forEach(text => {
      text.setAttribute('text', 'color', '#2D2D2D')
    });
  }
}

/**
 * Check if theme is already set from last session otherwise match system preference
 * 
 */
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
/**********************************          Slider              **********************************************/
/**************************************************************************************************************/

/**
 * Initialise Information Slider
 */
function initTutorialSlider() {
  const stepSlider = new Swiper('.swiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
  
  let numberOfSlides = document.querySelector(".tutorial-slider__position .number-of-slides");
  let activeSlide = document.querySelector(".tutorial-slider__position .index");
  
  numberOfSlides.innerHTML = document.querySelectorAll('.tutorial-slider .slide-item').length;

  stepSlider.on('slideChange', function() {
    let index = stepSlider.activeIndex + 1;
    activeSlide.innerHTML = index;
  });
}

/**************************************************************************************************************/
/**********************************      Distance to stops       **********************************************/
/**************************************************************************************************************/

/**
 * Get distance to entity from AR scene and display distance if object less then 200m far. Scale object up, if more then 20m away.
 * @param {Node} object 
 */
function calculateDistance(object) {
  if (object.components === undefined) return;

  const maxDistance = 200; // in meter
  const minDistanceForScaling = 20; // in meter
  let distance = object.components['gps-new-entity-place'].distance; // distance attribute set by ar.js

  if (distance > maxDistance) return;

  let displayDistance = object.querySelector('.object-distance');
  displayDistance.setAttribute('value', Math.round(distance) + " m entfernt");

  if (distance < minDistanceForScaling) return;

  let scalingFactor = distance * 0.05;
  object.setAttribute('scale', {x: scalingFactor, y: scalingFactor, z: 1});
}



/**************************************************************************************************************/
/**********************************     Haltestellenauskunft     **********************************************/
/**************************************************************************************************************/

function calculateTimeDifferenceInMinutes(time) {
  let simulatedTime = "2024-02-01T10:20:00.000+01:00"
  let differenceMilliseconds = new Date(time) - new Date(simulatedTime);
  let differenceMiniutes = differenceMilliseconds / 60000;
  
  if (differenceMiniutes === 0) {
      return "jetzt";
  }

  return differenceMiniutes + " min";
}

/**
 * Update departure display
 */
function updateDepartures(dataDepartures) {
  
  let boxes = document.querySelectorAll('.stop-info-box');
  let stops = dataDepartures.data.dmDepartures;

  boxes.forEach(box => {
    const stop = box.dataset.name;
    let info = stops.find(e => e.name.includes(stop));
    let departures = box.querySelectorAll('.departure-time');

    departures.forEach((departure, index) => {
      departure.setAttribute('value', calculateTimeDifferenceInMinutes(info.departures[index].realTimeDto));
    });
  });

}

/**
 * Update departure and distance indicator for each gps entity
 */
function updateBoxDisplay() {
  let objects = document.querySelectorAll('a-entity[gps-new-entity-place]');

  objects.forEach(object => {
    calculateDistance(object);
  });

  fetch('./data-detail.json')
  .then((response) => response.json())
  .then((json) => updateDepartures(json));

}

/**
 * Get markup for displaying next departures
 * @param {Array} depatures 
 * @returns {string} markup for departures
 */
function getBoxesForDeparture(depatures) {
  if (depatures.length === 0) {
    return `
      <a-text
        value="Keine Abfahrten geplant."
        text="width: 8; color: black;"
        position="0.5 -3.2 0"
      >
      </a-text>
    `
  }

  let markup = `
    <a-text
      value="${depatures[0].lineName}   ${depatures[0].direction}"
      text="width: 8; color: black;"
      position="0.5 -3.2 0"
    >
    </a-text>

    <a-text
      class="departure-time"
      value="-"
      text="width: 8; color: black;"
      position="6 -3.2 0"
    >
    </a-text>

    <a-text
      value="${depatures[1].lineName}   ${depatures[1].direction}"
      text="width: 8; color: black;"
      position="0.5 -3.7 0"
    >
    </a-text>

    <a-text
      class="departure-time"
      value="-"
      text="width: 8; color: black;"
      position="6 -3.7 0"
    >
    </a-text>

    <a-text
      value="${depatures[2].lineName}   ${depatures[2].direction}"
      text="width: 8; color: black;"
      position="0.5 -4.2 0"
    >
    </a-text>

    <a-text
      class="departure-time"
      value="-"
      text="width: 8; color: black;"
      position="6 -4.2 0"
    >
    </a-text>
  `

  return markup;
}

/**
 * Get markup for visiting lines
 * @param {Array} lines 
 * @returns markup for lines
 */
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

/**************************************************************************************************************/
/**********************************        Infobox          ********************************************/
/**************************************************************************************************************/

/**
 * Create and insert info boxes for stops
 * @param {Object} dataBoxes 
 */
function createInfoBox(dataBoxes) {
  let stops = dataBoxes.data.dmDepartures;

  stops.forEach(stop => {
    const stopName = stop.name;
    const platforms = stop.platforms;

    platforms.forEach(platform => {
      const platformNumber = platform.name;
      const latitude = platform.lat;
      const longitude = platform.lng;

      let depatureMarkup = getBoxesForDeparture(platform.departures);

      let scene = document.querySelector('a-scene');
      let box = `
        <a-entity
          class="stop-info-box"
          raycaster="a-box: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;"
          data-name="${stopName} ${platformNumber}">
          <a-entity
            look-at="[user-camera]"
            gps-new-entity-place="latitude: ${latitude}; longitude: ${longitude}"
          >
            <a-entity position="-4 5 1">
              <a-text
                value="${stopName}"
                text="align: right; width: 10; color: black;"
                font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
                position="5 -0.8 0"
              >
              </a-text>
              
              <a-text
                value="${platformNumber}"
                text="width: 10; color: black;"
                font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
                position="0.5 -1.5 0"
              >
              </a-text>

              <a-text
                class="object-distance"
                value=""
                text="width: 8; color: black;"
                position="0.5 -2.2 0"
              >
              </a-text>

              ${depatureMarkup}

            </a-entity>

            <a-sphere position="0 0 0" color="#FDC300" radius="0.5"></a-sphere>

            <a-box
              color="white"
              position="0 2.5 -1"
              width="8"
              height="5"
              data-name="${stopName} ${platformNumber}"
              data-overlayinitialized="false"
              cursor-listener
            >
            </a-box>

            <div class="overlay">
            </div>

          </a-entity>
        </a-entity>`

      scene.insertAdjacentHTML('beforeend', box);
    })
  })

  intervalId = setInterval(updateBoxDisplay, 10000);

  setTimeout(() => {
    updateBoxDisplay();
  }, 1000);
}

/**************************************************************************************************************/
/**********************************            Main              **********************************************/
/**************************************************************************************************************/

window.addEventListener("DOMContentLoaded", (event) => {
  // get data for info boxes at stops and create them
  fetch('./data.json')
  .then((response) => response.json())
  .then((json) => createInfoBox(json));

  checkTheme();
  initTutorialSlider();

  // get needed elements
  let tutorialButton = document.querySelector('.button--tutorial');
  let searchButton = document.querySelector('.button--search');
  let modeButton = document.querySelector('.button--mode');
  let helpboxes = document.querySelectorAll('.help-box');
  let helpbox1 = document.querySelector('.help-box--step-1');
  let overlays = document.querySelectorAll('.overlay');

  // set Event Listeners
  tutorialButton.addEventListener('click', function() {
    document.querySelector('.overlay--tutorial').classList.add('open');
  });

  searchButton.addEventListener('click', function() {
    document.querySelector('.overlay--search').classList.add('open');
  });

  modeButton.addEventListener('click', function(event) {
    let currentTheme = document.querySelector('html').getAttribute('data-theme');

    if (currentTheme === 'dark') {
      switchTheme("light");
    } else {
      switchTheme("dark");
    }
  });

  overlays.forEach(overlay => {
    let closeButton = overlay.querySelector('.overlay__header-close-button');

    closeButton.addEventListener('click', (event) => {
      overlay.classList.remove('open');
    })
  })

  helpboxes.forEach(box => {
    let checkButton = box.querySelector('button');

    checkButton.addEventListener('click', function() {
      box.classList.add('hidden');

      // show second helpbox if first help box checked by user
      if (box.classList.contains('help-box--step-1')) {
        setTimeout(() => {
          document.querySelector('.help-box--step-2').classList.remove('hidden');
        }, "10000");
      }
    })
  });

  // show first helpbox after 10 seconds
  setTimeout(() => {
    helpbox1.classList.remove('hidden');
  }, "10000");

});

// Clean up
window.addEventListener("beforeunload", (event) => {
  clearInterval(intervalId);
});

