const backIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';

function classes(className) {
  return `back-navigation${className ? ` ${className}` : ''}`;
}

export function backButton({ label, className = '', attributes = '' }) {
  return `<button class="${classes(className)}" type="button" ${attributes}>${backIcon}<span>${label}</span></button>`;
}

export function backLink({ href, label, className = '', attributes = '' }) {
  return `<a class="${classes(className)}" href="${href}" ${attributes}>${backIcon}<span>${label}</span></a>`;
}
