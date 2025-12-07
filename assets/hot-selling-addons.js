// 热销附加组件JavaScript
class HotSellingAddons {
  constructor(container) {
    this.container = container;
    this.slider = container.querySelector('[data-slider]');
    this.slidesContainer = container.querySelector('[data-slider-slides]');
    this.slides = Array.from(container.querySelectorAll('[data-slide]'));
    this.prevButton = container.querySelector('[data-slider-control="prev"]');
    this.nextButton = container.querySelector('[data-slider-control="next"]');
    
    // 配置参数
    this.productsPerView = parseInt(container.dataset.productsPerView) || 3;
    this.autoplay = container.dataset.autoplay === 'true';
    this.autoplaySpeed = parseInt(container.dataset.autoplaySpeed) || 5000;
    this.transitionSpeed = parseInt(container.dataset.transitionSpeed) || 500;
    this.enableVideos = container.dataset.enableVideos === 'true';
    this.videoPlayMode = container.dataset.videoPlayMode || 'hover';
    
    // 状态管理
    this.currentSlide = 0;
    this.isTransitioning = false;
    this.autoplayTimer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // 初始化
    this.init();
  }
  
  // 初始化
  init() {
    this.updateSlidesPerView();
    this.bindEvents();
    this.updateSliderPosition();
    this.updateControls();
    
    if (this.autoplay) {
      this.startAutoplay();
    }
    
    // 初始化视频
    this.initVideos();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      this.updateSlidesPerView();
      this.updateSliderPosition();
      this.updateControls();
    }, 250));
  }
  
  // 更新每屏显示的产品数量
  updateSlidesPerView() {
    const width = window.innerWidth;
    
    if (width <= 749) {
      this.productsPerView = 1;
    } else if (width <= 1024) {
      this.productsPerView = 2;
    } else {
      this.productsPerView = parseInt(this.container.dataset.productsPerView) || 3;
    }
    
    // 重新获取幻灯片，以支持动态添加/删除
    this.slides = Array.from(this.container.querySelectorAll('[data-slide]'));
    
    // 更新幻灯片宽度
    this.slides.forEach(slide => {
      slide.style.flex = `0 0 ${100 / this.productsPerView}%`;
      slide.style.maxWidth = `${100 / this.productsPerView}%`;
    });
  }
  
  // 绑定事件
  bindEvents() {
    // 控制按钮事件
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    // 触摸事件
    this.bindTouchEvents();
    
    // 鼠标悬停事件（用于视频控制和暂停自动播放）
    this.container.addEventListener('mouseenter', () => {
      if (this.autoplay) {
        this.stopAutoplay();
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (this.autoplay) {
        this.startAutoplay();
      }
    });
  }
  
  // 绑定触摸事件
  bindTouchEvents() {
    let touchStartX = 0;
    let touchMoveX = 0;
    let isDragging = false;
    
    this.slider.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      isDragging = true;
      this.slidesContainer.style.transition = 'none';
    });
    
    this.slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      touchMoveX = e.touches[0].clientX;
      const diffX = touchMoveX - touchStartX;
      const slideWidth = this.slides[0].offsetWidth;
      const currentPosition = -this.currentSlide * slideWidth;
      const newPosition = currentPosition + diffX;
      
      this.slidesContainer.style.transform = `translateX(${newPosition}px)`;
    });
    
    this.slider.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const diffX = touchMoveX - touchStartX;
      const slideWidth = this.slides[0].offsetWidth;
      
      // 如果滑动距离超过10%，则切换幻灯片
      if (Math.abs(diffX) > slideWidth * 0.1) {
        if (diffX > 0) {
          this.prevSlide();
        } else {
          this.nextSlide();
        }
      } else {
        // 否则，回到原始位置
        this.updateSliderPosition();
      }
      
      isDragging = false;
      this.slidesContainer.style.transition = `transform ${this.transitionSpeed}ms ease`;
    });
  }
  
  // 初始化视频
  initVideos() {
    if (!this.enableVideos) return;
    
    this.slides.forEach(slide => {
      const hasVideo = slide.dataset.hasVideo === 'true';
      if (!hasVideo) return;
      
      const card = slide.querySelector('.hot-selling-addons__card');
      const video = slide.querySelector('.hot-selling-addons__video');
      
      if (!video) return;
      
      // 视频预加载处理
      video.load();
      
      // 根据播放模式绑定事件
      if (this.videoPlayMode === 'hover') {
        // 鼠标悬停播放视频
        card.addEventListener('mouseenter', () => {
          this.playVideo(video);
        });
        
        card.addEventListener('mouseleave', () => {
          this.pauseVideo(video);
          this.resetVideo(video);
        });
      } else if (this.videoPlayMode === 'click') {
        // 点击播放视频
        card.addEventListener('click', (e) => {
          // 如果点击的是链接，不播放视频
          if (e.target.closest('a')) return;
          
          if (video.paused) {
            this.playVideo(video);
          } else {
            this.pauseVideo(video);
            this.resetVideo(video);
          }
        });
      }
      
      // 视频结束后重置
      video.addEventListener('ended', () => {
        this.resetVideo(video);
      });
    });
  }
  
  // 播放视频
  playVideo(video) {
    if (!video) return;
    
    video.play().catch(error => {
      console.error('Error playing video:', error);
    });
  }
  
  // 暂停视频
  pauseVideo(video) {
    if (!video) return;
    
    video.pause();
  }
  
  // 重置视频
  resetVideo(video) {
    if (!video) return;
    
    video.currentTime = 0;
  }
  
  // 上一张幻灯片
  prevSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // 重新获取幻灯片，以支持动态添加/删除
    this.slides = Array.from(this.container.querySelectorAll('[data-slide]'));
    
    if (this.slides.length === 0) return;
    
    // 无限循环：如果当前是第一张，就跳到最后一张
    if (this.currentSlide === 0) {
      this.currentSlide = Math.max(0, this.slides.length - this.productsPerView);
    } else {
      this.currentSlide--;
    }
    
    this.updateSliderPosition();
    this.updateControls();
    this.restartAutoplay();
  }
  
  // 下一张幻灯片
  nextSlide() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // 重新获取幻灯片，以支持动态添加/删除
    this.slides = Array.from(this.container.querySelectorAll('[data-slide]'));
    
    if (this.slides.length === 0) return;
    
    const maxSlide = Math.max(0, this.slides.length - this.productsPerView);
    
    // 无限循环：如果当前是最后一张，就跳到第一张
    if (this.currentSlide >= maxSlide) {
      this.currentSlide = 0;
    } else {
      this.currentSlide++;
    }
    
    this.updateSliderPosition();
    this.updateControls();
    this.restartAutoplay();
  }
  
  // 更新幻灯片位置
  updateSliderPosition() {
    // 重新获取幻灯片，以支持动态添加/删除
    this.slides = Array.from(this.container.querySelectorAll('[data-slide]'));
    
    if (this.slides.length === 0) return;
    
    this.isTransitioning = true;
    
    // 确保当前幻灯片索引不超过最大值
    const maxSlide = Math.max(0, this.slides.length - this.productsPerView);
    this.currentSlide = Math.min(maxSlide, this.currentSlide);
    
    const slideWidth = this.slides[0].offsetWidth;
    const translateX = -this.currentSlide * slideWidth;
    
    this.slidesContainer.style.transition = `transform ${this.transitionSpeed}ms ease`;
    this.slidesContainer.style.transform = `translateX(${translateX}px)`;
    
    // 过渡结束后重置状态
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.transitionSpeed);
  }
  
  // 更新控制按钮状态
  updateControls() {
    // 重新获取幻灯片，以支持动态添加/删除
    this.slides = Array.from(this.container.querySelectorAll('[data-slide]'));
    
    if (this.prevButton) {
      this.prevButton.disabled = this.currentSlide === 0;
      this.prevButton.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
      this.prevButton.style.pointerEvents = this.currentSlide === 0 ? 'none' : 'auto';
    }
    
    if (this.nextButton) {
      // 计算最大可滑动位置
      const maxSlide = Math.max(0, this.slides.length - this.productsPerView);
      // 只有当当前位置已经是最大位置时才禁用下一个按钮
      this.nextButton.disabled = this.currentSlide >= maxSlide;
      this.nextButton.style.opacity = this.currentSlide >= maxSlide ? '0.5' : '1';
      this.nextButton.style.pointerEvents = this.currentSlide >= maxSlide ? 'none' : 'auto';
    }
  }
  
  // 开始自动播放
  startAutoplay() {
    if (this.autoplayTimer) {
      this.stopAutoplay();
    }
    
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoplaySpeed);
  }
  
  // 停止自动播放
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  // 重新开始自动播放
  restartAutoplay() {
    if (this.autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }
  
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 销毁实例
  destroy() {
    this.stopAutoplay();
    // 移除所有事件监听器
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', () => this.prevSlide());
    }
    if (this.nextButton) {
      this.nextButton.removeEventListener('click', () => this.nextSlide());
    }
    window.removeEventListener('resize', this.debounce);
  }
}

// 存储所有实例，以便在重新初始化时清理
let hotSellingAddonsInstances = [];

// 初始化所有热销附加组件
function initHotSellingAddons() {
  // 清理旧实例
  hotSellingAddonsInstances.forEach(instance => {
    instance.destroy();
  });
  hotSellingAddonsInstances = [];
  
  const containers = document.querySelectorAll('.hot-selling-addons');
  
  containers.forEach(container => {
    const instance = new HotSellingAddons(container);
    hotSellingAddonsInstances.push(instance);
  });
  
  return hotSellingAddonsInstances;
}

// 文档加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initHotSellingAddons();
});

// 监听Shopify主题编辑器事件
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:unload', (e) => {
    // 清理资源
  });
  
  document.addEventListener('shopify:section:reorder', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  // 监听区块添加/删除/更新事件
  document.addEventListener('shopify:section:block:select', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:block:deselect', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:block:update', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:block:add', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:block:remove', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
  
  document.addEventListener('shopify:section:block:reorder', (e) => {
    if (e.detail.section.querySelector('.hot-selling-addons')) {
      initHotSellingAddons();
    }
  });
}

// 导出类供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotSellingAddons;
} else if (typeof window !== 'undefined') {
  window.HotSellingAddons = HotSellingAddons;
}