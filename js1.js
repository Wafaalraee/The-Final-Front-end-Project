alert("click")
const searchButton = document.querySelector("#search-btn");
const locationButton = document.querySelector(".location-btn");
const CityInput = document.querySelector("#city-input");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "c0ff8522df92b20977d2eacc2580c467"; // API key for OpenWeather

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png">
            <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else {
        return `<li class="card">
            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png">
            <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    console.log("Getting weather details");
    console.log("City Name:", cityName);
    console.log("Latitude:", lat);
    console.log("Longitude:", lon);
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            // filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecastItem => {
                const forecastDate = new Date(forecastItem.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });
            
            // Clearing previous weather data
            CityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentWeatherDiv.innerHTML = "";
            // Creating weather cards and adding them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            // Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },
        error => {
            // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access");
            }
        }
    );
};

const getCityCoordinates = () => {
    console.log("Getting city coordinates");
    const cityName = CityInput.value.trim();
    console.log("City Name:", cityName);
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates");
        });
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
CityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());







 




