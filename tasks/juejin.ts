import {
  juejinCheckIn,
  juejinCheckInDays,
  juejinCheckInStatus,
  juejinLottery,
  juejinLotteryStatus,
  juejinPoint
} from '../constants/api';

// 抽奖
const lottery = async () => {
  // 查询今日是否有免费抽奖机会
  const lotteryStatus = await juejinLotteryStatus();
  const { data: lotteryStatusData } = lotteryStatus;

  if (lotteryStatusData.err_no !== 0) return '<div>免费抽奖失败！❌</div>';
  if (lotteryStatusData.data.free_count === 0)
    return '<div>今日已经免费抽奖！✅</div>';

  // 免费抽奖
  const lottery = await juejinLottery();
  const { data: lotteryData } = lottery;

  if (lotteryData.err_no !== 0) return '<div>免费抽奖失败！❌</div>';
  return `<div>抽到了 ${lotteryData.data.lottery_name}🎉</div>`;
};

const getCheckInInfo = async () => {
  try {
    const [checkInDays, point] = await Promise.all([
      juejinCheckInDays(),
      juejinPoint()
    ]);
    const { data: checkInDaysData } = checkInDays;
    const { data: pointData } = point;

    return `<div>连续签到天数：${checkInDaysData.data.cont_count}</div> <div>累计签到天数
  : ${checkInDaysData.data.sum_count}</div> <div>矿石数💎:${pointData.data}</div>`;
  } catch (error) {
    return `<div>查询签到信息失败！❌</div>`;
  }
};

export default async function juejin() {
  let result = await getCheckInInfo();

  const checkInStatus = await juejinCheckInStatus();
  const { data: statusData } = checkInStatus;
  if (statusData.err_no !== 0) {
    result = result + '<div>查询签到状态失败！❌</div>' + (await lottery());
    return result;
  }
  if (statusData.data) {
    result = result + '<div>今天已经签到了！✅</div>' + (await lottery());
    return result;
  }

  // 签到
  const checkIn = await juejinCheckIn();
  const { data: checkInData } = checkIn;
  if (checkInData.err_no !== 0) {
    result =
      result +
      `<div>签到失败: ${checkInData.err_msg}❌</div>` +
      (await lottery());
    return result;
  }

  return (
    `<div>签到成功！当前积分；${checkInData.data.sum_point}</div>✅` +
    (await lottery())
  );
}
