# next 依赖分析

基于 ast 的 next 依赖分析工具。

## 使用

先全局安装下：`yarn global add next-analysis`

然后进入到 next 项目的更目录，执行`next-analysis run` 分析引用得到引用文件`next-analysis.json`

最后执行`next-analysis server`或者`next-analysis server -p 3000`（默认 8080 端口）

访问`localhost:8080`可以看到页面。`localhost:8080/api/json`可以看到接口

## 开发

```
▸  app/          前端代码
▸  bin/          cli入口
▸  server/       后端代码
▸  src/          cli引用分析代码
   package.json
   README.md
   tsconfig.json
   yarn.lock
```

1. 先分别在根目录、app 目录、server 目录跑一下`yarn`安装依赖
2. 核心代码在 src 下，打开`src/index.ts`修改`devProjPath`变量，改为自己系统中的 next 项目的绝对路径。在根目录执行`yarn dev`会分析代码产生`next-analysis.json`、`next-analysis.log`。主要是 json 文件，log 是给你看日志用的
3. server 是基于 nest.js 框架起的 node 服务，会读取上面生成的 json 文件，基于这份文件提供接口做些事情。controller 暴露接口，service 写逻辑代码。进入到 server 后执行`yarn dev`，访问`localhost:8080/api/json`可以看到输出（建议 Chrome 安装下 json 可视化插件）
4. app 是基于 react 的 UI 层，美化一下输出。用了 vite 打包。进入 app 后执行`yarn dev`，`打开localhost:3000`看效果
5. server 和 app 都会打包完复制到 dist 目录下。作为 cli 的一部分导出

## 发布

1. 根目录下 `yarn dist`，会分别执行根目录、server目录、app目录的build
2. 修改`package.json`的`version`
3. `npm publish`

