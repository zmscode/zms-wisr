/*
 * ---
 * Wisr ABN Tool
 * ---
 * 
 * ## ## ## ## ## ## ## ## ##
 * 
 * ---
 * zms - 05 FEB 25
 * ---
 * 
 */

import { chromium } from 'playwright';

let browser = null;
let context = null;

async function initBrowser() {
    if (!browser) {
        browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--disable-features=site-per-process',
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--disable-notifications',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-component-update',
                '--disable-domain-reliability',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-renderer-backgrounding',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--no-default-browser-check',
                '--safebrowsing-disable-auto-update',
                '--window-size=1280,720'
            ]
        });

        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ignoreHTTPSErrors: true,
            javaScriptEnabled: true,
            bypassCSP: true,
            serviceWorkers: 'block',
            screen: { width: 1280, height: 720 },
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            locale: 'en-US',
            timezoneId: 'Australia/Sydney',
        });

        context.setDefaultTimeout(3000);
        context.setDefaultNavigationTimeout(3000);
    }
}

async function scrapeABNDetails(abn) {
    abn.replace(/[^0-9]/g, '');
    const page = await context.newPage();
    
    try {
        await page.route('**/*', route => {
            const request = route.request();
            const resourceType = request.resourceType();
            const shouldBlock = ['image', 'stylesheet', 'font', 'media', 'websocket', 'manifest', 'other'].includes(resourceType);
            
            if (shouldBlock || request.url().includes('.css') || request.url().includes('.jpg') || request.url().includes('.png')) {
                route.abort();
            } else if (resourceType === 'script') {
                if (!request.url().includes('essential-script')) {
                    route.abort();
                } else {
                    route.continue();
                }
            } else {
                route.continue();
            }
        });

        const response = await page.goto(`https://abr.business.gov.au/ABN/View?abn=${abn}`, {
            waitUntil: 'domcontentloaded',
            timeout: 3000
        });

        if (!response.ok()) {
            throw new Error(`HTTP error! status: ${response.status()}`);
        }

        await page.waitForSelector('table tbody tr', {
            timeout: 2000,
            state: 'visible'
        });

        const abnDetails = await page.evaluate(() => {
            const rows = document.querySelectorAll('table tbody tr');
            let details = '';
            let foundABNTable = false;

            for (const row of rows) {
                const label = row.querySelector('th')?.textContent?.trim();
                const value = row.querySelector('td')?.textContent?.trim();
                
                if (label && value) {
                    if (label.includes('Entity name') || label.includes('ABN status')) {
                        foundABNTable = true;
                    }
                    
                    if (foundABNTable) {
                        details += `${label} ${value}\n`;
                        if (details.includes('Main business location')) {
                            break;
                        }
                    }
                }
            }
            return details.trim();
        });

        return abnDetails;

    } catch (error) {
        console.error(`Error scraping ABN ${abn}:`, error.message);
        throw error;
    } finally {
        await page.close().catch(() => {});
    }
}

async function cleanup() {
    if (browser) {
        await browser.close().catch(() => {});
        browser = null;
        context = null;
    }
}

let isInitialized = false;
let cleanupTimeout;

async function lookupABN(abn) {
    if (!isInitialized) {
        await initBrowser();
        isInitialized = true;
    }
    
    try {
        console.time('scraping');
        const data = await scrapeABNDetails(abn);
        console.timeEnd('scraping');
        if (data) console.log(data);

        clearTimeout(cleanupTimeout);
        cleanupTimeout = setTimeout(async () => {
            await cleanup();
            process.exit(0);
        }, 100);

        return data;
    } catch (error) {
        console.error('Lookup failed:', error);
        await cleanup();
        process.exit(1);
    }
}

lookupABN('39119503221');