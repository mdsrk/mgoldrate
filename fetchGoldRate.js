const puppeteer = require('puppeteer');
const fs = require('fs');

async function getGoldRate() {
  let browser;
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('Navigating to gold rate page...');
    await page.goto('https://www.malabargoldanddiamonds.com/goldprice', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.price.22kt-price', { timeout: 120000 });
    console.log('Extracting gold rate and date...');
    const rate = await page.$eval('.price.22kt-price', el => el.textContent.trim());
    const date = await page.$eval('.date.update-date', el => el.textContent.trim());
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
