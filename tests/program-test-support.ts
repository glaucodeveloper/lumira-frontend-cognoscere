import { program } from '../src/program';
import type { ProgramOptions } from '../src/program';
import type { LumiraSystem } from '../src/types';

type Globals = { document?: PropertyDescriptor; location?: PropertyDescriptor; HTMLElement?: PropertyDescriptor };

export function createProgramHarness(options: Partial<Omit<ProgramOptions, 'mount'>> = {}): { system: LumiraSystem; mount: HTMLElement; restore: () => void } {
  const globals: Globals = {
    document: Object.getOwnPropertyDescriptor(globalThis, 'document'),
    location: Object.getOwnPropertyDescriptor(globalThis, 'location'),
    HTMLElement: Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement'),
  };
  class TestHTMLElement {}
  Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: TestHTMLElement });
  const fakeDocument = {
    title: '',
    createElement: () => ({ className: '', textContent: '', setAttribute() {} }),
  };
  const fakeLocation = { hash: '' };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: fakeDocument });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: fakeLocation });
  const mountHost: { innerHTML: string; replaceChildren(): void; append(...items: unknown[]): void; addEventListener(...args: unknown[]): void; removeEventListener(...args: unknown[]): void; querySelector(): null } = {
    innerHTML: '',
    replaceChildren() { this.innerHTML = ''; },
    append() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
  };
  const mount = mountHost as unknown as HTMLElement;
  const system = program({ mount, mode: 'demo', renderView: () => '<main></main>', bindEvents: false, ...options });
  return {
    system,
    mount,
    restore() {
      for (const [key, descriptor] of Object.entries(globals)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    },
  };
}
