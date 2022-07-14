import axios from 'axios';

const juejinFetchConfig = {
  headers: {
    cookie: process.env.JUEJIN_COOKIE
  },
  credentials: 'include'
};

/**
 * 掘金当天是否签到
 */
export const juejinCheckInStatus = () =>
  axios.get(
    'https://api.juejin.cn/growth_api/v1/get_today_status',
    // @ts-ignore
    juejinFetchConfig
  );

/**
 * 掘金签到
 */
export const juejinCheckIn = () =>
  axios.post(
    'https://api.juejin.cn/growth_api/v1/check_in',
    null,
    // @ts-ignore
    juejinFetchConfig
  );

/**
 * 掘金免费抽奖次数
 */
export const juejinLotteryStatus = () =>
  axios.get(
    'https://api.juejin.cn/growth_api/v1/lottery_config/get',
    // @ts-ignore
    juejinFetchConfig
  );

/**
 * 掘金免费抽奖接口
 */
export const juejinLottery = () =>
  axios.post(
    'https://api.juejin.cn/growth_api/v1/lottery/draw',
    null,
    // @ts-ignore
    juejinFetchConfig
  );

/**
 * 掘金签到天数信息
 */
export const juejinCheckInDays = () =>
  axios.get(
    'https://api.juejin.cn/growth_api/v1/get_counts',
    // @ts-ignore
    juejinFetchConfig
  );

/**
 * 掘金矿石数
 */
export const juejinPoint = () =>
  axios.get(
    'https://api.juejin.cn/growth_api/v1/get_cur_point',
    // @ts-ignore
    juejinFetchConfig
  );
