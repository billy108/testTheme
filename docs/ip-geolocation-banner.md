# IP Geolocation Banner 使用文档

## 组件概述

IP Geolocation Banner 是一个Shopify主题组件，用于根据用户的IP地理位置显示个性化横幅，引导用户访问特定地区的站点。组件支持多种IP检测方法，并提供灵活的配置选项。

## 功能特性

### 📍 地理位置检测
- **Shopify内置地理位置**：优先使用，符合GDPR
- **多API支持**：ipinfo.io、ipapi.co、ip-api.com等
- **API密钥支持**：支持ipstack等付费服务
- **缓存机制**：内存缓存+localStorage，24小时过期

### 🎨 主题集成
- **主题颜色方案**：自动适配当前主题
- **响应式设计**：适配各种屏幕尺寸
- **自定义样式**：支持自定义CSS
- **主题编辑器支持**：实时预览配置效果

### 🛠️ 灵活配置
- **站点国家设置**：指定当前站点的国家
- **排除地区**：可配置不显示横幅的地区
- **默认内容**：设置默认显示的文本和按钮
- **地区个性化**：为不同国家配置不同内容
- **可启用/禁用**：一键开关组件

### 🔄 智能逻辑
- **同一国家不显示**：避免向同国家用户展示
- **支持地区检测**：仅向配置了内容的地区显示
- **优雅降级**：API失败时的处理机制
- **调试日志**：详细的控制台日志

## 安装方法

### 通过Shopify主题编辑器安装
1. 进入Shopify后台 > 在线商店 > 主题
2. 点击「自定义」进入主题编辑器
3. 在左侧添加区块 > 找到「IP Geolocation Banner」
4. 将组件拖放到合适位置
5. 配置相关选项

### 手动安装
1. 将 `ip-geolocation-banner.liquid` 文件上传到主题的 `sections` 目录
2. 在需要显示的模板中添加以下代码：
   ```liquid
   {% section 'ip-geolocation-banner' %}
   ```
3. 进入主题编辑器配置组件

## 配置选项

### 基本设置
| 选项名称 | 说明 | 默认值 |
|---------|------|--------|
| **启用IP Geolocation Banner** | 开关组件功能 | `true` |
| **站点国家代码** | 当前站点的国家代码 (ISO 3166-1 alpha-2) | `US` |
| **IP Geolocation API Key** | 可选，用于ipstack等服务 | 空 |
| **排除地区** | 逗号分隔的国家代码，不显示横幅 | 空 |

### 默认内容
| 选项名称 | 说明 | 默认值 |
|---------|------|--------|
| **默认横幅文本** | 当没有特定地区配置时显示的文本 | `We noticed you're visiting from a different region. Would you like to visit our local site?` |
| **默认按钮文本** | 默认显示的按钮文字 | `Visit Local Site` |
| **默认目标URL** | 默认的跳转链接 | `/` |

### 地区配置
通过添加「Region」块来配置特定地区的内容：

| 选项名称 | 说明 | 默认值 |
|---------|------|--------|
| **国家代码** | 地区的国家代码 (ISO 3166-1 alpha-2) | `US` |
| **横幅文本** | 该地区显示的文本 | `We noticed you're visiting from [Country]. Would you like to visit our local site?` |
| **按钮文本** | 该地区显示的按钮文字 | `Visit Local Site` |
| **目标URL** | 该地区的跳转链接 | `/` |

## 使用示例

### 配置示例

#### 基本配置
1. 启用组件
2. 设置站点国家代码为 `CA` (加拿大)
3. 配置默认按钮文本为 `Visit Canada Site`

#### 添加地区配置
1. 添加一个Region块
2. 设置国家代码为 `US`
3. 设置按钮文本为 `Visit US Site`
4. 设置URL为 `https://example.us`

#### 排除地区
在「排除地区」中输入 `GB,DE`，则英国和德国用户不会看到横幅。

### 预期效果

- 加拿大用户：不显示横幅
- 美国用户：显示「Visit US Site」按钮，跳转到 `https://example.us`
- 其他国家用户：显示「Visit Canada Site」按钮，跳转到默认URL

## 技术实现

### 组件结构
```
ip-geolocation-banner
├── 样式定义
├── JavaScript类定义
├── 模板渲染逻辑
└── 配置Schema
```

### IP检测流程
1. 检查缓存
2. 尝试Shopify内置地理位置
3. 尝试配置的API密钥服务
4. 尝试免费IP API服务
5. 数据归一化
6. 显示/隐藏判断

### 显示逻辑
```javascript
if (isEnabled && !isDismissed && !sameCountry && !isExcluded && isSupportedRegion) {
  showBanner();
}
```

## 最佳实践

### 🏆 推荐配置
- 至少配置1-2个主要地区
- 使用清晰的按钮文字，包含地区名称
- 确保跳转链接正确指向目标站点
- 定期检查API使用情况

### 🔒 隐私注意事项
- 组件符合GDPR要求
- 优先使用Shopify内置地理位置
- 不存储敏感数据
- 提供关闭按钮

### 🚀 性能优化
- 组件自动缓存结果
- API请求有超时保护
- 支持异步加载
- 最小化DOM操作

## 常见问题

### Q: 横幅不显示
A: 检查以下几点：
- 组件是否启用
- 用户是否在排除地区
- 用户是否与站点国家相同
- 是否配置了对应地区的内容
- 浏览器控制台是否有错误

### Q: IP检测不准确
A: 组件使用多种检测方法，准确率取决于API服务。建议：
- 使用ipstack等付费API服务
- 确保站点国家代码配置正确
- 检查用户网络环境（如VPN）

### Q: 如何自定义样式
A: 可以通过以下方式：
- 在主题CSS中覆盖组件样式
- 修改组件文件中的CSS
- 使用主题颜色方案

### Q: 如何添加更多API服务
A: 编辑组件文件中的 `ipServices` 数组，添加新的服务配置。

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 更新日志

### v1.0.0
- 初始版本发布
- 支持多API检测
- 主题集成支持
- 灵活的配置选项

## 开发者信息

### 组件类名
- `ip-geolocation-banner`：主容器
- `ip-geolocation-banner__content`：内容容器
- `ip-geolocation-banner__text`：文本内容
- `ip-geolocation-banner__link`：按钮链接
- `ip-geolocation-banner__dismiss`：关闭按钮

### 事件监听
组件使用自定义元素实现，支持以下生命周期钩子：
- `connectedCallback`：组件挂载时
- `disconnectedCallback`：组件卸载时

### 调试
组件提供详细的控制台日志，可通过浏览器控制台查看：
- IP检测过程
- 显示/隐藏判断
- API响应信息

## 支持和反馈

如果您在使用过程中遇到问题或有改进建议，请联系组件开发者或在GitHub提交issue。

---

**IP Geolocation Banner** - 智能的地理位置横幅解决方案
