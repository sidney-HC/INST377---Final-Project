// Load Current Exchange Rates on Page Load
async function loadCurrentExchangeRates() {
    try {
        const response = await fetch('/get_cur_exchange');
        if (!response.ok) {
            throw new Error(`Failed to fetch current exchange rates: ${response.statusText}`);
        }

        const data = await response.json();
        updateExchangeRatesTable(data);

        // Update current date
        const currentDate = data[0]?.Date || new Date().toISOString().split('T')[0];
        document.getElementById('current-date').textContent = currentDate;
    } catch (error) {
        console.error('Error loading current exchange rates:', error);
    }
}

// Update Exchange Rates Table
function updateExchangeRatesTable(data) {
    const ratesContainer = document.getElementById('exchange-rates');
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Currency</th>
                <th>Rate</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(data[0])
                .filter(([key]) => key !== 'Date' && key !== 'Base' && key !== 'Amount')
                .map(([currency, rate]) => `
                    <tr>
                        <td>${currency}</td>
                        <td>${rate}</td>
                    </tr>
                `)
                .join('')}
        </tbody>
    `;

    ratesContainer.innerHTML = ''; 
    ratesContainer.appendChild(table);
}

// Generate Stock Chart
// Generate Stock Chart and Fetch Latest Price
async function genStockChart(event) {
    event.preventDefault();
    const apiKey = '3Co8vDAZ9vnEovQ_oIETgDIfUxpVerUK'; 
    const ticker = document.getElementById("ticker").value.toUpperCase();
    const days = parseInt(document.getElementById("dayCount").value);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateFormatted = startDate.toISOString().split("T")[0];
    const endDateFormatted = endDate.toISOString().split("T")[0];

    const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDateFormatted}/${endDateFormatted}?adjusted=true&sort=asc&apiKey=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
        alert("Error fetching stock data!");
        return;
    }

    const data = await response.json();
    const dates = data.results.map(result => new Date(result.t).toLocaleDateString());
    const closingPrices = data.results.map(result => result.c);

    // Generate Chart
    const chartContainer = document.getElementById('stocksChart');
    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Closing Prices',
                data: closingPrices,
                borderColor: 'rgba(200, 100, 100, 1)',
                backgroundColor: 'rgba(200, 100, 100, 0.2)',
                borderWidth: 2,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dates'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Closing Prices'
                    },
                    beginAtZero: false
                }
            }
        }
    });

    // Fetch Latest Price
    fetchLatestPrice(ticker);
}
// Fetch Latest Price of a Stock
async function fetchLatestPrice(ticker) {
    const apiUrl = `https://api.api-ninjas.com/v1/stockprice?ticker=${ticker}`;
    const apiKey = 'xm2f71qWMC4Y0LdIuYlKHQ==CJ693paQ9VqYWFmt';

    try {
        const response = await fetch(apiUrl, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (!response.ok) {
            throw new Error(`Error fetching latest price for ${ticker}`);
        }

        const data = await response.json();

        // Update Latest Price Table
        const tableBody = document.getElementById('latest-price-body');
        tableBody.innerHTML = `
            <tr>
                <td>${data.ticker}</td>
                <td>${data.name}</td>
                <td>${data.price.toFixed(2)}</td>

            </tr>
        `;
    } catch (error) {
        console.error('Error fetching latest price:', error);
        const tableBody = document.getElementById('latest-price-body');
        tableBody.innerHTML = `<tr><td colspan="6">Error fetching latest price</td></tr>`;
    }
}


// Fetch Historical Exchange Rates
async function fetchHistoricalRates(event) {
    event.preventDefault();
    const date = document.getElementById("hist-date").value;
    const response = await fetch(`/get_hist_exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
    });

    if (!response.ok) {
        alert("Error fetching historical rates!");
        return;
    }

    const data = await response.json();
    updateExchangeRatesTable(data);

    // Update current date to historical date
    document.getElementById('current-date').textContent = date;
}

// Convert Currencies
async function convertCurrency(event) {
    event.preventDefault();
    const from = document.getElementById("from-currency").value.toUpperCase();
    const to = document.getElementById("to-currency").value.toUpperCase();
    const amount = parseFloat(document.getElementById("amount").value);

    const response = await fetch(`/convert?from=${from}&to=${to}&amount=${amount}`);
    if (!response.ok) {
        alert("Error converting currency!");
        return;
    }

    const data = await response.json();
    document.getElementById("conversion-result").textContent = data.result;
}

// Attach Event Listeners
document.getElementById("historical-rates-form").addEventListener("submit", fetchHistoricalRates);
document.getElementById("convert-form").addEventListener("submit", convertCurrency);

// Load current exchange rates on page load
window.onload = function () {
    loadCurrentExchangeRates();
};
