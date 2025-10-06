// Simple Weather App Script

document.getElementById('showWeatherBtn').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value.trim();
    const resultDiv = document.getElementById('weatherResult');
    if (city) {
        // Hardcoded temperature for demonstration
        const temperature = '25°C';
        resultDiv.textContent = `The temperature in ${city} is ${temperature}.`;
    } else {
        resultDiv.textContent = 'Please enter a city name.';
    }
}); 