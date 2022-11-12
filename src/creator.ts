import { join } from "path";
import * as fs from 'fs';
import { PDFInformation } from "./types";
import * as hb from 'handlebars';
import puppeteer, { Browser, Page } from 'puppeteer';
import report from 'puppeteer-report';

export default async function create(pdfData:any): Promise<PDFInformation> {
    let browser;
    let pathToPDF = '';
    const html = getTemplate();
    const logo = fs.readFileSync(join(process.cwd(), `static/img/logo.png`)).toString('base64');
    const tmpFilePath = getTmpFilePath();

    const document = {
        html,
        data: { ...pdfData, logo },
    };
    pathToPDF = await setupPageAndConvertToPDF(browser, document.data, document.html, tmpFilePath);
    const pdfInformation = {
        orderDate: new Date(pdfData.orderDateString),
        path: pathToPDF,
    };
    return pdfInformation;
}

export async function setupPageAndConvertToPDF(
    existingBrowser: Browser | undefined,
    data: any,
    html: any,
    tmpFilePath: string
  ): Promise<string> {
    registerHandlebarHelpers();
    let browser = existingBrowser;
    let pathToPDF = '';
    try {
      if (!browser) browser = await startBrowser();
      const page = await openNewIcognitoWebpage(browser);
      const content = await hb.compile(html)(data);
      await page.goto(`data: text/html,${content}`, {
        waitUntil: 'networkidle0',
      });
      await page.setContent(content);
      // await page.emulateMediaType("screen");
      await report
        .pdfPage(page, {
          path: tmpFilePath,
          format: 'a4',
          printBackground: true,
          displayHeaderFooter: false,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '0mm',
            left: '10mm',
          },
        })
        .then(() => (pathToPDF = tmpFilePath));
    } catch (err) {
      console.log(err);
    } finally {
      if (browser) await browser.close();
    }
    return pathToPDF;
  }

export function getTmpFilePath(): string {
    return join(join(process.cwd(), 'tmp'), `output${Date.now()}.pdf`);
  }
  
export function getTemplate(): string {
    return fs.readFileSync(
        join(process.cwd(), `static/template/template-vendor-order.html`),
        'utf-8'
    );
}
  function registerHandlebarHelpers() {
    hb.registerHelper('formatCurrency', function (currency: number) {
      const currencyFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      });
      return currencyFormatter.format(currency);
    });
  
    hb.registerHelper('formatOrderDate', function (dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    });
    hb.registerHelper('areBothValuesPresent', function (country: string, zipcode: string) {
      return country && zipcode;
    });
  }
  
  export async function openNewIcognitoWebpage(existingBrowser: Browser): Promise<Page> {
    let browser = existingBrowser;
    if (!browser) {
      browser = await startBrowser();
    }
    const context = await browser.createIncognitoBrowserContext();
    return await context.newPage();
  }
  
  export async function startBrowser(): Promise<Browser> {
    return await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true,
      //executablePath: chromiumBin,
    });
  }
  
  export async function closeBrowser(browser: Browser) {
    browser.close();
  }
