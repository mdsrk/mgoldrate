const puppeteer = require('puppeteer');
const fs = require('fs');

async function getGoldRate() {
  let browser;
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    console.log('Navigating to the gold rate page...');
    await page.goto('https://www.malabargoldanddiamonds.com/goldprice', {
      waitUntil: 'networkidle2',
    });

    console.log('Page loaded successfully.');
    console.log('Waiting for the #show-rate-block element to be available...');
    await page.waitForSelector('#show-rate-block');

    console.log('#show-rate-block element is now available.');

    // Extract the HTML content of the #show-rate-block element
    const htmlContent = await page.$eval('#show-rate-block', el => el.innerHTML);
    console.log('HTML content of #show-rate-block:\n', htmlContent);

    // Extract the gold rate and date by accessing the span elements directly
    const [rate, date] = await page.evaluate(() => {
      const rateElement = document.querySelector('#show-rate-block .price.22kt-price');
      const dateElement = document.querySelector('#show-rate-block .date.update-date');
      return [rateElement ? rateElement.textContent.trim() : null, dateElement ? dateElement.textContent.trim() : null];
    });

    if (!rate || !date) {
      throw new Error('Failed to extract the gold rate or date from the HTML content.');
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
    console.error('Error occurred while fetching the gold rate:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

getGoldRate();
