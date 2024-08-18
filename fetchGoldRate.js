const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function getGoldRate() {
  try {
    console.log('Fetching the gold rate page...');
    const { data } = await axios.get('https://www.malabargoldanddiamonds.com/goldprice');

    console.log('Parsing the HTML...');
    const $ = cheerio.load(data);

    const rate = $('.price.22kt-price').text().trim();
    const date = $('.date.update-date').text().trim();

    if (!rate || !date) {
      throw new Error('Could not extract the gold rate or date from the page.');
    }

    console.log('Gold rate:', rate);
    console.log('Date:', date);

    const newRow = `<tr><td>${date}</td><td>${rate}</td></tr>`;

    const filePath = 'index.html';
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('Read existing index.html content.');

    const tableEndIndex = content.lastIndexOf('</tbody>');
    if (tableEndIndex === -1) {
      throw new Error('No </tbody> tag found in index.html');
    }

    content = content.slice(0, tableEndIndex) + newRow + content.slice(tableEndIndex);
    fs.writeFileSync(filePath, content);
    console.log('Updated index.html with new gold rate.');
  } catch (error) {
    console.error('Error occurred while fetching the gold rate:', error.message);
    process.exit(1);
  }
}

getGoldRate();
