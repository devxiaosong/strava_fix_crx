# Strava Fix Chrome Extension

这是一个使用 Plasmo 框架和 Ant Design 构建的 Chrome 插件项目。

## 技术栈

- [Plasmo](https://docs.plasmo.com/) - Chrome 插件开发框架
- [React](https://reactjs.org/) - UI 框架
- [Ant Design](https://ant.design/) - UI 组件库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

## 开发指南

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
```

运行开发命令后，会在 `build/chrome-mv3-dev` 目录生成开发版本。

### 加载插件到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目中的 `build/chrome-mv3-dev` 目录

### 打包生产版本

```bash
npm run build
# 或
pnpm build
```

打包后的文件会生成在 `build/chrome-mv3-prod` 目录。

## 项目结构

```
.
├── src/               # 源代码目录
│   ├── popup.tsx     # Popup 页面组件
│   └── style.css     # 样式文件
├── assets/           # 资源文件目录
│   └── icon.png      # 插件图标
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
└── README.md         # 项目说明
```

## 功能特性

- ✅ Popup 弹窗界面
- ✅ Ant Design UI 组件
- ✅ TypeScript 支持
- ✅ 热更新开发体验

## License

MIT
