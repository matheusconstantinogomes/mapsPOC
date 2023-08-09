document.addEventListener("DOMContentLoaded", function () {
    const getLocationBtn = document.getElementById("getLocationBtn");
    const coordinatesOutput = document.getElementById("coordinatesOutput");

    getLocationBtn.addEventListener("click", getUserLocation);

    function getUserLocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async function (position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    const address = await getAddressFromCoordinates(latitude, longitude);

                    coordinatesOutput.innerHTML = `
                        <p><strong>Coordenadas:</strong></p>
                        <p>Latitude: ${latitude.toFixed(6)}</p>
                        <p>Longitude: ${longitude.toFixed(6)}</p>
                        <hr>
                        <p><strong>Endereço:</strong></p>
                        <p>${address}</p>
                    `;
                },
                function (error) {
                    console.error("Erro ao obter localização: ", error);
                }
            );
        } else {
            alert("Geolocalização não suportada no seu navegador.");
        }
    }

    async function getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();

            if (data && data.address) {
                const { road, suburb, city, state, country } = data.address;
                return `${road || ''}, ${suburb || ''}, ${city || ''}, ${state || ''}, ${country || ''}`;
            } else {
                return "Endereço não encontrado";
            }
        } catch (error) {
            console.error("Erro ao obter endereço: ", error);
            return "Erro ao obter endereço";
        }
    }
});
