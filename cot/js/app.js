window.addEventListener('scroll', e => {
	document.documentElement.style.setProperty('--scrollTop', `${this.scrollY}px`) 
})
gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
ScrollSmoother.create({
	wrapper: '.wrapper',
	content: '.content'
})


const apiKey='aec67062fbb030135c5f225844f6a089';    
const input = document.querySelector('.search_input');
const todayPanel = document.querySelector('.panel_today');
const windPanel = document.querySelector('.panel_wind');

const searchInput = document.querySelector('.search_input');


const themeToggle = document.getElementById('themeToggle');
let isDarkTheme = localStorage.getItem('theme') === 'dark'; 

if (isDarkTheme) document.body.classList.add('dark-theme');

themeToggle.addEventListener('click', () => {
  isDarkTheme = !isDarkTheme; 
  document.body.classList.toggle('dark-theme', isDarkTheme); 
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light'); 
});



searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
    const city = e.target.value;
    getWeather(city);
    }
});

async function getWeather(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
        );
        const data = await res.json();

        document.getElementById('temp').textContent = ` ${Math.round(data.main.temp)}°C`;
        document.getElementById('humidity').textContent = ` ${data.main.humidity}%`;
        document.getElementById('pressure').textContent = ` ${data.main.pressure} гПа`;
        document.getElementById('clouds').textContent = ` ${data.clouds.all}%`;
        document.getElementById('wind').textContent = ` ${data.wind.speed} м/с`;
        document.getElementById('wind-dir').textContent = ` ${data.wind.deg}°`;

        // Загружаем прогноз на 7 дней
        getWeeklyWeatherForecast(city, apiKey);

    } catch (error) {
        alert("Город не найден. Попробуйте снова.");
    }
};




async function getWeeklyWeatherForecast(city, apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`);
        }

        const data = await response.json();
        const dailyData = {};

        // Группируем прогнозы по дате
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });

        // Отображаем прогноз только на будущие 5 дней
        const today = new Date().toISOString().split('T')[0];
        const futureDates = Object.keys(dailyData).filter(date => date > today).slice(0, 5);

        const container = document.querySelector('.weather__panelw');
        container.innerHTML = '';

        futureDates.forEach(date => {
            const dayData = dailyData[date];
            const midday = dayData.find(item => item.dt_txt.includes("12:00:00")) || dayData[Math.floor(dayData.length / 2)];
            const formattedDate = new Date(midday.dt * 1000).toLocaleDateString("ru-RU", {
                weekday: 'long',   
                month: 'long',
                day: 'numeric'
            });

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <div class="date">${formattedDate}</div>
                <img src="https://openweathermap.org/img/wn/${midday.weather[0].icon}.png" alt="${midday.weather[0].description}" />
                <div class="temp">${Math.round(midday.main.temp)}°C</div>
                <div class="cloud">${midday.weather[0].description}</div>
                <div class="wind">Ветер: ${midday.wind.speed} м/с</div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Не удалось получить прогноз погоды:", error);
    }
}

