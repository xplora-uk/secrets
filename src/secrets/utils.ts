// local utility functions; not included in library

import { IEnvSettings } from '../types';

export const nowIso = (d: Date = new Date()): string => d.toISOString();
export const nowTs  = (d: Date = new Date()): number => d.getTime();

export const isObject = (o: any): Boolean => o && (typeof o === 'object') && !Array.isArray(o);

/**
 * Merge entries of src object into dest object - at top level
 * Side-effect on dest object
 * @param src 
 * @param dest 
 * @returns {void}
 */
export function shallowMergeSettings(src: IEnvSettings| null = {}, dest: IEnvSettings = {}) {
  if (!src) throw new Error('Invalid source settings');
  if (!dest) throw new Error('Invalid env settings');

  const srcIsObject  = isObject(src);
  if (!srcIsObject) throw new Error('Invalid source settings');

  const destIsObject = isObject(dest);
  if (!destIsObject) throw new Error('Invalid env settings');

  for (let [k, v] of Object.entries(src)) {
    if (typeof k === 'string') {
      if (typeof v === 'string') {
        dest[k] = v;
      } else {
        throw new Error('Invalid env setting for key: ' + k)
      }
    } else {
      throw new Error('Invalid env setting key');
    }
  }
}
