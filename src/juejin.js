import puppeteer from 'puppeteer';
import isDev from './utils/isDev.js';
import sendEmail from './utils/sendEmail.js';
import sleep from './utils/sleep.js';

export default async function juejin() {
  const browser = await puppeteer.launch({
    headless: !isDev(),
    slowMo: 250, // slow down by 250ms
    defaultViewport: { width: 1440, height: 1200 }
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // page.on('console', msg => console.log('PAGE LOG:', JSON.stringify(msg)));

  try {
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
    await sleep(100, true);
    // TODO: 免费抽奖
    await page.click('svg[class="stick-btn"]');
    await sleep(1000);
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
      subject: '定时任务通知 ❌',
      html: err.message
    });
    await page.close();
    await browser.close();
  }
}
