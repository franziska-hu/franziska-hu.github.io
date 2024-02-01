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

  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      console.log(stream);
      permissionCamera = true;
      let cameraHint = document.querySelector('.tutorial-slider__permission-camera');
      cameraHint.classList.add('permission-granted');
      cameraHint.querySelector('span').innerHTML = "Berechtigung für Kamera aktiviert";
    })
    .catch((err) => {
      if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
        console.log('Permission Camera not granted');
      }
  });
}

/**************************************************************************************************************/
/**********************************           Location           **********************************************/
/**************************************************************************************************************/

function success(pos) {
  const crd = pos.coords;
  const locationInfo = document.querySelector(".location-information");

  locationInfo.innerHTML = "Accuracy: " + crd.accuracy;

  console.log('____________________________________________');
  console.log('Latitude: ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('Accuracy :' + crd.accuracy);
}

function error(err) {
  console.error(`ERROR(${err.code}): ${err.message}`);
}


/**************************************************************************************************************/
/**********************************            Main              **********************************************/
/**************************************************************************************************************/

let permissionLocation = false;
let permissionCamera = false;

window.addEventListener("DOMContentLoaded", (event) => {

  checkLocationCameraPermission();

  let overlays = document.querySelectorAll('.overlay');

  overlays.forEach(overlay => {
    let closeButton = overlay.querySelector('.overlay__header-close-button');

    closeButton.addEventListener('click', function() {
      overlay.classList.remove('open');
    });
  });

  checkTheme();

  let toggleButtonDarkMode = document.querySelector('.darkmode-toggle');

  if (localStorage.getItem("theme") === "dark") {
    toggleButtonDarkMode.checked = true;
  } else {
    toggleButtonDarkMode.checked = false;
  }

  toggleButtonDarkMode.addEventListener('click', function(event) {
    if (event.target.checked === true) {
      switchTheme("dark");
    } else {
      switchTheme("light");
    }
  });

  let tutorialButton = document.querySelector('.button-tutorial');

  tutorialButton.addEventListener('click', function() {
      document.querySelector('.overlay--tutorial').classList.add('open');
  });

  if ("geolocation" in navigator) {
    permissionLocation = true;

    navigator.geolocation.getCurrentPosition((position) => {
      console.log('Latitude: ' + position.coords.latitude);
      console.log('Longitude: ' + position.coords.longitude);
      let distance = getDistanceFromLatLon(position.coords.latitude, position.coords.longitude, 51.034958, 13.80067);
      console.log(distance);
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

  // let location = navigator.geolocation.watchPosition(success, error, options);

  console.log(location);
});

/**************************************************************************************************************/
/**********************************        AR Infoboxen          **********************************************/
/**************************************************************************************************************/

function createInfoBox(dataBoxes) {
  let stops = dataBoxes.data.dmDepartures;

  stops.forEach(stop => {
    console.log(stop);
    const stopName = stop.name;
    const platforms = stop.platforms;

    platforms.forEach(platform => {
      const platformNumber = platform.name;
      const latitude = platform.lat;
      const longitude = platform.lng;

      console.log(stopName + " " + platformNumber + " " + latitude + " " + longitude);

      let scene = document.querySelector('a-scene');
      let box = `
        <a-entity
          raycaster="a-box: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;">
          <a-text
            value="${stopName}"
            text="align: right; width: 3; color: black;"
            font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
            look-at="[user-camera]"
            scale="2 2 2"
            gps-new-entity-place="latitude: ${latitude}; longitude: ${longitude}"
          >
            <a-text
              value="${platformNumber}"
              text="width: 3; color: black;"
              font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
              position="-1.1 -0.2 0"
            >
            </a-text>

            <a-text
              value="3 m entfernt"
              text="width: 2.5; color: black;"
              position="-1.1 -0.4 0"
            >
            </a-text>

            <a-text
              value="1   Leutewitz"
              text="width: 2.5; color: black;"
              position="-1.1 -0.7 0"
            >
            </a-text>

            <a-text
              value="4   Radebeul West"
              text="width: 2.5; color: black;"
              position="-1.1 -0.9 0"
            >
            </a-text>

            <a-text
              value="2   Gorbitz"
              text="width: 2.5; color: black;"
              position="-1.1 -1.1 0"
            >
            </a-text>

            <a-text
              value="jetzt"
              text="width: 2.5; color: black;"
              position="0.5 -0.7 0"
            >
            </a-text>

            <a-text
              value="2 min"
              text="width: 2.5; color: black;"
              position="0.5 -0.9 0"
            >
            </a-text>

            <a-text
              value="5 min"
              text="width: 2.5; color: black;"
              position="0.5 -1.1 0"
            >
            </a-text>

            <a-box
              color="#FFF"
              transparent="true"
              opacity="0.9"
              position="0 -0.7 -1"
              width="2.6"
              height="2"
              cursor-listener
            >
            </a-box>

          </a-text>
        </a-entity>`

      scene.insertAdjacentHTML('beforeend', box);
    })
  })
}

fetch('./data.json')
    .then((response) => response.json())
    .then((json) => createInfoBox(json));
