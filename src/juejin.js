import puppeteer from 'puppeteer';
import sendEmail from './utils/sendEmail.js';

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function sleep(ms, isRandom = false) {
  // 100ms上下浮动，防止被检测
  const finalTime = isRandom ? ms + randomRange(-100, 100) : ms;

  return new Promise(resolve => {
    setTimeout(resolve, finalTime);
  });
}

export default async function handler() {
  try {
    const browser = await puppeteer.launch({
      // TODO: 根据环境变量dev开启
      // headless: false,
      slowMo: 250, // slow down by 250ms
      defaultViewport: { width: 1280, height: 1200 }
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    // page.on('console', msg => console.log('PAGE LOG:', JSON.stringify(msg)));

    const cookieArgs = JSON.parse(process.env.JUEJIN_COOKIE_JSON || '[]').map(item => ({
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
    // 页面有动画
    await sleep(1000);

    const isComplete = (await (await page.$$('button[class="signin btn"]')).length) === 0;
    if (!isComplete) {
      // 签到操作
      await page.click('button[class="signin btn"]');
    }
    const checkInImgBuffer = await page.screenshot();

    // 沾喜气
    await page.goto('https://juejin.cn/user/center/lottery?from=lucky_lottery_menu_bar', {
      waitUntil: 'domcontentloaded'
    });
    await sleep(1000, true);
    await page.click('svg[class="stick-btn"]');
    const lotteryImgBuffer = await page.screenshot();

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
  } catch (err) {
    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '定时任务通知 ✅',
      html: err.message
    });
  }
}
