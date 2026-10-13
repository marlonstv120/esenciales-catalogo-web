let motionModule = null;

function affectedByReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

/**
 * Aplica apariciones sutiles (fade + leve desplazamiento) a los elementos
 * marcados con [data-reveal] usando la librería `motion` (vanilla JS).
 * - data-reveal: activa la animación cuando el elemento entra en el viewport.
 * - data-reveal-delay="ms": retardo opcional en milisegundos (útil para grids).
 * - respeta prefers-reduced-motion (no anima, solo deja el contenido visible).
 */
export async function startRevealMotion(root = document) {
  if (!root?.querySelectorAll) return;
  const targets = [...root.querySelectorAll('[data-reveal]')];
  if (!targets.length) return;
  if (affectedByReducedMotion()) return;

  motionModule ||= await import('motion');
  const { animate, inView } = motionModule;

  targets.forEach((element) => {
    if (element.dataset.revealStarted) return;
    element.dataset.revealStarted = 'true';
    const delay = Math.max(0, Number(element.dataset.revealDelay) || 0) / 1000;
    inView(element, () => {
      animate(element, { opacity: [0, 1], y: [18, 0] }, { duration: 0.5, delay, ease: 'easeOut' });
      return () => {};
    }, { amount: 0.12 });
  });
}