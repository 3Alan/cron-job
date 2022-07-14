## 简介
这是一个利用 `github actions` + `Vercel` 实现的定时任务程序。

## 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F3Alan%2Fcron-job&env=API_SECRET_KEY&envDescription=github%20action%20%E5%AF%B9%E5%BA%94%E7%9A%84%20secret)

## Vercel 环境变量
| 变量 | 备注 |
| --- | --- |
| API_SECRET_KEY | github actions 调用接口的密钥，需要在 `github` 仓库和 `vercel` 中同时配置 |
| EMAIL_FROM | email 发送者，ex: "昵称" <xxx@qq.com> |
| EMAIL_TO | 接受邮件的 email |
| EMAIL_USER | 邮箱服务的用户名 |
| EMAIL_PASS | 邮箱服务的密码 |

## 想法
- [ ] 环境变量可视化配置
- [ ] 通过钩子在 `yarn install` 时通过 `vercel env add` 遍历添加所有 `vercel` 环境变量，然后再本地可视化修改环境变量后再遍历将环境变量推送上去