const apiKey = 'b058a561562c5221d407f0b050608973';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    localStorage.setItem('lastCity', city);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
        getForecast(city);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function updateBackground(weatherMain, sunrise, sunset) {
    const body = document.body;
    const now = Date.now() / 1000; // แปลงเป็นวินาที

    // เช็กเวลากลางวัน/กลางคืน
    const isDay = now >= sunrise && now < sunset;

    switch (weatherMain.toLowerCase()) {
        case 'clear':
            body.style.background = isDay
                ? 'linear-gradient(to top, #f9d423, #ff4e50)'   // ฟ้าใสกลางวัน
                : 'linear-gradient(to top, #0f2027, #203a43, #2c5364)'; // ฟ้าใสกลางคืน
            break;
        case 'clouds':
            body.style.background = isDay
                ? 'linear-gradient(to top, #757f9a, #d7dde8)'   // เมฆกลางวัน
                : 'linear-gradient(to top, #232526, #414345)';  // เมฆกลางคืน
            break;
        case 'rain':
        case 'drizzle':
            body.style.background = isDay
                ? 'linear-gradient(to top, #667db6, #0082c8, #667db6)' // ฝนกลางวัน
                : 'linear-gradient(to top, #141E30, #243B55)';         // ฝนกลางคืน
            break;
        case 'snow':
            body.style.background = isDay
                ? 'linear-gradient(to top, #e0eafc, #cfdef3)'   // หิมะกลางวัน
                : 'linear-gradient(to top, #2c3e50, #bdc3c7)';  // หิมะกลางคืน
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(to top, #141e30, #243b55)'; // พายุ (มืดตลอด)
            break;
        default:
            body.style.background = '#051923';
    }
}


function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];
    updateBackground(weather[0].main);
    updateBackground(weather[0].main, data.sys.sunrise, data.sys.sunset);

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon || '01d'}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;

}

async function getForecast(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่สามารถโหลดพยากรณ์อากาศได้');
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error(error.message);
    }
}

function displayForecast(data) {
    const forecastHtml = data.list
        .filter((_, index) => index % 8 === 0)
        .map(item => {
            const date = new Date(item.dt * 1000);
            return `
                <div class="forecast-item">
                    <h4>${date.toLocaleDateString('th-TH')}</h4>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                    <p>${item.main.temp.toFixed(1)}°C</p>
                    <p>${item.weather[0].description}</p>
                </div>
            `;
        }).join('');

    weatherInfoContainer.innerHTML += `
        <h3>พยากรณ์ 5 วัน</h3>
        <div class="forecast-container">${forecastHtml}</div>
    `;
};

window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeather(lastCity);
    }
});
