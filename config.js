let selectIpClient = document.querySelector("#showIpClient");
let selectCountryClient = document.querySelector("#showCountryClient");
let selectOrgClient = document.querySelector("#showOrgClient");
let selectTimeZoneClient = document.querySelector("#showTimeZoneClient");
let selectLongClient = document.querySelector("#showGPSLongClient");
let selectLatdClient = document.querySelector("#showGPSLatdClient");

let tokenMap =
  "API_KEY_LOGIN";

axios
  .get("https://api.ipify.org/")
  .then(function (response) {
    let ipPublicClient = response.data;
    selectIpClient.innerHTML = ipPublicClient;
    showDataClient(ipPublicClient);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });

// Localization GPS

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  var crd = pos.coords;
  const datLatitude = crd.latitude;
  const datLongitude = crd.longitude;

  selectLongClient.innerHTML = `Longitud: ${datLatitude}`;
  selectLatdClient.innerHTML = `Latitud: ${datLongitude}`;
    mapClientPosition(datLatitude, datLongitude)
}

function error(err) {
  console.warn("ERROR(" + err.code + "): " + err.message);
}

navigator.geolocation.getCurrentPosition(success, error, options);

// Configuration Map Javascript Mapbox

// Functions
function showDataClient(ip) {
  axios
    .get(`http://ip-api.com/json/${ip}`)
    .then(function (response) {
      dataJsonClient = response.data;
      console.log(dataJsonClient);
      selectCountryClient.innerHTML = `Pais: ${dataJsonClient.country}`;
      selectOrgClient.innerHTML = `Organización: ${dataJsonClient.org}`;
      selectTimeZoneClient.innerHTML = `Zona Horaria: ${dataJsonClient.timezone}`;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function mapClientPosition(ltd, logt) {
  mapboxgl.accessToken = tokenMap;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    center: [logt, ltd],
    zoom: 16
  });

  const size = 140;

  // This implements `StyleImageInterface`
  // to draw a pulsing dot icon on the map.
  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    // Call once before every frame where the icon will be used.
    render: function () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      // Draw the outer circle.
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
      context.fill();

      // Draw the inner circle.
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 100, 100, 1)";
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // Update this image's data with data from the canvas.
      this.data = context.getImageData(0, 0, this.width, this.height).data;

      // Continuously repaint the map, resulting
      // in the smooth animation of the dot.
      map.triggerRepaint();

      // Return `true` to let the map know that the image was updated.
      return true;
    },
  };

  map.on("load", () => {
    map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

    map.addSource("dot-point", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [logt, ltd], // icon position [lng, lat]
            },
          },
        ],
      },
    });
    map.addLayer({
      id: "layer-with-pulsing-dot",
      type: "symbol",
      source: "dot-point",
      layout: {
        "icon-image": "pulsing-dot",
      },
    });
  });
}
