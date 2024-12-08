const express = require('express')
const app = express()
const hostname = '127.0.0.1';

const port = 3000;

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile('public/home_page.html', { root: __dirname })
})

app.listen(port, hostname, () => {
    console.log(`Express app listening on Port: ${port}`)
})