/**************************************************************************************************************/
/**********************************      Position of User        **********************************************/
/**************************************************************************************************************/

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistanceFromLatLon(latitude1, longitude1, latitude2, longitude2) {
  const earthRadius = 6371; // radius of the earth in km
  let degreeLatitude = deg2rad(latitude2 - latitude1);  // deg2rad below
  let degreeLongitude = deg2rad(longitude2 - longitude1); 
  let a = 
    Math.sin(degreeLatitude / 2) * Math.sin(degreeLatitude / 2) +
    Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) * 
    Math.sin(degreeLongitude / 2) * Math.sin(degreeLongitude / 2)
    ;
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let distance = earthRadius * c; // Distance in km
  distance = distance * 1000; // Distance in m

  return distance;
}

/**************************************************************************************************************/
/**********************************         Dark Mode            **********************************************/
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
/**********************************          Slider              **********************************************/
/**************************************************************************************************************/

function initTutorialSlider() {
  const stepSlider = new Swiper('.swiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
  
  let numberOfSlides = document.querySelector(".tutorial-slider__position .number-of-slides");
  let activeSlide = document.querySelector(".tutorial-slider__position .index");
  
  numberOfSlides.innerHTML = stepSlider.slides.length;

  stepSlider.on('slideChange', function() {
    let index = stepSlider.activeIndex + 1;
    activeSlide.innerHTML = index;
  });
}

/**************************************************************************************************************/
/**********************************  Location/Camera Permission  **********************************************/
/**************************************************************************************************************/

function checkLocationCameraPermission() {
  if ("geolocation" in navigator) {
    permissionLocation = true;
    let locationHint = document.querySelector('.tutorial-slider__permission-location');
    locationHint.classList.add('permission-granted');
    locationHint.querySelector('span').innerHTML = "Berechtigung für Standort aktiviert";
  } else {
    console.log('Geolocation not available');
  }

  /*
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      permissionCamera = true;
      let cameraHint = document.querySelector('.tutorial-slider__permission-camera');
      cameraHint.classList.add('permission-granted');
      cameraHint.querySelector('span').innerHTML = "Berechtigung für Kamera aktiviert";
    })
    .catch((err) => {
      if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
        console.log('Permission Camera not granted');
      }
  });*/
}

/**************************************************************************************************************/
/**********************************           Location           **********************************************/
/**************************************************************************************************************/

function success(pos) {
  const crd = pos.coords;
  const locationInfo = document.querySelector(".location-information");

  //locationInfo.innerHTML = "Accuracy: " + crd.accuracy + " <br> " + "Lng: " + crd.longitude + " " + "Lat: " + crd.latitude;

  /*
  console.log('____________________________________________');
  console.log('Latitude: ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('Accuracy :' + crd.accuracy);*/
}

function error(err) {
  console.error(`ERROR(${err.code}): ${err.message}`);
}

/**************************************************************************************************************/
/**********************************        AR Infoboxen          **********************************************/
/**************************************************************************************************************/

function getOverlayMarkUp(stopName, platform) {
  return `
    <div class="overlay">
      <div class="overlay__header">
        <h2>${stopName}</h2>
        <div class="overlay__header-platform">${platform.name}</div>

        <button type="button" class="overlay__header-close-button">
          <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
        </button>
      </div>

      <div class="overlay__content">
        <div class="overlay__content-lines">
          <h3>Linien</h3>
          <ul class="overlay__content-lines-wrapper">
            <li>1</li>
            <li>2</li>
            <li>4</li>
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
            <li>
              <div class="overlay__content-departures-info">
                <span>1 Leutewitz</span>
                <span>jetzt</span>
              </div>
              <div class="overlay__content-departures-detail-info">10.45 Uhr <span class="highlight--green">pünktlich</span></div>
            </li>

            <li>
              <div class="overlay__content-departures-info">
                <span>4 Radebeul West</span>
                <span>2 min</span>
              </div>
              <div class="overlay__content-departures-detail-info">10.47 Uhr <span class="highlight--green">pünktlich</span></div>
            </li>

            <li>
              <div class="overlay__content-departures-info">
                <span>2 Gorbitz</span>
                <span>5 min</span>
              </div>
              <div class="overlay__content-departures-detail-info">10.49 Uhr <span class="highlight--red">+ 1 min</span></div>
            </li>

            <li>
              <div class="overlay__content-departures-info">
                <span>1 Leutewitz</span>
                <span>12 min</span>
              </div>
              <div class="overlay__content-departures-detail-info">10.55 Uhr <span class="highlight--red">+ 2 min</span></div>
            </li>

            <li>
              <div class="overlay__content-departures-info">
                <span>4 Radebeul West</span>
                <span>12 min</span>
              </div>
              <div class="overlay__content-departures-detail-info">10.57 Uhr <span class="highlight--green">pünktlich</span></div>
            </li>
          </ul>
        </div>

        <div class="overlay__content-detour">
          <h3>Aktuelle Umleitungen</h3>
          <ul class="overlay__content-detour-wrapper">
            <li>
              <button class="overlay__content-detour-header">
                <div>
                  <div class="overlay__content-detour-line">4</div>
                  <div class="overlay__content-detour-type">verkürzte Linienführung</div>
                </div>

                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path  fill="none" d="M1 1L11 11L21 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div class="overlay__content-detour-content hide">
                <div>Verkürzte Strecke: Laubegast -Postplatz - Mickten - Forststraße - Radebeul Ost.</div>
                <div>Ersatzbusverkehr EV4: Forststraße - Radebeul West - Weinböhla</div>
              </div>
            </li>
            <li>
              <button class="overlay__content-detour-header">
                <div>
                  <div class="overlay__content-detour-line">2</div>
                  <div class="overlay__content-detour-type">verkürzte Linienführung</div>
                </div>

                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="none" d="M1 1L11 11L21 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="overlay__content-detour-content hide">
                <div>Verkürzte Strecke: Laubegast -Postplatz - Mickten - Forststraße - Radebeul Ost.</div>
                <div>Ersatzbusverkehr EV4: Forststraße - Radebeul West - Weinböhla</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
}

function createInfoBox(dataBoxes) {
  let stops = dataBoxes.data.dmDepartures;

  stops.forEach(stop => {
    const stopName = stop.name;
    const platforms = stop.platforms;

    platforms.forEach(platform => {
      const platformNumber = platform.name;
      const latitude = platform.lat;
      const longitude = platform.lng;

      // console.log(stopName + " " + platformNumber + " " + latitude + " " + longitude);

      const overlay = getOverlayMarkUp(stopName, platform);

      let scene = document.querySelector('a-scene');
      let box = `
        <a-entity
          raycaster="a-box: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;">
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
                text="width: 8; color: black;"
                font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
                position="0.5 -1.5 0"
              >
              </a-text>

              <a-text
                value="3 m entfernt"
                text="width: 8; color: black;"
                position="0.5 -2.2 0"
              >
              </a-text>

              <a-text
                value="1   Leutewitz"
                text="width: 8; color: black;"
                position="0.5 -3.2 0"
              >
              </a-text>

              <a-text
                value="4   Radebeul West"
                text="width: 8; color: black;"
                position="0.5 -3.7 0"
              >
              </a-text>

              <a-text
                value="2   Gorbitz"
                text="width: 8; color: black;"
                position="0.5 -4.2 0"
              >
              </a-text>

              <a-text
                value="jetzt"
                text="width: 8; color: black;"
                position="4 -3.2 0"
              >
              </a-text>

              <a-text
                value="2 min"
                text="width: 8; color: black;"
                position="4 -3.7 0"
              >
              </a-text>

              <a-text
                value="5 min"
                text="width: 8; color: black;"
                position="4 -4.2 0"
              >
              </a-text>
            </a-entity>

            <a-sphere position="0 0 0" color="#FDC300" radius="0.5"></a-sphere>

            <a-box
              color="white"
              position="0 2.5 -1"
              width="8"
              height="5"
              cursor-listener
            >
            </a-box>

            ${overlay}

          </a-entity>
        </a-entity>`

      scene.insertAdjacentHTML('beforeend', box);
    })
  })

  // add overlay button Listener

  let overlays = document.querySelectorAll('.overlay');

  overlays.forEach(overlay => {
    let closeButton = overlay.querySelector('.overlay__header-close-button');

    closeButton.addEventListener('click', function() {
      overlay.classList.remove('open');
    });
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
/**********************************            Main              **********************************************/
/**************************************************************************************************************/

let permissionLocation = false;
let permissionCamera = false;

window.addEventListener("DOMContentLoaded", (event) => {

  // Init
  checkLocationCameraPermission();

  fetch('./data.json')
  .then((response) => response.json())
  .then((json) => createInfoBox(json));

  checkTheme();


  // get needed elements
  let tutorialButton = document.querySelector('.button-tutorial');
  let searchButton = document.querySelector('.button-search');
  let modeButton = document.querySelector('.button-mode');
  let helpboxes = document.querySelectorAll('.help-box');
  let helpbox1 = document.querySelector('.help-box--step-1');


  // Set Event Listeners
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

  helpboxes.forEach(box => {
    let button = box.querySelector('button');
    console.log(button);

    button.addEventListener('click', function() {
      box.classList.add('hidden');

      if (box.classList.contains('help-box--step-1')) {
        setTimeout(() => {
          document.querySelector('.help-box--step-2').classList.remove('hidden');
        }, "10000");
      }
    })
  });



  setTimeout(() => {
    helpbox1.classList.remove('hidden');
  }, "5000");

  if ("geolocation" in navigator) {
    permissionLocation = true;

    navigator.geolocation.getCurrentPosition((position) => {
      let distance = getDistanceFromLatLon(position.coords.latitude, position.coords.longitude, 51.034958, 13.80067);
      // console.log('Distanz: ' + distance);
    });
  } else {
    console.log('Geolocation not available');
  }

  initTutorialSlider();

  options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
});

