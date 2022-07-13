## Corn Job
`github actions` corn job

## Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F3Alan%2Fcron-job&env=API_SECRET_KEY&envDescription=github%20action%20%E5%AF%B9%E5%BA%94%E7%9A%84%20secret)

## 配置环境变量
- vercel 配置环境变量 `API_SECRET_KEY` `JUEJIN_COOKIE`(掘金cookie)
- github 仓库配置环境变量 `API_SECRET_KEY`，用来接口鉴权

## 功能
- [x] 掘金签到

## 想法
- [ ] 通过钩子在 `yarn install` 时拉取 `vercel`环境变量，然后再本地可视化修改环境变量后再将环境变量推送上去
- [ ] 邮件/微信 通知结果