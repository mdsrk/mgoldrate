const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchGoldRate() {
  try {
    console.log("Fetching the gold rate page...");
    const response = await axios.get('https://www.malabargoldanddiamonds.com/goldprice');
    console.log("Page fetched successfully.");

    console.log("Parsing the HTML...");
    const $ = cheerio.load(response.data);

    const showRateBlock = $('#show-rate-block');

    if (showRateBlock.length) {
      console.log("Found the #show-rate-block element.");

      const rateElement = showRateBlock.find('.price.22kt-price');
      const dateElement = showRateBlock.find('.date.update-date');

      console.log(`Extracting the gold rate...`);
      const rate = rateElement.text().trim();
      console.log(`Extracting the update date...`);
      const date = dateElement.text().trim();

      if (rate && date) {
        console.log(`Gold rate extracted: ${rate}`);
        console.log(`Update date extracted: ${date}`);

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
      } else {
        throw new Error('Could not extract the gold rate or date from the page.');
      }
    } else {
      throw new Error('The #show-rate-block element was not found.');
    }
  } catch (error) {
    console.error("Error occurred while fetching the gold rate:", error.message);
    process.exit(1);
  }
}

fetchGoldRate();
