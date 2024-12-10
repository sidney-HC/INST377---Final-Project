import { restClient } from '@polygon.io/client-js';
import Chart from 'chart.js/auto';
import moment from 'moment';

const apiKey = 'OdI5DpgBKrjcul14yzdfvfLXGXqufApT';
const rest = restClient(apiKey);

// Fetch stock data for ticker using Polygon API
async function fetchStockData() {
  try {
    const symbols = ['AAPL', 'MSFT', 'GOOGL']; // Stock symbols to track
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

// Call the functions to populate the page
fetchStockData();
renderStockChart();
