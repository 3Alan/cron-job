import { juejinDipLucky, juejinLucky } from './../constants/api';
import {
  juejinCheckIn,
  juejinCheckInDays,
  juejinCheckInStatus,
  juejinLottery,
  juejinLotteryHistory,
  juejinLotteryStatus,
  juejinPoint
} from '../constants/api';

let checkInInfo = '';
let checkInResult = '';
let lotteryResult = '';
let dipLuckyResult = '';

// 抽奖
const lottery = async () => {
  try {
    // 查询今日是否有免费抽奖机会
    const { free_count } = await juejinLotteryStatus();

    if (free_count === 0) {
      lotteryResult = '今日已经免费抽奖！✅<br/>';
      return;
    }

    // 免费抽奖
    const { lottery_name } = await juejinLottery();
    lotteryResult = `抽到了 ${lottery_name}🎉<br/>`;
  } catch (error) {
    lotteryResult = `免费抽奖失败！❌ ${error}<br/>`;
  }
};

const getCheckInInfo = async () => {
  try {
    const [checkInDays, point] = await Promise.all([
      juejinCheckInDays(),
      juejinPoint()
    ]);
    const { cont_count, sum_count } = checkInDays;

    checkInInfo = `
    连续签到天数：${cont_count}<br/>
    累计签到天数: ${sum_count}<br/>
    矿石数💎:${point}<br/>
    `;
  } catch (error) {
    checkInInfo = `
    查询签到信息失败！❌<br/>
    `;
  }
};

/**
 * 沾喜气
 */
const dipLucky = async () => {
  const { count, lotteries } = await juejinLotteryHistory();
  let dipResult = '';

  if (count > 0) {
    const firstUser = lotteries[0];
    const { has_dip, dip_value } = await juejinDipLucky(firstUser.history_id);

    if (has_dip) {
      dipResult = '今天已经沾过喜气! ✅<br/>';
    } else {
      dipResult = `沾到喜气： ${dip_value}<br/>`;
    }
  }

  const { total_value } = await juejinLucky();
  dipLuckyResult = `${dipResult} 当前喜气值✨ ${total_value}<br/>`;
};

const checkIn = async () => {
  const checkInStatusData = await juejinCheckInStatus();
  if (checkInStatusData) {
    checkInResult = '今天已经签到了！✅<br/>';
    return;
  }

  // 签到
  const { sum_point } = await juejinCheckIn();
  checkInResult = `签到成功！当前积分：${sum_point}✅<br/>`;
};

export default async function juejin() {
  await getCheckInInfo();
  await checkIn();
  await lottery();
  await dipLucky();

  return `${checkInInfo} ${checkInResult} ${lotteryResult} ${dipLuckyResult}`;
}
