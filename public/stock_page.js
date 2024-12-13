import { restClient } from '@polygon.io/client-js';
import Chart from 'chart.js/auto';
import moment from 'moment';

const apiKey = 'OdI5DpgBKrjcul14yzdfvfLXGXqufApT';
const rest = restClient(apiKey);

// Fetch stock data for ticker using Polygon API
async function fetchStockData() {
  try {
    const symbols = ['AAPL', 'MSFT', 'GOOGL'];
    const promises = symbols.map(async (symbol) => {
      const data = await rest.stocks.previousClose(symbol);
      return `${symbol}: $${data.results[0].c.toFixed(2)}`;
    });

    const results = await Promise.all(promises);
    document.getElementById('stock-ticker').textContent = results.join(' | ');
  } catch (error) {
    console.error('Error fetching stock data:', error);
    document.getElementById('stock-ticker').textContent = 'Failed to load stock data.';
  }
}

// Render stock chart using Chart.js and Polygon API
async function renderStockChart() {
  try {
    const symbol = 'AAPL';
    const from = moment().subtract(10, 'days').format('YYYY-MM-DD');
    const to = moment().format('YYYY-MM-DD');
    const data = await rest.stocks.aggregates(symbol, 1, 'day', from, to);

    const dates = data.results.map((item) => moment(item.t).format('YYYY-MM-DD'));
    const prices = data.results.map((item) => item.c);

    const ctx = document.getElementById('stockChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: `${symbol} Stock Prices (Last 10 Days)`,
            data: prices,
            borderColor: 'blue',
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Price (USD)',
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error rendering chart:', error);
    document.getElementById('stockChart').textContent = 'Failed to load chart data.';
  }
}

// Fetch current exchange rates
async function fetchCurrentExchangeRates() {
  try {
    const response = await fetch('http://127.0.0.1:3000/get_cur_exchange');
    if (!response.ok) throw new Error('Failed to fetch exchange rates.');
    const data = await response.json();
    const ratesDiv = document.getElementById('current-exchange-rates');
    ratesDiv.innerHTML = data.map(rate => `
      <p>${rate.Base} - EUR: ${rate.EUR}, AUD: ${rate.AUD}</p>
    `).join('');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
  }
}

// Fetch historical exchange rates
document.getElementById('historical-data-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const date = document.getElementById('date-input').value;

  try {
    const response = await fetch('http://127.0.0.1:3000/get_hist_exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    if (!response.ok) throw new Error('Failed to fetch historical data.');
    const data = await response.json();
    document.getElementById('historical-data-output').innerHTML = `
      <p>On ${data.Date}, 1 ${data.Base} = ${data.EUR} EUR, ${data.AUD} AUD</p>
    `;
  } catch (error) {
    console.error('Error fetching historical data:', error);
  }
});


// Populate the currency dropdowns using ExchangeRate-API
function populateForm() {
  let toCurrency = document.getElementById('toCurrency');
  let fromCurrency = document.getElementById('fromCurrency');

  // Fetch the data from the API
  fetch("https://v6.exchangerate-api.com/v6/d68026dc2228405307fca860/latest/USD")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const currencies = Object.keys(data.conversion_rates); // Extract currency codes

      // Populate the dropdowns with currency options
      currencies.forEach((currency) => {
        const optionFrom = document.createElement("option");
        const optionTo = document.createElement("option");

        optionFrom.value = currency;
        optionFrom.textContent = currency;
        optionTo.value = currency;
        optionTo.textContent = currency;

        fromCurrency.appendChild(optionFrom);
        toCurrency.appendChild(optionTo);
      });
    })
    .catch((error) => {
      console.error("Error fetching currencies:", error);
      alert("Failed to load currencies. Please try again later.");
    });
}



// Perform the currency conversion using ExchangeRate-API
function convertCurrency() {
  let currency = document.getElementById('convertPrice').value;
  let optionFrom = document.getElementById('fromCurrency').value;
  let optionTo = document.getElementById('toCurrency').value;

  if (optionFrom === optionTo) {
    alert("You cannot convert to and from the same currency.");
    return;
  }

  fetch(`https://v6.exchangerate-api.com/v6/d68026dc2228405307fca860/pair/${optionFrom}/${optionTo}/${currency}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.result === "success") {
        document.getElementById(
          "conversionResult"
        ).textContent = `${currency} ${optionFrom} is ${data.conversion_result.toFixed(2)} ${optionTo}`;
      } else {
        alert("Error performing conversion. Please try again.");
      }
    })
    .catch((error) => console.error("Error converting currency:", error));
}

window.onload = () => {
  fetchStockData();
  renderStockChart();
  fetchCurrentExchangeRates();
  populateForm();
};

