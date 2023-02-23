# best-chain-create-bc

### 主要用来创建项目模版或配置文件

命令: `pnpm create bct projectName`

目前可选择的有三种类型

- electron：此模版使用的技术有vite、typescript、electron、vue3
- cocos: 此模版是基于cocos creator 3.6.2 版本，包含了资源管理，场景管理、热更新等基础功能。因模版涉及的功能需要从已完成的小游戏中整理出来，所以暂未发布。
- deploy-config: 该部署配置文件模版是用来部署普通web文件或者cocos 热更新功能使用。
  命令: `pnpm create bct --template deploy-config --no 1`命令会在执行命令的目录下创建`bc-deploy.js`部署配置文件。配置文件参数具体含义会在文件中标明。

- [ ] cocos模版
- [x] 测试文件

## License

[MIT](LICENSE).