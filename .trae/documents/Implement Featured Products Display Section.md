## 实现计划

### 1. 创建新的section文件
- 在`sections`目录中创建`featured-products-display.liquid`文件
- 定义section的基本结构和schema配置

### 2. 配置Section Schema
- 产品选择字段：允许从店铺产品库中选择并排序产品
- 标题设置：支持文本或图片形式的标题
- 推荐语配置：支持文本或图片形式的推荐语
- 布局控制：可选择一行显示2个或3个产品
- 视频播放模式：控制第一个产品视频的播放触发方式（滚动到位置自动播放/hover时播放）
- 价格显示开关：控制是否显示产品价格

### 3. 实现HTML结构
- 创建水平居中的容器，两侧保留适当留白
- 添加顶部居中的标题区域
- 构建产品网格布局，使用CSS Grid实现响应式设计
- 设计产品卡片结构：
  - 产品标题
  - 产品价格（可配置显示/隐藏）
  - 星级评分（集成Shopify reviews评分系统）
  - 产品媒体区域（图片/视频）
  - 推荐语文本/图片
  - "Learn More"按钮

### 4. 添加CSS样式
- 创建`section-featured-products-display.css`文件
- 实现响应式网格布局
- 设计产品卡片样式，确保与现有主题风格一致
- 添加视频与图片区域的平滑过渡效果
- 确保在不同屏幕尺寸下的显示一致性

### 5. 实现JavaScript功能
- 创建`featured-products-display.js`文件
- 实现滚动检测，当页面滚动到该区域时延迟3秒自动播放第一个产品视频
- 添加鼠标hover事件，触发对应产品视频的播放
- 确保视频在原产品卡片区域内播放，不改变布局结构
- 实现卡片点击事件，跳转到对应产品详情页

### 6. 集成Shopify功能
- 使用Liquid标签获取产品数据
- 集成Shopify reviews评分系统
- 实现产品链接跳转功能
- 确保主题编辑器中的实时预览功能正常工作

### 7. 测试与优化
- 测试在不同设备上的显示效果
- 优化视频加载和播放性能
- 确保与现有主题的兼容性
- 测试主题编辑器中的所有配置选项

## 预期文件更改

1. `sections/featured-products-display.liquid` - 新的主推产品展示section
2. `assets/section-featured-products-display.css` - 该section的CSS样式
3. `assets/featured-products-display.js` - 该section的JavaScript功能

这个实现将满足所有需求，提供一个功能完整、设计精美的主推产品展示区域，同时支持灵活的后台配置。