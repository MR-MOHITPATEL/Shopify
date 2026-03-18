/**
 * Shopify Theme Core JS
 * Handles mobile navigation, accordions, and basic interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAccordions();
  initStickyHeader();
  initQuantitySelectors();
  initProductCarousel();
});

/**
 * Product Carousel Class-based Logic
 */
function initProductCarousel() {
  const container = document.querySelector('.product-carousel');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const slides = Array.from(container.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const thumbs = Array.from(document.querySelectorAll('.carousel-thumbnail'));
  const nextBtn = document.querySelector('.carousel-arrow.next');
  const prevBtn = document.querySelector('.carousel-arrow.prev');

  let currentIndex = 0;
  let autoSlideInterval;

  const moveToIndex = (index) => {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active states
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === currentIndex));
  };

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(() => moveToIndex(currentIndex + 1), 2000);
  };

  const stopAutoSlide = () => clearInterval(autoSlideInterval);

  if (nextBtn) nextBtn.addEventListener('click', () => { moveToIndex(currentIndex + 1); stopAutoSlide(); startAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { moveToIndex(currentIndex - 1); stopAutoSlide(); startAutoSlide(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { moveToIndex(i); stopAutoSlide(); startAutoSlide(); });
  });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => { moveToIndex(i); stopAutoSlide(); startAutoSlide(); });
  });

  // Mobile Swipe Detection
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX, {passive: true});
  container.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) moveToIndex(currentIndex + 1);
    else if (touchEndX - touchStartX > 50) moveToIndex(currentIndex - 1);
    stopAutoSlide();
    startAutoSlide();
  }, {passive: true});

  startAutoSlide();
}

/**
 * AJAX Cart Helpers
 */
async function refreshCartDrawer() {
  try {
    const response = await fetch('/?section_id=cart-drawer');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const drawerContent = doc.querySelector('#CartDrawerContent');
    if (drawerContent) {
      document.querySelector('#CartDrawerContent').innerHTML = drawerContent.innerHTML;
    }
  } catch (error) {
    console.error('Error refreshing cart:', error);
  }
}

async function updateCartDrawerQty(key, quantity) {
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: parseInt(quantity) })
    });
    await refreshCartDrawer();
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}
