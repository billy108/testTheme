/**
 * 文字通知栏功能
 * 包含轮播和倒计时计时器功能
 */

class TextNotification {
  constructor() {
    this.slidesContainer = document.querySelector('[data-notification-slides]');
    this.currentIndex = 0;
    this.slides = [];
    this.animationSpeed = 3000; // 默认3秒
    this.animationInterval = null;
    this.countdownIntervals = [];
    
    // 检查浏览器支持
    this.supportsPassive = this.checkPassiveSupport();
    
    if (this.slidesContainer) {
      this.initialize();
    }
  }

  /**
   * 检查浏览器是否支持passive事件监听器
   */
  checkPassiveSupport() {
    let supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', { get: () => { supportsPassive = true; } }));
    } catch (e) {}
    return supportsPassive;
  }

  /**
   * 初始化通知轮播
   */
  initialize() {
    // 获取所有幻灯片
    this.slides = Array.from(this.slidesContainer.querySelectorAll('.text-notification__slide'));
    
    // 直接从元素获取动画速度，避免额外的DOM查询
    this.animationSpeed = parseFloat(this.slidesContainer.dataset.animationSpeed || 3) * 1000;
    
    // 如果有多个幻灯片，开始轮播
    if (this.slides.length > 1) {
      this.startSlideshow();
    }
    
    // 初始化所有倒计时计时器
    this.initializeCountdownTimers();
    
    // 添加窗口大小变化监听器，优化响应式行为
    window.addEventListener('resize', this.handleResize.bind(this), this.supportsPassive ? { passive: true } : false);
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 重置当前索引，确保在视口变化后显示正确的幻灯片
    this.updateSlidePosition();
  }

  /**
   * 开始轮播
   */
  startSlideshow() {
    // 清除现有的定时器
    this.stopSlideshow();
    
    // 使用requestAnimationFrame优化动画性能
    let lastSlideTime = Date.now();
    
    const slideLoop = () => {
      const now = Date.now();
      if (now - lastSlideTime >= this.animationSpeed) {
        this.nextSlide();
        lastSlideTime = now;
      }
      this.animationInterval = requestAnimationFrame(slideLoop);
    };
    
    this.animationInterval = requestAnimationFrame(slideLoop);
    
    // 添加鼠标悬停暂停功能，使用passive选项优化性能
    this.slidesContainer.addEventListener('mouseenter', this.stopSlideshow.bind(this), this.supportsPassive ? { passive: true } : false);
    this.slidesContainer.addEventListener('mouseleave', this.startSlideshow.bind(this), this.supportsPassive ? { passive: true } : false);
  }

  /**
   * 停止轮播
   */
  stopSlideshow() {
    if (this.animationInterval) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.animationInterval);
      } else {
        clearTimeout(this.animationInterval);
      }
      this.animationInterval = null;
    }
  }

  /**
   * 切换到下一张幻灯片
   */
  nextSlide() {
    if (this.slides.length <= 1) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateSlidePosition();
  }

  /**
   * 更新幻灯片位置
   */
  updateSlidePosition() {
    const slideWidth = -100 * this.currentIndex;
    // 使用requestAnimationFrame确保平滑过渡
    requestAnimationFrame(() => {
      this.slidesContainer.style.transform = `translateX(${slideWidth}%)`;
    });
  }

  /**
   * 初始化所有倒计时计时器
   */
  initializeCountdownTimers() {
    const timerElements = document.querySelectorAll('[data-countdown-timer]');
    
    timerElements.forEach(timerElement => {
      const endDateStr = timerElement.dataset.endDate;
      if (!endDateStr) {
        console.warn('Missing countdown end date');
        return;
      }
      
      const endDate = new Date(endDateStr);
      
      // 验证日期是否有效
      if (isNaN(endDate.getTime())) {
        console.error('Invalid countdown date format:', endDateStr);
        timerElement.textContent = '';
        return;
      }
      
      // 设置初始倒计时
      this.updateCountdown(timerElement, endDate);
      
      // 每秒更新一次倒计时，保存interval ID以便后续清理
      const intervalId = setInterval(() => {
        this.updateCountdown(timerElement, endDate);
      }, 1000);
      
      this.countdownIntervals.push(intervalId);
    });
  }

  /**
   * 更新单个倒计时计时器
   * @param {HTMLElement} element - 倒计时元素
   * @param {Date} endDate - 结束日期
   */
  updateCountdown(element, endDate) {
    const now = new Date();
    const diff = endDate - now;
    
    // 如果已经结束，显示已结束并停止更新
    if (diff <= 0) {
      element.textContent = '活动已结束';
      // 清理对应的interval
      if (this.countdownIntervals.length > 0) {
        clearInterval(this.countdownIntervals.pop());
      }
      return;
    }
    
    // 计算天、时、分、秒
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // 构建倒计时显示文本
    let countdownText = '';
    if (days > 0) {
      countdownText += `${days}天`;
    }
    
    // 格式化小时、分钟、秒为两位数，兼容不支持padStart的旧浏览器
    const formatNumber = (num) => num < 10 ? '0' + num : num;
    const formattedHours = formatNumber(hours);
    const formattedMinutes = formatNumber(minutes);
    const formattedSeconds = formatNumber(seconds);
    
    if (countdownText) {
      countdownText += ` ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      countdownText = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
    
    element.textContent = countdownText;
  }

  /**
   * 销毁实例，清理所有资源
   */
  destroy() {
    this.stopSlideshow();
    
    // 清理所有倒计时intervals
    this.countdownIntervals.forEach(intervalId => clearInterval(intervalId));
    this.countdownIntervals = [];
    
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.slidesContainer.removeEventListener('mouseenter', this.stopSlideshow.bind(this));
    this.slidesContainer.removeEventListener('mouseleave', this.startSlideshow.bind(this));
  }
}

// 页面加载完成后初始化
if (typeof document !== 'undefined') {
  // 使用立即执行函数避免全局变量污染
  (function() {
    // 等待DOM加载完成
    const initNotifications = () => {
      new TextNotification();
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNotifications);
    } else {
      // DOM已加载完成，直接初始化
      initNotifications();
    }
    
    // Shopify主题编辑器预览支持
    if (typeof Shopify !== 'undefined' && Shopify.designMode) {
      document.addEventListener('shopify:section:load', initNotifications);
      document.addEventListener('shopify:section:unload', () => {
        // 清理可能存在的实例资源
        // 注意：在实际应用中，可能需要维护实例引用以便正确清理
      });
    }
  })();
}

// 导出类以支持模块化使用
try {
  module.exports = TextNotification;
} catch (e) {
  // 忽略在浏览器环境中的错误
}

try {
  export default TextNotification;
} catch (e) {
  // 忽略在不支持ES模块的环境中的错误
}