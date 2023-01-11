import { NextApiRequest, NextApiResponse } from 'next';
// vercel有50mb的限制 https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725
// https://github.com/vercel/virtual-event-starter-kit/blob/main/lib/screenshot.ts
// vercel 有10s限制
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import sendEmail from '../../utils/sendEmail';

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function sleep(ms: number, isRandom = false) {
  // 100ms上下浮动，防止被检测
  const finalTime = isRandom ? ms + randomRange(-100, 100) : ms;

  return new Promise(resolve => {
    setTimeout(resolve, finalTime);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  // if (authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
  //   res.status(401).json({ success: false });
  //   return;
  // }
  // res.status(200).json({ success: true, message: 'executing...' });

  try {
    const LOCAL_CHROME_EXECUTABLE =
      process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    const executablePath = (await chromium.executablePath) || LOCAL_CHROME_EXECUTABLE;
    console.log(executablePath, 'executablePath');

    const browser = await puppeteer.launch({
      executablePath,
      // headless: false,
      defaultViewport: { width: 1440, height: 1000 },
      args: chromium.args
    });
    console.log('launch');
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    console.log('setDefaultNavigationTimeout');
    
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

    console.log('setCookie');

    await page.goto('https://juejin.cn/user/center/signin?from=main_page', {
      waitUntil: 'domcontentloaded'
    });
    // 页面有动画
    await sleep(1000);

    const isComplete = (await (await page.$$('button[class="signin btn"]')).length) === 0;
    if (!isComplete) {
      // 签到操作
      await page.click('button[class="signin btn"]');
    }
    const checkInImgBuffer = (await page.screenshot()) as Buffer;

    // 沾喜气
    await page.goto('https://juejin.cn/user/center/lottery?from=lucky_lottery_menu_bar', {
      waitUntil: 'domcontentloaded'
    });
    await sleep(1000, true);
    await page.click('svg[class="stick-btn"]');
    const lotteryImgBuffer = (await page.screenshot()) as Buffer;

    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '定时任务通知 ✅',
      html: `<img src="data:image/png;base64,${checkInImgBuffer.toString(
        'base64'
      )}" /><img src="data:image/png;base64,${lotteryImgBuffer.toString('base64')}" />`
    });

    await page.close();
    await browser.close();
  } catch (err: any) {
    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '定时任务通知 ✅',
      html: err.message
    });
  }
}
