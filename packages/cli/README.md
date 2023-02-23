# best-chain-cli

> Cli

### 普通web部署

命令 `bci cocos server`

命令会在执行命令的目录下查找`bc-deploy.js`部署配置文件。如果不存在可使用命令`pnpm create bct --template deploy-config --no 1`创建。配置文件参数具体内容，查看create-bc包中的readme.md.

------------

### cocos 部署

命令 `bci cocos [type]`

目前有4种type，对应的type是：

- 底包流程：`bci cocos base` or `bci cocos b`
- 热更包流程: `bci cocos hot` or `bci cocos h`
- 压缩本地文件并上传: `bci cocos push` or `bci cocos p`
- 强制更新证书: `bci cocos match` or `bci cocos m`

### TODO

- [ ] git 操作
- [ ] 部署文件自动从git拉取
- [ ] 测试文件

## License

[MIT](LICENSE).