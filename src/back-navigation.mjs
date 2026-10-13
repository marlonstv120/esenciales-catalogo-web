import { uiIcon } from './ui-icons.mjs';

const backIcon = uiIcon('arrow-left');

function classes(className) {
  return `back-navigation${className ? ` ${className}` : ''}`;
}

export function backButton({ label, className = '', attributes = '' }) {
  return `<button class="${classes(className)}" type="button" ${attributes}>${backIcon}<span>${label}</span></button>`;
}

export function backLink({ href, label, className = '', attributes = '' }) {
  return `<a class="${classes(className)}" href="${href}" ${attributes}>${backIcon}<span>${label}</span></a>`;
}
