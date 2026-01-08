# Strava 批量编辑功能使用说明

## 🎯 功能介绍

这个 Chrome 插件为 Strava 训练日志页面添加了批量编辑功能，可以一次性修改多个活动的属性。

## ✨ 支持的功能

- 🚴 **批量修改骑行类型**：Race、Workout、Long Run 等
- 🚲 **批量更换自行车**：快速切换不同的自行车设备
- 👟 **批量更换跑鞋**：统一更新跑步活动的鞋子
- 🔒 **批量设置隐私**：统一设置活动的可见性（所有人/关注者/仅自己）

## 📦 技术栈

- **Plasmo Framework** - Chrome 插件开发框架
- **React 18** - UI 框架
- **Ant Design 5** - UI 组件库
- **TypeScript** - 类型安全

## 🚀 使用方法

### 1. 安装插件

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build
```

### 2. 加载到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `build/chrome-mv3-dev` 目录

### 3. 使用插件

1. 访问 Strava 训练日志页面：
   ```
   https://www.strava.com/athlete/training
   ```

2. 在页面的搜索面板下方会自动显示"批量更新活动"面板

3. 选择要修改的字段：
   - **骑行类型**：从下拉菜单选择新的骑行类型
   - **自行车**：选择要更换的自行车
   - **跑鞋**：选择要更换的跑鞋
   - **隐私设置**：选择可见性级别

4. 点击"批量更新活动"按钮

5. 插件会自动：
   - ✅ 打开每个活动的快速编辑模式
   - ✅ 填充选定的值
   - ✅ 自动提交修改
   - ✅ 自动翻页处理多页活动
   - ✅ 完成后返回第一页

## 📝 注意事项

### ⚠️ 重要提示

1. **筛选活动**：建议先使用 Strava 的筛选功能过滤出需要修改的活动
2. **字段可用性**：不是所有活动都有所有字段（如跑步活动没有自行车字段）
3. **更新速度**：批量更新需要时间，请勿在更新过程中关闭页面
4. **网络连接**：确保网络连接稳定，避免更新失败

### 🔍 工作原理

```
1. 用户选择要修改的字段
   ↓
2. 插件点击所有活动的"快速编辑"按钮
   ↓
3. 自动填充选定的值到表单
   ↓
4. 自动提交每个活动的修改
   ↓
5. 如果有下一页，自动翻页继续
   ↓
6. 完成后返回第一页
```

## 🛠️ 项目结构

```
src/
├── contents/
│   ├── strava-bulk-edit.tsx    # Content Script 主文件
│   └── strava-bulk-edit.css    # 样式文件
├── components/
│   ├── BulkEditPanel.tsx       # 批量编辑面板组件
│   └── LoadingModal.tsx        # 加载状态模态框
├── utils/
│   └── stravaUpdater.ts        # 核心更新逻辑
└── types/
    └── strava.ts               # TypeScript 类型定义
```

## 🔧 开发说明

### Content Script 配置

```typescript
export const config: PlasmoCSConfig = {
  matches: ["https://www.strava.com/athlete/training*"],
  run_at: "document_end",
  world: "MAIN"
}
```

### 挂载位置

```typescript
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  return document.querySelector(".search .panel")
}
```

插件会在搜索面板后面插入 UI。

## 📊 更新流程

### 核心函数：`updateActivities`

```typescript
export const updateActivities = async (
  fields: BulkEditFields,
  onProgress?: (status: UpdateStatus) => void
): Promise<void>
```

**参数**：
- `fields`: 要更新的字段对象
- `onProgress`: 进度回调函数

**流程**：
1. 更新当前页所有活动
2. 检查是否有下一页
3. 如果有，翻页并递归调用
4. 完成后返回第一页

## 🎨 UI 组件

### BulkEditPanel

主要的编辑面板组件，包含：
- 表单字段选择器
- 提交按钮
- 进度显示

### LoadingModal

加载状态模态框，显示：
- 加载动画
- 当前进度（已完成/总数）
- 进度条

## 🐛 故障排除

### 问题：插件面板没有显示

**解决方案**：
1. 确认你在正确的页面（训练日志页面）
2. 刷新页面重试
3. 检查控制台是否有错误

### 问题：更新失败

**解决方案**：
1. 检查网络连接
2. 确认 Strava 网站可以正常访问
3. 尝试手动编辑一个活动，确认账号权限正常

### 问题：某些活动没有更新

**原因**：
- 该活动可能不支持选定的字段
- 例如：跑步活动没有"自行车"字段

## 📄 许可证

MIT License

## 🙏 致谢

- Plasmo Framework
- Ant Design
- React
- Strava API

---

**Happy Training! 🚴‍♂️🏃‍♂️**

