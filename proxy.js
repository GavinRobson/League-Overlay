const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Crendentials', true);
  next();
});

app.use('/', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url:req.query.url,
      data: req.body,
      headers: {
        'Authorization': req.headers.authorization,
      }
    });
    res.send(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.statusText);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})