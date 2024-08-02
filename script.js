$(document).ready(function() {
    const apiKey = 'd646bab6735d721c3515f1e9fcd497a7';
    let isCelsius = true;
    let chart;

    showInitialData();

    $('#search-btn').on('click', function() {
        const city = $('#city-input').val();
        if (city) {
            getWeather(city);
        } else {
            showError('Please enter a city name.');
        }
    });

    $('#toggle-temp').on('click', function() {
        toggleTemperature();
    });

    function showInitialData() {
        $('#city-name').text('N/A');
        $('#weather-description').text('N/A');
        $('#temperature').text('N/A');
        $('#weather-icon').attr('class', 'fas fa-cloud');
        $('#date-time').text('N/A');
        $('#location').text('N/A');
        $('#wind-speed').text('N/A');
        $('#sunrise').text('N/A');
        $('#sunset').text('N/A');
        $('#humidity').text('N/A');
        $('#visibility').text('N/A');

        const ctx = document.getElementById('temperature-chart').getContext('2d');
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(24).fill('N/A'),
                datasets: [{
                    label: 'Temperature',
                    data: Array(24).fill(null),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            display: false // Hide x-axis labels
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function getWeather(city) {
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/weather`,
            type: 'GET',
            data: {
                q: city,
                appid: apiKey,
                units: isCelsius ? 'metric' : 'imperial'
            },
            success: function(response) {
                showWeather(response);
                getForecast(city);
            },
            error: function() {
                showError('City not found. Please try again.');
                showInitialData(); // Reset to initial state on error
            }
        });
    }

    function getForecast(city) {
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/forecast`,
            type: 'GET',
            data: {
                q: city,
                appid: apiKey,
                units: isCelsius ? 'metric' : 'imperial'
            },
            success: function(response) {
                renderChart(response.list);
            },
            error: function() {
                showError('Could not retrieve forecast. Please try again.');
                showInitialData(); // Reset to initial state on error
            }
        });
    }

    function showWeather(data) {
        $('#city-name').text(data.name);
        $('#weather-description').text(data.weather[0].description);
        $('#temperature').text(data.main.temp + (isCelsius ? ' °C' : ' °F'));
        $('#weather-icon').attr('class', `fas ${getWeatherIcon(data.weather[0].main)}`);
        $('#date-time').text(new Date().toLocaleString());
        $('#location').text(`${data.name}, ${data.sys.country}`);
        $('#wind-speed').text(data.wind.speed + ' ' + (isCelsius ? 'm/s' : 'mph'));
        $('#sunrise').text(new Date(data.sys.sunrise * 1000).toLocaleTimeString());
        $('#sunset').text(new Date(data.sys.sunset * 1000).toLocaleTimeString());
        $('#humidity').text(data.main.humidity + '%');
        $('#visibility').text(data.visibility / 1000 + ' km');
    }

    function renderChart(forecast) {
        const labels = forecast.slice(0, 24).map(item => new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
        const temperatures = forecast.slice(0, 24).map(item => item.main.temp);

        const ctx = document.getElementById('temperature-chart').getContext('2d');
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    data: temperatures,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function showError(message) {
        alert(message);
    }

    function getWeatherIcon(weather) {
        const weatherIcons = {
            'Clear': 'fa-sun',
            'Clouds': 'fa-cloud',
            'Rain': 'fa-cloud-rain',
            'Snow': 'fa-snowflake',
            'Thunderstorm': 'fa-bolt',
            'Drizzle': 'fa-cloud-drizzle',
            'Atmosphere': 'fa-smog'
        };
        return weatherIcons[weather] || 'fa-cloud';
    }

    function toggleTemperature() {
        isCelsius = !isCelsius;
        const city = $('#city-name').text();
        if (city && city !== 'N/A') {
            getWeather(city);
        }
    }
});
