# Developer Manual

## 1. How to Install the Application and Dependencies

### Prerequisites

- Node.js (v14 or above)
- npm (Node Package Manager)
- Supabase account and API credentials

### Installation Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-folder>
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure your environment variables:
   - Replace the `supabaseKey` in the code with your Supabase API key or use environment variables to securely store the key.

### Directory Structure

```
project-folder/
├── public/
│   ├── home.html
│   ├── stocks.html
│   ├── about.html
├── app.js
├── package.json
└── package-lock.json
```

---

## 2. How to Run the Application on a Server

### Local Server

1. Start the server locally:

   ```bash
   node app.js
   ```

2. Access the application in your browser:
   ```
   http://127.0.0.1:3000
   ```

### Deployment Steps

- Deploy the app using platforms like Vercel, Heroku, or a custom VPS.
- Ensure the environment variables (e.g., `supabaseKey`) are configured securely on the hosting platform.

---

## 3. How to Run Tests

### Example Tests for API Endpoints

#### **GET `/get_cur_exchange`**

1. Open Postman or Insomnia.
2. Create a new GET request with the URL:
   ```
   http://127.0.0.1:3000/get_cur_exchange
   ```
3. Send the request.
4. **Expected Response**:
   ```json
   [
     {
       "Date": "YYYY-MM-DD",
       "Base": "USD",
       "Amount": 1,
       "AUD": 1.5,
       "EUR": 0.85
     }
   ]
   ```

#### **POST `/get_hist_exchange`**

1. Open Postman or Insomnia.
2. Create a new POST request with the URL:
   ```
   http://127.0.0.1:3000/get_hist_exchange
   ```
3. Add the following JSON body:
   ```json
   {
     "date": "YYYY-MM-DD"
   }
   ```
4. Send the request.
5. **Expected Response**:
   ```json
   {
     "Date": "YYYY-MM-DD",
     "Base": "USD",
     "Amount": 1,
     "AUD": 1.6,
     "EUR": 0.9
   }
   ```

#### **GET `/convert`**

1. Open Postman or Insomnia.
2. Create a new GET request with the URL:
   ```
   http://127.0.0.1:3000/convert?from=USD&to=EUR&amount=100
   ```
3. Send the request.
4. **Expected Response**:
   ```json
   {
     "result": "100 USD = 85.00 EUR"
   }
   ```

---

## 4. API Documentation

### Base URL

```
http://127.0.0.1:3000
```

### Endpoints

#### 1. **GET `/`**

- **Description**: Serves the home page.
- **Response**: Returns the `home.html` file.

#### 2. **GET `/help`**

- **Description**: Serves the help page.
- **Response**: Returns the `stocks.html` file.

#### 3. **GET `/about`**

- **Description**: Serves the about page.
- **Response**: Returns the `about.html` file.

#### 4. **GET `/get_cur_exchange`**

- **Description**: Fetches today’s exchange rates.
- **Response**:
  ```json
  [
    {
      "Date": "YYYY-MM-DD",
      "Base": "USD",
      "Amount": 1,
      "AUD": 1.5,
      "EUR": 0.85
    }
  ]
  ```

#### 5. **POST `/get_hist_exchange`**

- **Description**: Fetches historical exchange rates for a specific date.
- **Request Body**:
  ```json
  {
    "date": "YYYY-MM-DD"
  }
  ```
- **Response**:
  ```json
  {
    "Date": "YYYY-MM-DD",
    "Base": "USD",
    "Amount": 1,
    "AUD": 1.6,
    "EUR": 0.9
  }
  ```

#### 6. **GET `/convert`**

- **Description**: Converts a specified amount from one currency to another.
- **Query Parameters**:
  - `from`: Source currency (e.g., `USD`)
  - `to`: Target currency (e.g., `EUR`)
  - `amount`: Amount to convert (e.g., `100`)
- **Example Request**:
  ```
  GET /convert?from=USD&to=EUR&amount=100
  ```
- **Response**:
  ```json
  {
    "result": "100 USD = 85.00 EUR"
  }
  ```

#### 7. **404 Not Found**

- **Description**: Returns a 404 message for undefined routes.
- **Response**:
  ```
  404: Page Not Found
  ```

## 5. Future Roadmap

### Features to Implement

1. **User Authentication**

   - Add user login and registration features to restrict access to certain endpoints.
   - Integrate with Supabase’s authentication module for easy setup.

2. **Enhanced Error Reporting**

   - Provide more detailed error responses for API consumers.
   - Log errors to a monitoring service like Sentry for tracking issues.

3. **Historical Data Analysis**

   - Add endpoints for analyzing historical exchange rate trends.
   - Include visualization features such as graphs and charts for frontend applications.

4. **Multi-Currency Conversion**

   - Extend the `/convert` endpoint to support multi-currency conversions (e.g., `amount` in USD converted to multiple currencies).

5. **Caching for Exchange Rates**
   - Implement caching to reduce reliance on external API calls and improve performance.
   - Use tools like Redis for storing frequently accessed data.

---
