const puppeteer = require('puppeteer');
const fs = require('fs');

async function getGoldRate() {
  let browser;
  try {
    console.log('Starting the gold rate fetching process...');
    console.log('Launching headless browser...');

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('New page created.');

    console.log('Navigating to the gold rate page...');
    await page.goto('https://www.malabargoldanddiamonds.com/goldprice', { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully.');

    console.log('Waiting for the selector #show-rate-block to be available...');
    await page.waitForSelector('#show-rate-block', { timeout: 60000 });
    console.log('Selector #show-rate-block is now available.');

    console.log('Extracting gold rate and date from the page...');
    
    const rate = await page.evaluate(() => {
      console.log('Inside page.evaluate for extracting rate...');
      const element = document.querySelector('#show-rate-block .price.22kt-price');
      if (element) {
        console.log('Rate element found.');
        return element.textContent.trim();
      } else {
        console.log('Rate element not found.');
        return null;
      }
    });

    const date = await page.evaluate(() => {
      console.log('Inside page.evaluate for extracting date...');
      const element = document.querySelector('#show-rate-block .date.update-date');
      if (element) {
        console.log('Date element found.');
        return element.textContent.trim();
      } else {
        console.log('Date element not found.');
        return null;
      }
    });

    if (!rate || !date) {
      throw new Error('Failed to extract the gold rate or date. Rate or date is null.');
    }

    console.log('Gold rate:', rate);
    console.log('Date:', date);

    const newRow = `<tr><td>${date}</td><td>${rate}</td></tr>`;
    const filePath = 'index.html';
    console.log('Reading existing index.html content...');
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('Existing index.html content read.');

    const tableEndIndex = content.lastIndexOf('</tbody>');
    if (tableEndIndex === -1) {
      throw new Error('No </tbody> tag found in index.html');
    }
    
    console.log('Appending new row to index.html...');
    content = content.slice(0, tableEndIndex) + newRow + content.slice(tableEndIndex);
    fs.writeFileSync(filePath, content);
    console.log('index.html has been updated with the new gold rate.');

  } catch (error) {
    console.error('Error occurred while fetching the gold rate:', error);
    process.exit(1);
  } finally {
    if (browser) {
      console.log('Closing the browser...');
      await browser.close();
      console.log('Browser closed.');
    }
  }
}

getGoldRate();
