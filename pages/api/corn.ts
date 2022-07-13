import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers;

      console.log(
        authorization,
        process.env.API_SECRET_KEY,
        authorization === `Bearer ${process.env.API_SECRET_KEY}`
      );

      if (authorization === `Bearer ${process.env.API_SECRET_KEY}`) {
        await juejinCheckIn();

        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

async function juejinCheckIn() {
  const headers = {
    cookie: process.env.JUEJIN_COOKIE
  };

  const checkInStatus: AxiosResponse<{ err_no: number; data: boolean }> =
    await axios.get('https://api.juejin.cn/growth_api/v1/get_today_status', {
      // @ts-ignore
      headers,
      credentials: 'include'
    });
  const { data: statusData } = checkInStatus;
  if (statusData.err_no !== 0) return console.warn('查询签到状态失败！');
  if (statusData.data) {
    console.log('今天已经签到了！');
    return;
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
    return console.warn(`签到失败: ${checkInData.err_msg}`);
  }

  console.log(`签到成功！当前积分；${checkInData.data.sum_point}`);
}
