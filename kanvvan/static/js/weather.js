function fetchWeather() {
    fetch(`${window.origin}/weather`)
    .then(data => {
        return data.json()
    })
    .then(data => {
        updateWeather(data);
    });
}


function updateWeather(data) {
    const img = document.getElementById("weather-img");
    img.src = data["icon"];

    const temp = document.getElementById("temp");
    temp.innerHTML = data["temp"] + "&deg;";

    const weather_desc = document.getElementById("weather-desc");
    weather_desc.innerText = data["shortForecast"];

    const location = document.getElementById("location");
    location.innerText = data["city"] + ", " + data["state"];
    
    const chance_of_rain = document.getElementById("chance-of-rain");
    let rain_text = (data["precip"]) ? data["precip"] : "0";
    chance_of_rain.innerText = "Chance of Rain: " + rain_text + "%";
}

function updateLocation() {
    const lat = document.getElementById("lat");
    const lon = document.getElementById("lon");
    let body = {
        lat: lat.value,
        lon: lon.value
    }
    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(body)
    }
    fetch(`${window.origin}/weather/update`, post)
    .then(function (response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json()
        }
    })
    .then(data => {
        updateWeather();
    });
}


const updateBtn = document.getElementById("updateLocation");
updateBtn.addEventListener("click", updateLocation);

window.onload = fetchWeather;