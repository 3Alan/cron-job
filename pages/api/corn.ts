import { NextApiRequest, NextApiResponse } from 'next';
import juejin from '../../tasks/juejin';
import sendEmail from '../../utils/sendEmail';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { authorization } = req.headers;

      if (authorization === `Bearer ${process.env.API_SECRET_KEY}`) {
        const result = await juejin();
        await sendEmail({
          from: process.env.EMAIL_FROM,
          to: process.env.EMAIL_TO,
          subject: '今日通知 ✅',
          html: result
        });

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
