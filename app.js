const apiKey = '49e55b29947d47248c643212240209';
const TIMEOUT = 5000; // Timeout duration in milliseconds (5 seconds)

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        alert('Please enter a city.');
    }
});

// Event listener for the current location button
document.getElementById('getLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeather(lat, lon);
        }, (error) => {
            console.error('Geolocation error:', error);
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Event listener for the dropdown menu
document.getElementById('recent-cities-dropdown').addEventListener('change', (event) => {
    const city = event.target.value;
    if (city) {
        fetchWeatherData(city);
    }
});

// Utility function to get weather icon class based on condition
function getIconClass(condition) {
    const iconMap = {
        'Clear': 'fas fa-sun',
        'Partly cloudy': 'fas fa-cloud-sun',
        'Cloudy': 'fas fa-cloud',
        'Overcast': 'fas fa-cloud',
        'Mist': 'fas fa-smog',
        'Fog': 'fas fa-fog',
        'Drizzle': 'fas fa-cloud-drizzle',
        'Light rain': 'fas fa-cloud-showers-light',
        'Moderate rain': 'fas fa-cloud-showers-heavy',
        'Heavy rain': 'fas fa-cloud-showers-heavy',
        'Showers': 'fas fa-cloud-showers-heavy',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Sleet': 'fas fa-snowflake',
        'Hail': 'fas fa-snowflake',
        'Blizzard': 'fas fa-snowflake',
        'Tornado': 'fas fa-tornado',
        'Hurricane': 'fas fa-hurricane',
        'Dust': 'fas fa-dust',
        'Sand': 'fas fa-dust',
        'Ash': 'fas fa-dust',
        'Squall': 'fas fa-wind',
        'Haze': 'fas fa-smog',
        'Light rain shower': 'fas fa-cloud-showers-light',
        'Heavy rain shower': 'fas fa-cloud-showers-heavy',
        'default': 'fas fa-question'
    };
    return iconMap[condition] || iconMap['default'];
}

// Fetch weather data based on the city name with timeout
function fetchWeatherData(city) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    fetch(url, { signal: controller.signal })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                handleError(data.error.message);
            } else {
                updateWeatherUI(data.current, data.location);
                updateForecastUI(data.forecast.forecastday);
                saveRecentSearch(city);
            }
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                document.getElementById('weather-info').innerHTML = 'Request timed out. Please try again.';
            } else {
                console.error('Error fetching weather:', error);
                document.getElementById('weather-info').innerHTML = 'Error retrieving weather data. Please try again later.';
            }
        });
}

// Fetch weather data based on latitude and longitude with timeout
function getWeather(lat, lon) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    fetch(url, { signal: controller.signal })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                handleError(data.error.message);
            } else {
                updateWeatherUI(data.current, data.location);
                updateForecastUI(data.forecast.forecastday);
            }
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                document.getElementById('weather-info').innerHTML = 'Request timed out. Please try again.';
            } else {
                console.error('Error fetching weather data:', error);
                document.getElementById('weather-info').innerHTML = 'Error retrieving weather data. Please try again later.';
            }
        });
}

// Handle API and input errors
function handleError(message) {
    let userFriendlyMessage = 'Error retrieving weather data. Please try again later.';
    if (message.includes('no matching location') || message.includes('Invalid query')) {
        userFriendlyMessage = 'Please input a valid city name.';
    } else if (message.includes('request throttled')) {
        userFriendlyMessage = 'API rate limit exceeded. Please try again later.';
    } else if (message.includes('API key is invalid')) {
        userFriendlyMessage = 'Invalid API key. Please check your API key settings.';
    }
    document.getElementById('weather-info').innerHTML = `Error: ${userFriendlyMessage}`;
}

// Update the UI with the current weather data
function updateWeatherUI(current, location) {
    const iconClass = getIconClass(current.condition.text);

    document.getElementById('weather-icon').innerHTML = `<i class="${iconClass}" aria-label="${current.condition.text}"></i>`;
    document.getElementById('temperature').textContent = `${current.temp_c}°C`;
    document.getElementById('description').textContent = current.condition.text;
    document.getElementById('humidity').textContent = `Humidity: ${current.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${current.wind_kph} kph`;
    document.getElementById('location').textContent = `Location: ${location.name}`;
}

// Update the UI with the extended forecast data
function updateForecastUI(forecastDays) {
    const forecastContainer = document.getElementById('forecast-container');
    const fragment = document.createDocumentFragment();

    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const iconClass = getIconClass(day.day.condition.text);
        const forecastHTML = document.createElement('div');
        forecastHTML.className = 'forecast-day';
        forecastHTML.innerHTML = `
            <div class="forecast-date">${date.toDateString()}</div>
            <div class="forecast-icon"><i class="${iconClass}" aria-label="${day.day.condition.text}"></i></div>
            <div class="forecast-temp">Temp: ${day.day.avgtemp_c}°C</div>
            <div class="forecast-wind">Wind: ${day.day.maxwind_kph} kph</div>
            <div class="forecast-humidity">Humidity: ${day.day.avghumidity}%</div>
        `;
        fragment.appendChild(forecastHTML);
    });

    forecastContainer.innerHTML = '';
    forecastContainer.appendChild(fragment);
}

// Save recent search in localStorage and update dropdown
function saveRecentSearch(city) {
    const dropdown = document.getElementById('recent-cities-dropdown');
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    // Check if the city already exists in the array
    if (!recentCities.includes(city)) {
        recentCities.unshift(city); // Add city to the beginning of the array
        if (recentCities.length > 10) { // Limit to 10 recent cities
            recentCities.pop(); // Remove the oldest city
        }
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    updateDropdown(recentCities);
}

// Update the dropdown menu with recent cities
function updateDropdown(cities) {
    const dropdown = document.getElementById('recent-cities-dropdown');
    dropdown.innerHTML = '<option value="">Select a recently searched city</option>'; // Clear existing options

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        dropdown.appendChild(option);
    });
}

// Initialize dropdown with recent cities from localStorage
function initializeDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    updateDropdown(recentCities);
}

// Initialize the dropdown when the page loads
document.addEventListener('DOMContentLoaded', initializeDropdown);
