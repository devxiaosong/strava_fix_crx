# 使用指南

## 🎉 项目初始化完成！

你的 Plasmo + Ant Design Chrome 插件已经成功创建并准备好使用了！

## 📁 项目结构

```
strava_fix_crx/
├── src/             # 源代码目录
│   ├── popup.tsx   # Popup 页面组件（使用 Ant Design）
│   └── style.css   # 样式文件
├── assets/          # 图标资源文件夹
│   └── icon.png    # 插件图标（512x512）
├── build/           # 构建输出目录
│   ├── chrome-mv3-dev/   # 开发版本
│   └── chrome-mv3-prod/  # 生产版本
├── package.json     # 项目配置
└── tsconfig.json    # TypeScript 配置
```

## 🚀 开发模式

开发服务器已经在后台运行！访问：

- **开发版本目录**: `build/chrome-mv3-dev/`
- **HMR 端口**: 1815（热更新）
- **开发服务器端口**: 1012

如果需要重新启动开发服务器：

```bash
pnpm dev
```

## 📦 加载到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择项目中的 **`build/chrome-mv3-dev`** 目录
6. 完成！点击浏览器右上角的插件图标即可看到 "Hello World" 页面

## 🎨 功能特性

- ✅ **Popup 弹窗**: 点击插件图标显示弹窗界面
- ✅ **Ant Design UI**: 使用 Ant Design 组件库
- ✅ **TypeScript**: 完整的类型支持
- ✅ **热更新**: 代码修改后自动重新加载
- ✅ **响应式布局**: 350px 宽度的美观界面

## 🛠️ 常用命令

```bash
# 开发模式（已启动）
pnpm dev

# 生产构建
pnpm build

# 打包 ZIP（用于发布）
pnpm package
```

## 📝 修改插件

### 编辑 Popup 页面

修改 `src/popup.tsx` 文件：

```typescript
import { Button, Typography } from "antd"
import { useState } from "react"

const { Title } = Typography

function IndexPopup() {
  return (
    <div className="popup-container">
      <Title level={3}>Hello World</Title>
      {/* 在这里添加你的组件 */}
    </div>
  )
}

export default IndexPopup
```

### 修改样式

编辑 `src/style.css` 文件来自定义样式。

### 更换图标

替换 `assets/icon.png` 文件（建议使用 512x512 像素的图片）。

## 🔧 添加更多功能

Plasmo 支持多种扩展功能：

- **Background Script**: 在 `src/` 目录创建 `background/index.ts`
- **Content Script**: 在 `src/` 目录创建 `contents/*.tsx`
- **Options 页面**: 在 `src/` 目录创建 `options.tsx`
- **New Tab 页面**: 在 `src/` 目录创建 `newtab.tsx`

详细文档：https://docs.plasmo.com/

## 💡 提示

- 修改代码后，插件会自动重新加载（热更新）
- 如果遇到问题，尝试重启开发服务器
- 生产构建前记得测试所有功能

## 🎯 下一步

1. 打开 Chrome 并加载插件
2. 点击插件图标查看 "Hello World" 页面
3. 修改 `src/popup.tsx` 开始开发你的功能
4. 享受 Plasmo + Ant Design 带来的开发体验！

---

**祝开发愉快！** 🚀

