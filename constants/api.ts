import axios from 'axios';

const juejinAxios = axios.create({
  baseURL: 'https://api.juejin.cn/',
  headers: {
    cookie: process.env.JUEJIN_COOKIE || ''
  }
});

juejinAxios.interceptors.response.use(
  function (response) {
    if (response.data.err_no) {
      throw new Error(response.data.err_msg);
    }
    return response.data.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/**
 * 掘金当天是否签到
 */
export const juejinCheckInStatus = () =>
  juejinAxios.get('/growth_api/v1/get_today_status');

/**
 * 掘金签到
 */
export const juejinCheckIn: any = () =>
  juejinAxios.post('/growth_api/v1/check_in', null);

/**
 * 掘金免费抽奖次数
 */
export const juejinLotteryStatus: any = () =>
  juejinAxios.get('/growth_api/v1/lottery_config/get');

/**
 * 掘金免费抽奖接口
 */
export const juejinLottery: any = () =>
  juejinAxios.post('/growth_api/v1/lottery/draw', null);

/**
 * 掘金签到天数信息
 */
export const juejinCheckInDays: any = () =>
  juejinAxios.get('/growth_api/v1/get_counts');

/**
 * 掘金矿石数
 */
export const juejinPoint = () =>
  juejinAxios.get('/growth_api/v1/get_cur_point');

/**
 * 掘金抽奖中奖人信息
 */
export const juejinLotteryHistory: any = () =>
  juejinAxios.post('/growth_api/v1/lottery_history/global_big', null, {
    params: { page_no: 1, page_size: 5 }
  });

/**
 * 掘金沾喜气
 */
export const juejinDipLucky: any = (id: string) =>
  juejinAxios.post('/growth_api/v1/lottery_lucky/dip_lucky', {
    lottery_history_id: id
  });

/**
 * 当前喜气值
 */
export const juejinLucky: any = () =>
  juejinAxios.post('/growth_api/v1/lottery_lucky/my_lucky', null);
