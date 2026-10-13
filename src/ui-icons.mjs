import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Calendar, CarFront, Check, ChevronDown, CircleCheckBig, CirclePlus,
  ClipboardList, Copy, ExternalLink, Eye, EyeOff, FileText, Gem, Heart, Image as ImageIcon, Info, Leaf, LogOut, Mail,
  MapPin, Menu, MessageCircle, Pencil, Plus, RotateCcw, Search, SearchX, Settings, ShieldCheck, ShoppingCart,
  SlidersHorizontal, Sparkles, Tag, Trash2, Video, X,
} from 'lucide';

// Iconos de lucide (la misma librería de iconos que usa shadcn/ui), renderizados
// como SVG estático para que las vistas sigan siendo cadenas puras de HTML.
const registry = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'badge-check': BadgeCheck,
  calendar: Calendar,
  'car-front': CarFront,
  check: Check,
  'chevron-down': ChevronDown,
  'circle-check-big': CircleCheckBig,
  'circle-plus': CirclePlus,
  'clipboard-list': ClipboardList,
  copy: Copy,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  gem: Gem,
  heart: Heart,
  image: ImageIcon,
  info: Info,
  leaf: Leaf,
  'log-out': LogOut,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  'message-circle': MessageCircle,
  pencil: Pencil,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  search: Search,
  'search-x': SearchX,
  settings: Settings,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  tag: Tag,
  'trash-2': Trash2,
  video: Video,
  x: X,
};

function escapeAttr(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function serialize(node) {
  const [tag, attrs = {}, children = []] = node;
  const props = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(' ');
  const inner = children && children.length ? children.map(serialize).join('') : '';
  return `<${tag}${props ? ` ${props}` : ''}>${inner}</${tag}>`;
}

/**
 * Renderiza un icono de lucide como SVG estático.
 * @param {string} name Nombre del icono en kebab-case (p. ej. 'arrow-left').
 * @param {{size?: number, className?: string, strokeWidth?: number}} options
 */
export function uiIcon(name, { size = 18, className = '', strokeWidth = 1.8 } = {}) {
  const node = registry[name];
  if (!node) return '';
  const classAttr = className ? `class="${escapeAttr(className)}" ` : '';
  const common = `aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg ${classAttr}${common}>${node.map(serialize).join('')}</svg>`;
}