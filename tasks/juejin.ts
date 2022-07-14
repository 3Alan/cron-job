import axios, { AxiosResponse } from 'axios';

export default async function juejinCheckIn() {
  const headers = {
    cookie: process.env.JUEJIN_COOKIE
  };
  let result;

  const checkInStatus: AxiosResponse<{ err_no: number; data: boolean }> =
    await axios.get('https://api.juejin.cn/growth_api/v1/get_today_status', {
      // @ts-ignore
      headers,
      credentials: 'include'
    });
  const { data: statusData } = checkInStatus;
  if (statusData.err_no !== 0) {
    result = '查询签到状态失败！';
    return result;
  }
  if (statusData.data) {
    result = '今天已经签到了！';
    return result;
  }

  // 签到
  const checkIn: AxiosResponse<
    { err_no: number; err_msg: string; data: { sum_point: number } },
    any
  > & {
    err_no: number;
  } = await axios.post('https://api.juejin.cn/growth_api/v1/check_in', null, {
    // @ts-ignore
    headers,
    credentials: 'include'
  });

  const { data: checkInData } = checkIn;
  if (checkInData.err_no !== 0) {
    result = `签到失败: ${checkInData.err_msg}`;
    return result;
  }

  return `签到成功！当前积分；${checkInData.data.sum_point}`;
}
