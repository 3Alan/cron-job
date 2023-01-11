import { NextApiRequest, NextApiResponse } from 'next';
// vercel有50mb的限制 https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  // if (authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
  //   res.status(401).json({ success: false });
  //   return;
  // }

const LOCAL_CHROME_EXECUTABLE =
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  const executablePath = (await chromium.executablePath) || LOCAL_CHROME_EXECUTABLE;

  const browser = await puppeteer.launch({
    executablePath,
    headless: false,
    devtools: true,
    slowMo: 250, // slow down by 250ms
    defaultViewport: { width: 1440, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  // page.on('console', msg => console.log('PAGE LOG:', JSON.stringify(msg)));

  const cookieArgs = JSON.parse(process.env.JUEJIN_COOKIE_JSON || '[]').map((item: any) => ({
    name: item.name,
    value: item.value,
    domain: item.domain,
    path: item.path,
    expires: item.expirationDate,
    httpOnly: item.httpOnly,
    secure: item.secure,
    sameSite: item.sameSite
  }));
  await page.setCookie(...cookieArgs);

  await page.goto('https://juejin.cn/user/center/signin?from=main_page', {
    waitUntil: 'domcontentloaded'
  });

  await page.screenshot();
  const isComplete = (await (await page.$$('button[class="signin btn"]')).length) === 0;

  // 沾喜气
  await page.goto('https://juejin.cn/user/center/lottery?from=lucky_lottery_menu_bar', {
    waitUntil: 'domcontentloaded'
  });
  await sleep(1000);
  await page.click('svg[class="stick-btn"]');

  if (isComplete) {
    page.evaluate(async () => {
      //打印日志
      console.log('isComplete');
    });
  } else {
    // 签到操作
    await page.click('button[class="signin btn"]');
  }
  await page.close();
  await browser.close();
  res.status(200).json({ success: true, isComplete });
}
