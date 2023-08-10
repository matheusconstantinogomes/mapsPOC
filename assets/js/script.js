document.addEventListener("DOMContentLoaded", function () {
    const getLocationBtn = document.getElementById("getLocationBtn");
    const coordinatesOutput = document.getElementById("coordinatesOutput");
    const mapContainer = document.getElementById("mapContainer");
    const savedLocationOutput = document.getElementById("savedLocationOutput");

    getLocationBtn.addEventListener("click", getUserLocation);

    let map;
    let marker;
    let geocoder;
    let savedLocation;

    async function getUserLocation() {
        if ("geolocation" in navigator) {
            const geolocationOptions = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            };

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
                });

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const apiKey = "YOUR_GEOLOCATION_API";
                const geolocationUrl = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

                const geolocationResponse = await fetch(geolocationUrl, {
                    method: "POST",
                });
                const geolocationData = await geolocationResponse.json();

                const geocoder = new google.maps.Geocoder();
                const latlng = new google.maps.LatLng(latitude, longitude);

                geocoder.geocode({ location: latlng }, async function (results, status) {
                    if (status === "OK" && results[0]) {
                        const address = results[0].formatted_address;

                        coordinatesOutput.innerHTML = `
                            <p><strong>Coordenadas:</strong></p>
                            <p>Latitude: ${latitude.toFixed(6)}</p>
                            <p>Longitude: ${longitude.toFixed(6)}</p>
                            <hr>
                            <p><strong>Endereço:</strong></p>
                            <p>${address}</p>
                        `;

                        initMap(latitude, longitude);

                        savedLocation = {
                            latitude: latitude,
                            longitude: longitude,
                            address: address,
                        };
                    } else {
                        console.error("Erro ao obter detalhes de endereço: ", status);
                    }
                });
            } catch (error) {
                console.error("Erro ao obter localização: ", error);
            }
        } else {
            alert("Geolocalização não suportada no seu navegador.");
        }
    }

    function initMap(latitude, longitude) {
        const mapOptions = {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
        };

        map = new google.maps.Map(mapContainer, mapOptions);

        if (marker) {
            marker.setMap(null);
            marker = null;
        }

        marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            draggable: true,
        });

        marker.addListener("dragend", function () {
            const newLatLng = marker.getPosition();
            updateLocation(newLatLng.lat(), newLatLng.lng());
        });
    }

    function updateLocation(newLat, newLng) {
        marker.setPosition({ lat: newLat, lng: newLng });

        const newLatLng = new google.maps.LatLng(newLat, newLng);
        geocoder.geocode({ location: newLatLng }, function (results, status) {
            if (status === "OK" && results[0]) {
                const newAddress = results[0].formatted_address;
                updateExtrato(newLat, newLng, newAddress);
            }
        });
    }

    function updateExtrato(latitude, longitude, address) {
        coordinatesOutput.innerHTML = `
            <p><strong>Coordenadas:</strong></p>
            <p>Latitude: ${latitude.toFixed(6)}</p>
            <p>Longitude: ${longitude.toFixed(6)}</p>
            <hr>
            <p><strong>Endereço:</strong></p>
            <p>${address}</p>
        `;
    }

    const savedLocationData = localStorage.getItem("savedLocation");
    if (savedLocationData) {
        savedLocation = JSON.parse(savedLocationData);

    }

    geocoder = new google.maps.Geocoder();
});
