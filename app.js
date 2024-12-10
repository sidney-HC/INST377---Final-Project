const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');



const supabaseUrl = 'https://dodldqhpuctrjaxgvmma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZGxkcWhwdWN0cmpheGd2bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MjgzMjUsImV4cCI6MjA0OTIwNDMyNX0.VWXV-hVge3QwAXHDTOvioOxGK7-Vnc_AZwZWiQpu5Ec';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// Function to get today's exchange rate

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
        .from('exchange_rates') // Replace with your actual table name
        .insert([supabaseInsertData]);

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


app.use(express.static(path.join(__dirname, 'public')));

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

// Backend API to retrieve historical exchange rate data by passing in date
app.get('/get_hist_exchange', async (req, res) => {
  const dateToQuery = req.query.date; // Pass date as a query parameter

  if (!dateToQuery) {
    return res.status(400).send({ error: 'Date is required' });
  }

  try {
    const { data: exchange_rate, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('Date', dateToQuery);

    if (error) {
      throw error;
    }

    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(exchange_rate));
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch historical exchange rates' });
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
