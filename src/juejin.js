import puppeteer from 'puppeteer';
import closeModal from './utils/closeModal.js';
import getElementText from './utils/getElementText.js';
import isDev from './utils/isDev.js';
import sendEmail from './utils/sendEmail.js';
import sleep from './utils/sleep.js';

async function login(page) {
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
}

async function checkLoginByUserCenterPage(page) {
  const isLogin = (await (await page.$$('div.login-user')).length) === 0;
  return isLogin;
}

async function checkIn(page) {
  const isComplete = (await (await page.$$('button.signin')).length) === 0;
  if (!isComplete) {
    // 签到操作
    await page.click('button.signin');
    await sleep(1500);
  }
  const checkInImgBuffer = await page.screenshot();

  return checkInImgBuffer;
}

async function getLucky(page) {
  let lotteryResult;
  let luckyResult;
  await page.goto('https://juejin.cn/user/center/lottery?from=lucky_lottery_menu_bar', {
    waitUntil: 'networkidle0'
  });
  await sleep(100, true);

  const hasFreeCount = (await (await page.$$('div.text-free')).length) !== 0;
  if (hasFreeCount) {
    // 抽奖
    await page.click('div.text-free');
    lotteryResult = await getElementText(page, 'div.lottery_modal .title');
    // 关闭弹窗
    await closeModal(page, 'div.lottery_modal button.submit');
  } else {
    lotteryResult = '今日已免费抽奖';
  }

  // 沾喜气
  await page.click('svg.stick-btn');
  luckyResult = await getElementText(page, 'div.stick-lucky-modal .desc p');
  // 关闭弹窗
  await closeModal(page, 'div.stick-lucky-modal button.btn-submit');
  return { lotteryResult, luckyResult };
}

export default async function juejin() {
  const browser = await puppeteer.launch({
    headless: !isDev(),
    slowMo: isDev() ? 250 : 0, // slow down by 250ms
    defaultViewport: { width: 1440, height: 1200 }
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // page.on('console', msg => console.log('PAGE LOG:', JSON.stringify(msg)));

  try {
    await login(page);

    await page.goto('https://juejin.cn/user/center/signin?from=main_page', {
      waitUntil: 'networkidle0'
    });
    // 页面有动画
    await sleep(1000);

    const isLogin = await checkLoginByUserCenterPage(page);
    if (!isLogin) {
      await sendEmail({
        subject: '定时任务通知 ❌',
        text: 'Cookie 过期！'
      });
      await page.close();
      await browser.close();
      return;
    }

    const checkInImgBuffer = await checkIn(page);
    const { lotteryResult, luckyResult } = await getLucky(page);

    await sendEmail({
      subject: '定时任务通知 ✅',
      html: `<p>🎁免费抽奖结果：${lotteryResult}</p><p>🎉沾喜气：${luckyResult}</p><img src="data:image/png;base64,${checkInImgBuffer.toString(
        'base64'
      )}" />`
    });

    await page.close();
    await browser.close();
  } catch (err) {
    await sendEmail({
      subject: '定时任务通知 ❌',
      html: JSON.stringify(err.stack)
    });
    await page.close();
    await browser.close();
  }
}
