const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');



const supabaseUrl = 'https://dodldqhpuctrjaxgvmma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZGxkcWhwdWN0cmpheGd2bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MjgzMjUsImV4cCI6MjA0OTIwNDMyNX0.VWXV-hVge3QwAXHDTOvioOxGK7-Vnc_AZwZWiQpu5Ec';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// Function to get today's exchange rate as dict inside array.
 
async function get_todays_exchange() {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  console.log(`Querying for date: ${formattedDate}`);

  // Query Supabase
  let { data: exchange_rate, error } = await supabase
    .from('exchange_rates') // Replace with your actual table name
    .select('*')
    .eq('Date', formattedDate);

  if (error) {
    console.error('Error fetching data from Supabase:', error);
    throw error;
  }

  if (!exchange_rate || exchange_rate.length === 0) {
    console.log('No data found in Supabase. Fetching from Frankfurter API...');

    // Fetch data from Frankfurter API
    try {
      const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD');
      if (!response.ok) {
        throw new Error(`Frankfurter API responded with status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('Data fetched from Frankfurter API:', apiData);

      // Flatten the `rates` key into the main object and rename keys
      const { rates, date, base, amount } = apiData; // Extract values
      const supabaseInsertData = {
        Date: date,
        Base: base,
        Amount: amount,
        ...rates, // Spread the rates into the main object
      };
      console.log(supabaseInsertData)
      // Insert into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('exchange_rates')
        .insert([supabaseInsertData])
        .select('*');


      if (insertError) {
        console.error('Error inserting data into Supabase:', insertError);
        throw insertError;
      }

      console.log('Data successfully inserted into Supabase:', insertedData);
      return insertedData; // Return inserted data
    } catch (apiError) {
      console.error('Error fetching data from Frankfurter API:', apiError);
      throw apiError;
    }
  }

  console.log('Data fetched from Supabase:', exchange_rate);
  return exchange_rate;
}

async function convert(from, to, amount) {
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (!response.ok) {
      throw new Error(`Error fetching conversion rate: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      throw new Error(`Conversion rate for ${to} not available.`);
    }

    const convertedAmount = (amount * data.rates[to]).toFixed(2);
    return `${amount} ${from} = ${convertedAmount} ${to}`;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
}



async function get_hist_exchange(histDate) {
  console.log(`Querying for date: ${histDate}`);

  // Format `histDate` to `YYYY-MM-DD`
  const formattedDate = histDate instanceof Date ? histDate.toISOString().split('T')[0] : histDate;
  console.log(`Formatted date: ${formattedDate}`);

  // Query Supabase
  let { data: exchange_rate, error } = await supabase
    .from('exchange_rates') // Replace with your actual table name
    .select('*')
    .eq('Date', formattedDate);

  if (error) {
    console.error('Error fetching data from Supabase:', error);
    throw error;
  }

  if (!exchange_rate || exchange_rate.length === 0) {
    console.log('No data found in Supabase. Fetching from Frankfurter API...');

    // Fetch data from Frankfurter API
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/${formattedDate}?base=USD&symbols=AUD,BGN,BRL,CAD,CHF,CNY,CZK,DKK,EUR,GBP,HKD,HUF,IDR,ILS,INR,ISK,JPY,KRW,MXN,MYR,NOK,NZD,PHP,PLN,RON,SEK,SGD,THB,TRY,ZAR
      `);
      if (!response.ok) {
        throw new Error(`Frankfurter API responded with status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('Data fetched from Frankfurter API:', apiData);

      // Flatten the `rates` key into the main object and rename keys
      const { rates, date: apiDate, base, amount } = apiData; // Extract and rename `date` to `apiDate`
      const supabaseInsertData = {
        Date: apiDate, // Use the API's date value
        Base: base, 
        Amount: amount, 
        ...rates, 
      };

      console.log('Data prepared for Supabase:', supabaseInsertData);

      // Insert into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('exchange_rates')
        .insert([supabaseInsertData])
        .select('*');

      if (insertError) {
        console.error('Error inserting data into Supabase:', insertError);
        throw insertError;
      }

      console.log('Data successfully inserted into Supabase:', insertedData);
      return insertedData; // Return inserted data
    } catch (apiError) {
      console.error('Error fetching data from Frankfurter API:', apiError);
      throw apiError;
    }
  }

  console.log('Data fetched from Supabase:', exchange_rate);
  return exchange_rate;
}

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile('public/home.html', { root: __dirname });
});

app.get('/help', (req, res) => {
  res.sendFile('public/stocks.html', { root: __dirname });
});

app.get('/about', (req, res) => {
  res.sendFile('public/about.html', { root: __dirname });
});

// Backend API to retrieve today's exchange rate data
app.get('/get_cur_exchange', async (req, res) => {
  try {
    const todaysRates = await get_todays_exchange();
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(todaysRates));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch today\'s exchange rates' });
  }
});

// Backend API to retrieve historical exchange rate data by passing in date 'YYYY-MM-DD'
app.post('/get_hist_exchange', async (req, res) => {
  const { date } = req.body; 

  if (!date) {
    return res.status(400).send({ error: 'Date is required' });
  }

  try {
    const todaysRates = await get_hist_exchange(date);
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(todaysRates));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch historical exchange rates' });
  }
});

// Backend API to convert currencies based on latest exchange example: http://127.0.0.1:3000/convert?from=USD&to=EUR&amount=100 '

app.get('/convert', async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).send({ error: 'Missing required query parameters: from, to, or amount.' });
  }

  try {
    const result = await convert(from, to, parseFloat(amount));
    res.status(200).send({ result });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// Handle 404
app.use((req, res) => {
  res.status(404).send('404: Page Not Found');
});

// Start the server
app.listen(port, hostname, () => {
  console.log(`Express app listening on http://${hostname}:${port}`);
});
