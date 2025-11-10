const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from v2! Deployed via Jenkins at ' + new Date());
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});