document.addEventListener('DOMContentLoaded', function() {
  // 初始化主推产品展示功能
  initFeaturedProductsDisplay();
});

function initFeaturedProductsDisplay() {
  const sections = document.querySelectorAll('.featured-products-display');
  
  sections.forEach(section => {
    const cards = section.querySelectorAll('.featured-products-display__card');
    const enableVideos = section.dataset.enableVideos === 'true';
    const firstVideoPlayMode = section.dataset.firstVideoPlayMode || 'scroll';
    
    // 只有启用视频时才初始化视频功能
    if (enableVideos) {
      // 初始化所有卡片的视频交互
      initCardInteractions(cards, enableVideos);
      
      // 为每个卡片添加视频播放功能
      cards.forEach(card => {
        const video = card.querySelector('.featured-products-display__video');
        
        if (video && card.dataset.hasVideo === 'true') {
          // 确保视频可以在静音状态下自动播放
          video.muted = true;
          video.playsInline = true;
          video.loop = true;
        }
      });
      
      // 初始化第一个卡片的视频播放
      const firstCard = cards[0];
      const firstVideo = firstCard ? firstCard.querySelector('.featured-products-display__video') : null;
      
      if (firstCard && firstVideo && firstCard.dataset.hasVideo === 'true') {
        if (firstVideoPlayMode === 'scroll') {
          // 滚动到位置时自动播放
          initScrollPlay(firstCard, firstVideo);
        }
        // 如果是hover模式，则不需要初始化，由hover事件处理
      }
    }
  });
}

function initCardInteractions(cards, enableVideos) {
  cards.forEach(card => {
    const video = card.querySelector('.featured-products-display__video');
    
    // 只有启用视频且包含视频的卡片才需要交互
    if (enableVideos && video && card.dataset.hasVideo === 'true') {
      // 鼠标hover事件
      card.addEventListener('mouseenter', () => {
        playVideo(video, card);
      });
      
      card.addEventListener('mouseleave', () => {
        pauseVideo(video, card);
      });
      
      // 确保视频在卡片内正确缩放
      resizeVideo(video);
      window.addEventListener('resize', () => resizeVideo(video));
    }
  });
}

function initScrollPlay(card, video) {
  let hasPlayed = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasPlayed) {
        // 延迟3秒后播放视频
        setTimeout(() => {
          playVideo(video, card);
          hasPlayed = true;
        }, 3000);
        
        // 停止观察，因为只需要播放一次
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.5, // 当卡片50%可见时触发
    rootMargin: '0px 0px -100px 0px' // 调整触发位置
  });
  
  observer.observe(card);
}

function playVideo(video, card) {
  // 播放视频
  video.play().catch(error => {
    console.error('Error playing video:', error);
    // 尝试手动加载并播放
    video.load();
    video.play().catch(error => {
      console.error('Error replaying video:', error);
    });
  });
  
  // 添加播放状态类
  card.dataset.playing = 'true';
}

function pauseVideo(video, card) {
  // 暂停视频
  video.pause();
  
  // 重置视频到开始位置
  video.currentTime = 0;
  
  // 移除播放状态类
  delete card.dataset.playing;
}

function resizeVideo(video) {
  const card = video.closest('.featured-products-display__card');
  if (card) {
    const mediaContainer = card.querySelector('.featured-products-display__media');
    if (mediaContainer) {
      const containerRect = mediaContainer.getBoundingClientRect();
      // 确保视频宽高比与容器一致
      video.style.width = `${containerRect.width}px`;
      video.style.height = `${containerRect.height}px`;
    }
  }
}

// 监听主题编辑器中的设置变化
if (window.Shopify && Shopify.designMode) {
  document.addEventListener('shopify:section:load', function(event) {
    const section = event.target.querySelector('.featured-products-display');
    if (section) {
      initFeaturedProductsDisplay();
    }
  });
  
  document.addEventListener('shopify:section:unload', function(event) {
    const section = event.target.querySelector('.featured-products-display');
    if (section) {
      // 清理资源
      const videos = section.querySelectorAll('.featured-products-display__video');
      videos.forEach(video => {
        video.pause();
        video.src = '';
      });
    }
  });
}

// 实现懒加载逻辑
function initLazyLoading() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const media = entry.target;
        
        // 如果是视频，预加载视频
        if (media.tagName === 'VIDEO') {
          media.load();
        }
        
        observer.unobserve(media);
      }
    });
  }, {
    threshold: 0.1
  });
  
  // 观察所有视频
  const lazyVideos = document.querySelectorAll('.featured-products-display__video');
  lazyVideos.forEach(video => {
    observer.observe(video);
  });
}

// 页面加载完成后初始化懒加载
window.addEventListener('load', function() {
  initLazyLoading();
});
