const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchGoldRate() {
  try {
    console.log("Starting the gold rate fetching process...");
    const url = 'https://www.malabargoldanddiamonds.com/goldprice';
    console.log("Fetching the gold rate page...");

    const response = await axios.get(url);
    console.log("Gold rate page fetched successfully.");
    
    const html = response.data;
    console.log("Parsing the HTML...");

    const $ = cheerio.load(html);
    const showRateBlock = $('#show-rate-block');
    console.log("Found #show-rate-block element:", showRateBlock.html());

    const rateElement = showRateBlock.find('.price.22kt-price');
    const dateElement = showRateBlock.find('.date.update-date');
    console.log("Found .price.22kt-price element:", rateElement.html());
    console.log("Found .date.update-date element:", dateElement.html());

    if (rateElement.length === 0 || dateElement.length === 0) {
      throw new Error('Could not extract the gold rate or date from the page.');
    }

    const rate = rateElement.text().trim();
    const date = dateElement.text().trim();
    console.log("Gold rate extracted:", rate);
    console.log("Date extracted:", date);

    const newRow = `<tr><td>${date}</td><td>${rate}</td></tr>`;

    const filePath = 'index.html';
    let content = fs.readFileSync(filePath, 'utf8');
    console.log("Read existing index.html content.");

    const tableEndIndex = content.lastIndexOf('</tbody>');
    if (tableEndIndex === -1) {
      throw new Error('No </tbody> tag found in index.html');
    }
    content = content.slice(0, tableEndIndex) + newRow + content.slice(tableEndIndex);
    fs.writeFileSync(filePath, content);
    console.log("Updated index.html with new gold rate.");

  } catch (error) {
    console.error('Error occurred while fetching the gold rate:', error);
    process.exit(1);
  }
}

fetchGoldRate();
