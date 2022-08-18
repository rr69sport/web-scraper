const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();
const app = express();
app.use(cors());

const pattern = /^http(s)?:\/\/?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

app.get('/', (req, res) => {

  if (!req.query.url) res.status(200).json('Default message');

  const { url } = req.query;

  if (pattern.test(url)) {
    axios(url)
      .then(response => {
        const html = response.data;
        const elements = cheerio.load(html);

        const getTypeTag = (type) => {
          return elements(`meta[name="${type}"]`).attr('content') || elements(`meta[property="${type}"]`).attr('content')
        }

        const getDataFrom = (nameTag) => {
          return getTypeTag(nameTag) || getTypeTag(`og:${nameTag}`) || getTypeTag(`twitter:${nameTag}`);
        }

        const getMetadata = () => ({
          title: elements('title').text() || getDataFrom('title'),
          description: getDataFrom('description'),
          image: getDataFrom('image'),
          url: getDataFrom('url')
        });

        const scrapedData = getMetadata();

        res.status(200).json(scrapedData);

      }).catch(error => {
        return res.status(404).jsonp({ error: error })
      })    
  } else {
    res.status(404).jsonp({ error: 'URL not valid' })
  }
})

app.listen(process.env.PORT, () => console.log(`Server running on port: ${process.env.PORT}`));