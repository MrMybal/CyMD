import { createLink } from 'cydoc'
import targets from './targets.json'

/** Shared help destinations; unknown requests return to the manual home. */
export function helpLink(base: string, locale: string, target = 'overview') {
  const route = Object.hasOwn(targets, target) ? targets[target as keyof typeof targets] : targets.overview
  return createLink({ ...route, locale: locale.startsWith('fr') ? 'fr' : 'en' }, base)
}
