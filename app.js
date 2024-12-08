const express = require('express')
const app = express()
const hostname = '127.0.0.1';

const port = 3000;

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile('public/home_page.html', { root: __dirname })
})

app.get('/help', (req, res) => {
    res.sendFile('public/help_page.html', { root: __dirname })
})

app.get('/about', (req, res) => {
    res.sendFile('public/about_page.html', { root: __dirname })
})
app.use((req, res) => {
    res.status(404).send('404: Page Not Found');
});
si
app.listen(port, hostname, () => {
    console.log(`Express app listening on Port: ${port}`)
})