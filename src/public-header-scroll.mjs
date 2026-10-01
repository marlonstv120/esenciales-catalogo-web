const TOP_OFFSET = 8;
const DIRECTION_THRESHOLD = 8;

export function startPublicHeaderScroll({ app, windowRef = window, onHide = () => {} }) {
  let lastScrollY = Math.max(0, windowRef.scrollY || windowRef.pageYOffset || 0);
  let ticking = false;
  let animationFrame = null;

  const updateHeader = () => {
    ticking = false;
    animationFrame = null;
    const header = app.querySelector('.public-header');
    if (!header) return;

    const scrollY = Math.max(0, windowRef.scrollY || windowRef.pageYOffset || 0);
    const distance = scrollY - lastScrollY;

    if (scrollY <= TOP_OFFSET) {
      header.classList.remove('is-hidden');
      lastScrollY = scrollY;
      return;
    }

    if (Math.abs(distance) < DIRECTION_THRESHOLD) return;

    const shouldHide = distance > 0;
    if (shouldHide) onHide();
    header.classList.toggle('is-hidden', shouldHide);
    lastScrollY = scrollY;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    if (windowRef.requestAnimationFrame) animationFrame = windowRef.requestAnimationFrame(updateHeader);
    else updateHeader();
  };

  windowRef.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    windowRef.removeEventListener('scroll', onScroll);
    if (animationFrame !== null) windowRef.cancelAnimationFrame?.(animationFrame);
  };
}
