const puppeteer = require('puppeteer');
const fs = require('fs');

async function getGoldRate() {
  const url = 'https://www.malabargoldanddiamonds.com/goldprice';
  
  let browser;
  try {
    console.log('Starting the gold rate fetching process...');
    
    // Launch headless browser
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('New page created.');

    // Navigate to the page
    console.log('Navigating to the gold rate page...');
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully.');

    // Wait for the #show-rate-block element to be available
    console.log('Waiting for the #show-rate-block element to be available...');
    await page.waitForSelector('#show-rate-block', { timeout: 30000 });
    console.log('#show-rate-block element is now available.');

    // Extract HTML content of #show-rate-block
    const htmlContent = await page.evaluate(() => document.querySelector('#show-rate-block').innerHTML);
    console.log('HTML content of #show-rate-block:', htmlContent);

    // Extract gold rate and date
    console.log('Extracting gold rate and date from the page...');
    const rate = await page.evaluate(() => document.querySelector('.price.22kt-price')?.textContent.trim());
    const date = await page.evaluate(() => document.querySelector('.date.update-date')?.textContent.trim());

    console.log('Gold rate extracted:', rate || 'Not found');
    console.log('Date extracted:', date || 'Not found');

    if (!rate || !date) {
      throw new Error('Failed to extract gold rate or date.');
    }

    // Update the index.html file
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
