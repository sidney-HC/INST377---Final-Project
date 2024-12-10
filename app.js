import { createClient } from '@supabase/supabase-js';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://dodldqhpuctrjaxgvmma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZGxkcWhwdWN0cmpheGd2bW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MjgzMjUsImV4cCI6MjA0OTIwNDMyNX0.VWXV-hVge3QwAXHDTOvioOxGK7-Vnc_AZwZWiQpu5Ec';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// Function to get today's exchange rate
async function get_todays_exchange() {
  const dateToQuery = '2024-12-06'; // Replace with the current date dynamically if needed

  let { data: exchange_rate, error } = await supabase
    .from('exchange_rates') // Replace with your actual table name
    .select('*') // Select all columns (or specify specific ones)
    .eq('Date', dateToQuery); // Filter where 'Date' matches the specified value

  if (error) {
    console.error('Error fetching data:', error);
    throw error; // Propagate the error
  }

  return exchange_rate;
}

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile('public/home_page.html', { root: __dirname });
});

app.get('/help', (req, res) => {
  res.sendFile('public/stocks.html', { root: __dirname });
});

app.get('/about', (req, res) => {
  res.sendFile('public/about_page.html', { root: __dirname });
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
