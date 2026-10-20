/** Laboratório de páginas e ponto único de montagem imperativa. */
import { program } from './program';
import { e, initialComponentData, referenceScreenSpecs, registerComponentElements } from './components';
import type {
  ComponentFixture,
  ComponentMockSituation,
  ComponentPageElement,
  ComponentPageProps,
  PrototypeParameterSpec,
  PrototypeParameterValue,
  PrototypeParameterValues,
  ReferenceRegionSpec,
  ReferenceScreenSpec,
} from './components';
import './componenting-demo-lab.css';
import type { LumiraSystem } from './types';

type Part = string | HTMLElement;
function add(parts: Part[], part: Part): Part[] { parts.push(part); return parts; }
function mountParts(host: HTMLElement, parts: readonly Part[]): void {
  const elements: HTMLElement[] = [];
  host.innerHTML = parts.map(part => {
    if (typeof part === 'string') return part;
    const index = elements.push(part) - 1;
    return `<span data-lab-slot="${index}"></span>`;
  }).join('');
  elements.forEach((element, index) => host.querySelector(`[data-lab-slot="${index}"]`)?.replaceWith(element));
}

type DemoScreenState = ComponentMockSituation['status'];
type LabRole = ComponentMockSituation['role'];
type LabState = {
  screens: readonly ReferenceScreenSpec[];
  fixtures: Record<string, unknown>;
  screenId: string;
  componentId: string;
  role: LabRole;
  screenState: DemoScreenState;
  componentStates: Record<string, DemoScreenState>;
  componentParameters: Record<string, PrototypeParameterValues>;
  fullView: boolean;
};
type LabStateIterator<T> = Generator<T, never, (state: T) => T>;
function componentStateKey(screenId: string, componentId: string): string {
  return screenId + ':' + componentId;
}
function labRecord(value: unknown): ComponentFixture {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as ComponentFixture : {};
}
function valueAtPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}
function prototypeDefaults(region: ReferenceRegionSpec, fixture: ComponentFixture, active: PrototypeParameterValues): PrototypeParameterValues {
  return Object.fromEntries(region.parameters.map(parameter => {
    if (Object.hasOwn(active, parameter.id)) return [parameter.id, active[parameter.id]];
    if (parameter.type === 'count' && parameter.defaultValue !== undefined) return [parameter.id, parameter.defaultValue];
    if (parameter.targetPath) {
      const target = valueAtPath(fixture, parameter.targetPath);
      if (parameter.type === 'count' && Array.isArray(target)) return [parameter.id, target.length];
      if (parameter.type === 'list' && Array.isArray(target)) return [parameter.id, target.map(String)];
      if (typeof target === 'string' || typeof target === 'number' || typeof target === 'boolean') return [parameter.id, target];
    }
    return [parameter.id, parameter.defaultValue ?? ''];
  }));
}
function renderPrototypeField(parameter: PrototypeParameterSpec, value: PrototypeParameterValue): string {
  const id = e(parameter.id);
  const label = e(parameter.label);
  const hint = parameter.hint ? '<small>' + e(parameter.hint) + '</small>' : '';
  if (parameter.type === 'toggle') {
    return '<label class="lm-prototype-toggle"><span>' + label + '</span><input type="checkbox" data-prototype-field="' + id + '" aria-label="' + label + '" ' + (value === true ? 'checked' : '') + '><i aria-hidden="true"></i></label>';
  }
  if (parameter.type === 'select') {
    const options = (parameter.options ?? []).map(option => '<option value="' + e(option.value) + '" ' + (value === option.value ? 'selected' : '') + '>' + e(option.label) + '</option>').join('');
    return '<label class="lm-prototype-field"><span>' + label + '</span><select data-prototype-field="' + id + '" aria-label="' + label + '">' + options + '</select>' + hint + '</label>';
  }
  if (parameter.type === 'textarea' || parameter.type === 'list') {
    const text = Array.isArray(value) ? value.join('\n') : String(value ?? '');
    return '<label class="lm-prototype-field"><span>' + label + '</span><textarea data-prototype-field="' + id + '" aria-label="' + label + '" rows="' + (parameter.type === 'list' ? 3 : 4) + '">' + e(text) + '</textarea>' + hint + '</label>';
  }
  if (parameter.type === 'text') {
    return '<label class="lm-prototype-field"><span>' + label + '</span><input type="text" data-prototype-field="' + id + '" aria-label="' + label + '" value="' + e(value) + '">' + hint + '</label>';
  }
  const inputType = parameter.type === 'range' ? 'range' : 'number';
  const min = parameter.min === undefined ? '' : ' min="' + String(parameter.min) + '"';
  const max = parameter.max === undefined ? '' : ' max="' + String(parameter.max) + '"';
  const step = parameter.step === undefined ? '' : ' step="' + String(parameter.step) + '"';
  const output = parameter.type === 'range' ? '<output>' + e(value) + '</output>' : '';
  return '<label class="lm-prototype-field lm-prototype-numeric"><span>' + label + '</span><input type="' + inputType + '" data-prototype-field="' + id + '" aria-label="' + label + '" value="' + e(value) + '"' + min + max + step + '>' + output + hint + '</label>';
}

function componentingPage(
  screen: ReferenceScreenSpec,
  props: ComponentPageProps,
  existing?: ComponentPageElement,
): ComponentPageElement {
  const pageTags: Record<string, string> = {
    access: 'lumira-access-page',
    'teacher-profile': 'lumira-teacher-profile-page',
    'student-profile': 'lumira-student-profile-page',
    community: 'lumira-community-page',
  };
  const tag = pageTags[screen.id] ?? pageTags.community;
  const page = existing?.localName === tag ? existing : document.createElement(tag) as ComponentPageElement;
  page.configure(props);
  return page;
}
function stateIterator<T>(initial: T): LabStateIterator<T> {
  return (function* (): LabStateIterator<T> {
    let state = initial;
    while (true) {
      const transition = yield state;
      state = transition(state);
    }
  })();
}
interface DemoDataEditorElement extends HTMLElement { configure(key: string, value: unknown): void; }
const DEMO_LOADING_DURATION_MS = 1100;

export function componentingDemoLab({ screens, fixtures }: { screens: readonly ReferenceScreenSpec[]; fixtures: Record<string, unknown> }): HTMLElement {
  registerComponentElements();
  class DemoDataEditor extends HTMLElement implements DemoDataEditorElement {
    private transitions: LabStateIterator<{ key: string; json: string; error: string | null }>;
    private state: { key: string; json: string; error: string | null };

    constructor() {
      super();
      this.transitions = stateIterator<{ key: string; json: string; error: string | null }>({ key: '', json: '{}', error: null });
      this.state = this.transitions.next().value;
      this.addEventListener('click', event => this.onClick(event));
    }
    configure(key: string, value: unknown): void {
      this.state = this.transitions.next(state => ({ ...state, key, json: JSON.stringify(value, null, 2), error: null })).value;
      this.render();
    }
    private onClick(event: Event): void {
      if (!(event.target instanceof Element) || !event.target.closest('[data-apply-fixture]')) return;
      const textarea = this.querySelector<HTMLTextAreaElement>('textarea');
      if (!textarea) return;
      try {
        const value: unknown = JSON.parse(textarea.value);
        this.state = this.transitions.next(state => ({ ...state, json: textarea.value, error: null })).value;
        this.dispatchEvent(new CustomEvent('lab-fixture-change', { bubbles: true, composed: true, detail: { key: this.state.key, value } }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.state = this.transitions.next(state => ({ ...state, json: textarea.value, error: message })).value;
        this.render();
      }
    }
    private render(): void {
      this.innerHTML = '<section class="lm-data-editor"><header><div><span class="lm-eyebrow">FIXTURE DA PÁGINA</span><b>' + e(this.state.key) + '</b></div><span>JSON</span></header>'
        + '<textarea aria-label="Fixture JSON da página" spellcheck="false">' + e(this.state.json) + '</textarea>'
        + (this.state.error ? '<p class="lm-json-error" role="alert">' + e(this.state.error) + '</p>' : '')
        + '<button type="button" class="lm-primary-button" data-apply-fixture>Aplicar fixture à página</button></section>';
    }
  }

  type PrototypeEditorState = {
    screenId: string;
    region: ReferenceRegionSpec | null;
    values: PrototypeParameterValues;
  };
  class DemoPrototypeEditor extends HTMLElement {
    private transitions: LabStateIterator<PrototypeEditorState>;
    private state: PrototypeEditorState;

    constructor() {
      super();
      this.transitions = stateIterator<PrototypeEditorState>({ screenId: '', region: null, values: {} });
      this.state = this.transitions.next().value;
      this.addEventListener('click', event => this.onClick(event));
      this.addEventListener('input', event => this.onInput(event));
    }
    configure(screenId: string, region: ReferenceRegionSpec | null, fixture: ComponentFixture, active: PrototypeParameterValues): void {
      this.state = this.transitions.next(() => ({
        screenId,
        region,
        values: region ? prototypeDefaults(region, fixture, active) : {},
      })).value;
      this.render();
    }
    private onInput(event: Event): void {
      if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'range') return;
      const output = event.target.parentElement?.querySelector('output');
      if (output) output.textContent = event.target.value;
    }
    private readValues(): PrototypeParameterValues {
      const values: PrototypeParameterValues = {};
      for (const parameter of this.state.region?.parameters ?? []) {
        const control = [...this.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-prototype-field]')]
          .find(field => field.dataset.prototypeField === parameter.id);
        if (!control) continue;
        if (parameter.type === 'toggle' && control instanceof HTMLInputElement) values[parameter.id] = control.checked;
        else if (parameter.type === 'list' && control instanceof HTMLTextAreaElement) {
          values[parameter.id] = control.value.split('\n').map(item => item.trim()).filter(Boolean);
        } else if ((parameter.type === 'count' || parameter.type === 'number' || parameter.type === 'range') && control instanceof HTMLInputElement) {
          const parsed = Number(control.value);
          if (Number.isFinite(parsed)) values[parameter.id] = parsed;
        } else values[parameter.id] = control.value;
      }
      return values;
    }
    private onClick(event: Event): void {
      if (!(event.target instanceof Element)) return;
      const applyButton = event.target.closest<HTMLButtonElement>('[data-prototype-apply]');
      if (applyButton && this.contains(applyButton) && this.state.region) {
        this.dispatchEvent(new CustomEvent('lab-prototype-change', {
          bubbles: true,
          composed: true,
          detail: { screenId: this.state.screenId, componentId: this.state.region.id, values: this.readValues() },
        }));
        return;
      }
      const resetButton = event.target.closest<HTMLButtonElement>('[data-prototype-reset]');
      if (resetButton && this.contains(resetButton) && this.state.region) {
        this.dispatchEvent(new CustomEvent('lab-prototype-reset', {
          bubbles: true,
          composed: true,
          detail: { screenId: this.state.screenId, componentId: this.state.region.id },
        }));
      }
    }
    private render(): void {
      const region = this.state.region;
      if (!region) {
        this.innerHTML = '<section class="lm-prototype-editor"><p>Selecione uma parte para configurar o protótipo.</p></section>';
        return;
      }
      const controls = region.parameters.map(parameter => renderPrototypeField(parameter, this.state.values[parameter.id] ?? '')).join('');
      this.innerHTML = '<section class="lm-prototype-editor"><header><div><span class="lm-eyebrow">PROTÓTIPO PARAMETRIZADO</span><b>' + e(region.title) + '</b></div><code>' + e(region.id) + '</code></header>'
        + '<p class="lm-prototype-description">Ajuste os dados e a aparência desta peça. Aplicar altera só a prévia; redefinir volta aos dados da página.</p>'
        + '<form class="lm-prototype-fields">' + controls + '<div class="lm-prototype-actions"><button type="button" class="lm-primary-button" data-prototype-apply>Aplicar parâmetros</button><button type="button" class="lm-secondary-button" data-prototype-reset>Redefinir</button></div></form></section>';
    }
  }

  class ComponentingDemoLab extends HTMLElement {
    private transitions: LabStateIterator<LabState>;
    private state: LabState;
    private loadingTimer: number | undefined;
    private lastRenderedScreenId = '';
    private componentLoadingTimers = new Map<string, number>();
    private scrollpointObserver: IntersectionObserver | undefined;
    private popStateHandler = (): void => this.restoreSelectionFromLocation();

    constructor() {
      super();
      const initialScreen = screens.find(screen => screen.id === 'teacher-profile') ?? screens[0];
      this.transitions = stateIterator<LabState>({
        screens: [], fixtures: {}, screenId: initialScreen?.id ?? '',
        componentId: initialScreen?.defaultComponentId ?? '', role: 'professor', screenState: 'ready', componentStates: {}, componentParameters: {}, fullView: false,
      });
      this.state = this.transitions.next().value;
      this.addEventListener('click', event => this.onClick(event));
      this.addEventListener('keydown', event => this.onKeyDown(event as KeyboardEvent));
      this.addEventListener('change', event => this.onChange(event));
      this.addEventListener('lab-fixture-change', event => this.onFixtureChange(event as CustomEvent<{ key: string; value: unknown }>));
      this.addEventListener('lab-prototype-change', event => this.onPrototypeChange(event as CustomEvent<{
        screenId: string; componentId: string; values: PrototypeParameterValues;
      }>));
      this.addEventListener('lab-prototype-reset', event => this.onPrototypeReset(event as CustomEvent<{
        screenId: string; componentId: string;
      }>));
      window.addEventListener('popstate', this.popStateHandler);
    }
    disconnectedCallback(): void {
      this.clearLoadingTimer();
      this.componentLoadingTimers.forEach(timer => window.clearTimeout(timer));
      this.componentLoadingTimers.clear();
      this.scrollpointObserver?.disconnect();
      this.scrollpointObserver = undefined;
      window.removeEventListener('popstate', this.popStateHandler);
    }
    private observeScrollpoints(): void {
      this.scrollpointObserver?.disconnect();
      const scroller = this.querySelector<HTMLElement>('.lm-page-scroll');
      if (!scroller || typeof IntersectionObserver === 'undefined') return;
      this.scrollpointObserver = new IntersectionObserver(entries => {
        const current = entries
          .filter(entry => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        const componentId = (current?.target as HTMLElement | undefined)?.dataset.scrollpoint;
        if (!componentId) return;
        const selectionChanged = componentId !== this.state.componentId;
        if (selectionChanged) {
          this.selectComponent(componentId, true);
          return;
        }
        this.querySelectorAll<HTMLButtonElement>('.lm-scrollpoint-button').forEach(button => {
          const active = button.dataset.componentSelect === componentId;
          button.classList.toggle('active', active);
          button.setAttribute('aria-current', active ? 'location' : 'false');
        });
      }, { root: scroller, rootMargin: '-12% 0px -72% 0px', threshold: 0 });
      this.querySelectorAll<HTMLElement>('[data-scrollpoint]').forEach(point => this.scrollpointObserver?.observe(point));
    }
    private scrollToComponent(componentId: string): void {
      requestAnimationFrame(() => {
        const scroller = this.querySelector<HTMLElement>('.lm-page-scroll');
        const point = this.querySelector<HTMLElement>('[data-scrollpoint="' + e(componentId) + '"]');
        if (!scroller || !point) return;
        const top = scroller.scrollTop + point.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
        scroller.scrollTop = Math.max(0, top);
      });
    }
    private selectComponent(componentId: string, replaceUrl: boolean): void {
      const screen = this.state.screens.find(item => item.id === this.state.screenId);
      const region = screen?.regions.find(item => item.id === componentId);
      if (!screen || !region || componentId === this.state.componentId) return;
      this.state = this.transitions.next(state => ({ ...state, componentId })).value;
      this.writeSelectionToLocation(replaceUrl);

      this.querySelectorAll<HTMLElement>('[data-component-id]').forEach(part => {
        part.classList.toggle('is-selected', part.dataset.componentId === componentId);
        part.dataset.selectedRegion = componentId;
      });
      this.querySelectorAll<HTMLButtonElement>('.lm-scrollpoint-button').forEach(button => {
        const active = button.dataset.componentSelect === componentId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'location' : 'false');
      });
      const responsibility = region.responsibility ?? region.description;
      const paragraphs = responsibility.split(/\n\s*\n/).map(paragraph => '<p>' + e(paragraph.trim()) + '</p>').join('');
      const responsibilityPanel = this.querySelector<HTMLElement>('.lm-page-responsibility');
      if (responsibilityPanel) {
        responsibilityPanel.innerHTML = '<span class="lm-eyebrow">RESPONSABILIDADE NA PLATAFORMA · ' + e(region.title) + '</span>' + paragraphs;
      }
      const overview = this.querySelector<HTMLElement>('.lm-presentation-overview');
      if (overview) {
        overview.innerHTML = '<span class="lm-eyebrow">PARTE SELECIONADA</span><h3>' + e(region.title) + '</h3><p>' + e(region.presentation) + '</p>';
      }
      const stateSelect = this.querySelector<HTMLSelectElement>('[data-component-state]');
      if (stateSelect) {
        const selectedState = this.state.componentStates[componentStateKey(screen.id, componentId)] ?? 'inherit';
        const statuses: Array<DemoScreenState | 'inherit'> = ['inherit', 'ready', 'loading', 'empty', 'error', 'forbidden'];
        const labels: Record<DemoScreenState | 'inherit', string> = {
          inherit: 'Herdar estado da página', ready: 'Pronto', loading: 'Carregando', empty: 'Vazio', error: 'Erro', forbidden: 'Restrito',
        };
        stateSelect.dataset.componentState = componentId;
        stateSelect.dataset.screenId = screen.id;
        stateSelect.setAttribute('aria-label', 'Estado de ' + region.title);
        stateSelect.innerHTML = statuses.map(status => '<option value="' + status + '" ' + (selectedState === status ? 'selected' : '') + '>' + labels[status] + '</option>').join('');
        const stateLabel = stateSelect.parentElement?.querySelector('span');
        if (stateLabel) stateLabel.textContent = region.title;
      }
      const prototypeEditor = this.querySelector<DemoPrototypeEditor>('demo-prototype-editor');
      const activeParameters = this.state.componentParameters[componentStateKey(screen.id, componentId)] ?? {};
      prototypeEditor?.configure(screen.id, region, labRecord(this.state.fixtures[screen.fixtureKey]), activeParameters);
      const page = this.querySelector<HTMLElement>('[data-page-id]');
      if (page) page.dataset.selectedRegion = componentId;
    }
    private clearLoadingTimer(): void {
      if (this.loadingTimer !== undefined) {
        window.clearTimeout(this.loadingTimer);
        this.loadingTimer = undefined;
      }
    }
    configure(nextScreens: readonly ReferenceScreenSpec[], nextFixtures: Record<string, unknown>): void {
      const copiedFixtures = structuredClone(nextFixtures);
      const params = new URLSearchParams(window.location.search);
      const initialScreen = nextScreens.find(screen => screen.id === params.get('screen'))
        ?? nextScreens.find(screen => screen.id === 'teacher-profile')
        ?? nextScreens[0];
      const initialRegion = initialScreen?.regions.find(region => region.id === params.get('part'));
      const requestedRole = params.get('role');
      const initialRole: LabRole = requestedRole === 'aluno' || requestedRole === 'visitante' || requestedRole === 'professor'
        ? requestedRole
        : initialScreen?.id === 'student-profile' ? 'aluno' : initialScreen?.id === 'access' ? 'visitante' : 'professor';
      this.state = this.transitions.next(state => ({
        ...state, screens: nextScreens, fixtures: copiedFixtures,
        screenId: initialScreen?.id ?? '', componentId: initialRegion?.id ?? initialScreen?.defaultComponentId ?? '', role: initialRole,
      })).value;
      this.writeSelectionToLocation(true);
      this.render();
      if (initialRegion && initialRegion.id !== initialScreen?.defaultComponentId) this.scrollToComponent(initialRegion.id);
    }
    private writeSelectionToLocation(replace: boolean): void {
      const url = new URL(window.location.href);
      url.searchParams.set('screen', this.state.screenId);
      url.searchParams.set('part', this.state.componentId);
      url.searchParams.set('role', this.state.role);
      window.history[replace ? 'replaceState' : 'pushState']({ componentingDemoLab: true }, '', url);
    }
    private restoreSelectionFromLocation(): void {
      const params = new URLSearchParams(window.location.search);
      const screen = this.state.screens.find(item => item.id === params.get('screen'));
      if (!screen) return;
      const region = screen.regions.find(item => item.id === params.get('part'));
      const requestedRole = params.get('role');
      const role: LabRole = requestedRole === 'aluno' || requestedRole === 'visitante' || requestedRole === 'professor'
        ? requestedRole
        : screen.id === 'student-profile' ? 'aluno' : screen.id === 'access' ? 'visitante' : 'professor';
      this.state = this.transitions.next(state => ({
        ...state, screenId: screen.id, componentId: region?.id ?? screen.defaultComponentId, role, screenState: 'ready',
      })).value;
      this.render();
      this.scrollToComponent(region?.id ?? screen.defaultComponentId);
    }
    private onClick(event: Event): void {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      const copyLinkButton = target.closest<HTMLButtonElement>('[data-copy-demo-link]');
      if (copyLinkButton && this.contains(copyLinkButton)) {
        const button = copyLinkButton;
        const label = button.querySelector<HTMLElement>('[data-copy-demo-label]');
        const copyLabel = (): void => { if (label) label.textContent = 'Link copiado'; };
        const failLabel = (): void => { if (label) label.textContent = 'Copie o endereço da página'; };
        if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(window.location.href).then(copyLabel, failLabel);
        else failLabel();
        return;
      }
      const fullViewButton = target.closest<HTMLButtonElement>('[data-full-view-toggle]');
      if (fullViewButton && this.contains(fullViewButton)) {
        this.state = this.transitions.next(state => ({ ...state, fullView: !state.fullView })).value;
        this.render();
        this.querySelector<HTMLButtonElement>('[data-full-view-toggle]')?.focus();
        return;
      }
      const screenButton = target.closest<HTMLButtonElement>('[data-screen-select]');
      if (screenButton && this.contains(screenButton)) {
        const screen = this.state.screens.find(item => item.id === screenButton.dataset.screenSelect);
        if (screen) {
          this.clearLoadingTimer();
          const role: LabRole = screen.id === 'student-profile' ? 'aluno' : screen.id === 'access' ? 'visitante' : 'professor';
          this.state = this.transitions.next(state => ({
            ...state,
            screenId: screen.id,
            componentId: screen.defaultComponentId,
            role,
            screenState: 'ready',
          })).value;
          this.writeSelectionToLocation(false);
        }
        this.render();
        return;
      }
      const stateButton = target.closest<HTMLButtonElement>('[data-state-select]');
      if (stateButton && this.contains(stateButton)) {
        const status = stateButton.dataset.stateSelect as DemoScreenState;
        this.clearLoadingTimer();
        this.state = this.transitions.next(state => ({ ...state, screenState: status })).value;
        this.render();
        if (status === 'loading') {
          const screenId = this.state.screenId;
          this.loadingTimer = window.setTimeout(() => {
            this.loadingTimer = undefined;
            if (this.state.screenId !== screenId || this.state.screenState !== 'loading') return;
            this.state = this.transitions.next(state => ({ ...state, screenState: 'ready' })).value;
            this.render();
          }, DEMO_LOADING_DURATION_MS);
        }
        return;
      }
      const componentButton = target.closest<HTMLElement>('[data-component-select]');
      const pageComponent = target.closest<HTMLElement>('[data-component-id]')
        ?? event.composedPath().find((item): item is HTMLElement => item instanceof HTMLElement && item.hasAttribute('data-component-id'));
      const componentId = componentButton?.dataset.componentSelect ?? pageComponent?.dataset.componentId;
      const selectedElement = componentButton ?? pageComponent;
      if (componentId && componentId !== this.state.componentId && selectedElement && this.contains(selectedElement)) {
        this.selectComponent(componentId, false);
        if (componentButton) this.scrollToComponent(componentId);
      }
    }
    private onKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || !this.state.fullView) return;
      event.preventDefault();
      this.state = this.transitions.next(state => ({ ...state, fullView: false })).value;
      this.render();
      this.querySelector<HTMLButtonElement>('[data-full-view-toggle]')?.focus();
    }
    private onChange(event: Event): void {
      if (!(event.target instanceof HTMLSelectElement)) return;
      const componentStateSelect = event.target.closest<HTMLSelectElement>('[data-component-state]');
      if (componentStateSelect && this.contains(componentStateSelect)) {
        const componentId = componentStateSelect.dataset.componentState;
        const screenId = componentStateSelect.dataset.screenId;
        if (!componentId || !screenId) return;
        const key = componentStateKey(screenId, componentId);
        const previousStatus = this.state.componentStates[key];
        const nextStatus = componentStateSelect.value;
        const pendingTimer = this.componentLoadingTimers.get(key);
        if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);
        this.componentLoadingTimers.delete(key);
        this.state = this.transitions.next(state => {
          const componentStates = { ...state.componentStates };
          if (nextStatus === 'inherit') delete componentStates[key];
          else componentStates[key] = nextStatus as DemoScreenState;
          return { ...state, componentStates };
        }).value;
        this.render();
        [...this.querySelectorAll<HTMLSelectElement>('[data-component-state]')]
          .find(select => select.dataset.screenId === screenId && select.dataset.componentState === componentId)
          ?.focus();
        if (nextStatus === 'loading') {
          const timer = window.setTimeout(() => {
            this.componentLoadingTimers.delete(key);
            if (this.state.componentStates[key] !== 'loading') return;
            this.state = this.transitions.next(state => {
              const componentStates = { ...state.componentStates };
              if (previousStatus === undefined) delete componentStates[key];
              else componentStates[key] = previousStatus;
              return { ...state, componentStates };
            }).value;
            this.render();
          }, DEMO_LOADING_DURATION_MS);
          this.componentLoadingTimers.set(key, timer);
        }
        return;
      }
      if (!event.target.matches('[data-role-select]')) return;
      const role = event.target.value as LabRole;
      this.state = this.transitions.next(state => ({ ...state, role })).value;
      this.writeSelectionToLocation(true);
      this.render();
    }
    private onFixtureChange(event: CustomEvent<{ key: string; value: unknown }>): void {
      const { key, value } = event.detail;
      this.state = this.transitions.next(state => ({ ...state, fixtures: { ...state.fixtures, [key]: value } })).value;
      this.render();
    }
    private onPrototypeChange(event: CustomEvent<{
      screenId: string; componentId: string; values: PrototypeParameterValues;
    }>): void {
      const { screenId, componentId, values } = event.detail;
      const key = componentStateKey(screenId, componentId);
      const previewScrollTop = this.querySelector<HTMLElement>('.lm-page-scroll')?.scrollTop ?? 0;
      this.state = this.transitions.next(state => ({
        ...state,
        componentParameters: { ...state.componentParameters, [key]: structuredClone(values) },
      })).value;
      this.render();
      const pageScroll = this.querySelector<HTMLElement>('.lm-page-scroll');
      if (pageScroll) pageScroll.scrollTop = previewScrollTop;
      this.querySelector<HTMLButtonElement>('[data-prototype-apply]')?.focus();
    }
    private onPrototypeReset(event: CustomEvent<{ screenId: string; componentId: string }>): void {
      const { screenId, componentId } = event.detail;
      const key = componentStateKey(screenId, componentId);
      const previewScrollTop = this.querySelector<HTMLElement>('.lm-page-scroll')?.scrollTop ?? 0;
      this.state = this.transitions.next(state => {
        const componentParameters = { ...state.componentParameters };
        delete componentParameters[key];
        return { ...state, componentParameters };
      }).value;
      this.render();
      const pageScroll = this.querySelector<HTMLElement>('.lm-page-scroll');
      if (pageScroll) pageScroll.scrollTop = previewScrollTop;
      this.querySelector<HTMLButtonElement>('[data-prototype-reset]')?.focus();
    }
    private render(): void {
      const screen = this.state.screens.find(item => item.id === this.state.screenId) ?? this.state.screens[0];
      if (!screen) {
        this.innerHTML = '<main class="lm-lab-empty"><h1>Configure uma tela para iniciar.</h1></main>';
        return;
      }
      const previousScrollTop = this.querySelector<HTMLElement>('.lm-page-scroll')?.scrollTop ?? 0;
      const keepScrollPosition = this.lastRenderedScreenId === screen.id;
      const selectedRegion = screen.regions.find(region => region.id === this.state.componentId) ?? screen.regions[0];
      const selectedId = selectedRegion?.id ?? screen.defaultComponentId;
      const selectedResponsibility = selectedRegion?.responsibility ?? selectedRegion?.description ?? screen.presentation;
      const responsibilityParagraphs = selectedResponsibility.split(/\n\s*\n/).map(paragraph => '<p>' + e(paragraph.trim()) + '</p>').join('');
      const data = labRecord(this.state.fixtures[screen.fixtureKey]);
      const componentStates: Record<string, DemoScreenState> = {};
      screen.regions.forEach(region => {
        const status = this.state.componentStates[componentStateKey(screen.id, region.id)];
        if (status) componentStates[region.id] = status;
      });
      const prototypeParameters: Record<string, PrototypeParameterValues> = {};
      screen.regions.forEach(region => {
        const values = this.state.componentParameters[componentStateKey(screen.id, region.id)];
        if (values) prototypeParameters[region.id] = values;
      });
      const situation: ComponentMockSituation = {
        screenId: screen.id,
        fixtureKey: screen.fixtureKey,
        selectedRegionId: selectedId,
        role: this.state.role,
        status: this.state.screenState,
        presentationMode: 'continuous-list',
        componentStates,
      };
      const existingPage = this.querySelector<ComponentPageElement>(
        'lumira-access-page, lumira-teacher-profile-page, lumira-student-profile-page, lumira-community-page',
      ) ?? undefined;
      const pageElement = componentingPage(screen, { data, situation, prototypeParameters }, existingPage);
      pageElement.classList.add('lm-demo-flow');
      const statuses: DemoScreenState[] = ['ready', 'loading', 'empty', 'error', 'forbidden'];
      const labels: Record<DemoScreenState, string> = { ready: 'Pronto', loading: 'Carregando', empty: 'Vazio', error: 'Erro', forbidden: 'Restrito' };
      const pageButtons = this.state.screens.map(item => '<button type="button" data-screen-select="' + e(item.id) + '" class="' + (item.id === screen.id ? 'active' : '') + '"><span class="lm-page-icon">' + (item.id === 'community' ? '◌' : item.id === 'teacher-profile' ? '◎' : item.id === 'student-profile' ? '◇' : '↗') + '</span><span><b>' + e(item.title) + '</b><small>' + e(item.evidence === 'observed' ? 'TELA DE REFERÊNCIA' : item.evidence === 'derived' ? 'PROPOSTA DERIVADA' : 'MAPA DE NAVEGAÇÃO') + '</small></span><i>→</i></button>').join('');
      const componentButtons = screen.regions.map((region, index) =>
        '<button type="button" data-component-select="' + e(region.id) + '" class="lm-scrollpoint-button ' + (region.id === selectedId ? 'active' : '') + '" aria-current="' + (region.id === selectedId ? 'location' : 'false') + '">'
        + '<span class="lm-component-index">' + String(index + 1).padStart(2, '0') + '</span><span><b>' + e(region.title) + '</b><small>' + e(region.evidence === 'observed' ? 'REFERÊNCIA' : region.evidence === 'derived' ? 'DERIVADA' : 'NAVEGAÇÃO') + '</small></span></button>',
      ).join('');
      const selectedState = this.state.componentStates[componentStateKey(screen.id, selectedId)] ?? 'inherit';
      const selectedStateOptions = ['inherit', ...statuses].map(status => {
        const value = status === 'inherit' ? 'inherit' : status;
        const label = status === 'inherit' ? 'Herdar estado da página' : labels[status as DemoScreenState];
        return '<option value="' + value + '" ' + (selectedState === value ? 'selected' : '') + '>' + e(label) + '</option>';
      }).join('');
      const statusControls = statuses.map(status => '<button type="button" data-state-select="' + status + '" class="' + (this.state.screenState === status ? 'active' : '') + '">' + e(labels[status]) + '</button>').join('');
      const markup = '<div class="componenting-lab-shell' + (this.state.fullView ? ' is-full-view' : '') + '">'
        + '<aside class="lm-app-rail"><header class="lm-lab-brand"><span class="lm-brand-glyph">L</span><div><b>LUMIRA</b><small>APRESENTAÇÃO INTERATIVA</small></div></header>'
        + '<div class="lm-rail-label">TELAS DE REFERÊNCIA</div><nav class="lm-page-nav">' + pageButtons + '</nav>'
        + '<div class="lm-rail-label lm-scrollpoint-label">PONTOS DA PÁGINA</div><nav class="lm-scrollpoint-nav" aria-label="Navegação por partes da página">' + componentButtons + '</nav>'
        + '<div class="lm-rail-bottom"><span>ROTEIRO DE APRESENTAÇÃO</span><b>04 TELAS · ESTADOS INTERATIVOS</b></div></aside>'
        + '<section class="lm-preview-column"><header class="lm-preview-toolbar"><div><span class="lm-live-dot"></span><span>APRESENTAÇÃO LUMIRA</span><i>/</i><b>' + e(screen.title) + '</b></div><div class="lm-viewport-controls"><button type="button" class="lm-share-link" data-copy-demo-link><span aria-hidden="true">↗</span><span data-copy-demo-label>Compartilhar esta parte</span></button><button type="button" class="lm-full-view-toggle" data-full-view-toggle aria-pressed="' + String(this.state.fullView) + '" aria-label="' + (this.state.fullView ? 'Voltar ao laboratório' : 'Expandir prévia') + '"><span aria-hidden="true">' + (this.state.fullView ? '⤡' : '⤢') + '</span><span>' + (this.state.fullView ? 'Voltar ao laboratório' : 'Expandir prévia') + '</span></button></div></header>'
        + '<div class="lm-page-scroll"><div class="lm-page-caption"><div><span class="lm-eyebrow">LUMIRA · EXPERIÊNCIA DE PÁGINA</span><h1>' + e(screen.title) + '</h1>'
        + '<div class="lm-page-responsibility"><span class="lm-eyebrow">RESPONSABILIDADE NA PLATAFORMA · ' + e(selectedRegion?.title ?? screen.title) + '</span>' + responsibilityParagraphs + '</div>'
        + '<p class="lm-page-description">' + e(screen.description) + '</p></div><span class="lm-evidence-badge ' + e(screen.evidence) + '">' + e(screen.evidence) + '</span></div>'
        + '<div class="lm-continuous-component-list" data-screen-state="' + e(this.state.screenState) + '"><div class="lm-page-component-mount"></div></div></div>'
        + '<footer class="lm-preview-footer"><span>Dados demonstrativos · papel <b>' + e(this.state.role) + '</b></span><span>Selecione uma parte para abrir seu contexto de apresentação</span></footer></section>'
        + '<aside class="lm-inspector"><header class="lm-inspector-heading"><div><span class="lm-eyebrow">CONTROLES DA DEMONSTRAÇÃO</span><h2>Estado e propriedades</h2></div><span class="lm-inspector-mark">L</span></header>'
        + '<section class="lm-inspector-section lm-presentation-overview"><span class="lm-eyebrow">PARTE SELECIONADA</span><h3>' + e(selectedRegion?.title ?? screen.title) + '</h3>'
        + '<p>' + e(selectedRegion?.presentation ?? screen.presentation) + '</p></section>'
        + '<section class="lm-inspector-section lm-controls-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">ESTADO DA PARTE</span></header>'
        + '<label class="lm-selected-state"><span>' + e(selectedRegion?.title ?? 'Parte') + '</span><select data-component-state="' + e(selectedId) + '" data-screen-id="' + e(screen.id) + '" aria-label="Estado de ' + e(selectedRegion?.title ?? 'Parte') + '">' + selectedStateOptions + '</select></label></section>'
        + '<section class="lm-inspector-section lm-controls-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">ESTADO PADRÃO DA PÁGINA</span><label class="lm-role-picker">Papel<select data-role-select><option value="professor" ' + (this.state.role === 'professor' ? 'selected' : '') + '>Professora</option><option value="aluno" ' + (this.state.role === 'aluno' ? 'selected' : '') + '>Estudante</option><option value="visitante" ' + (this.state.role === 'visitante' ? 'selected' : '') + '>Visitante</option></select></label></header>'
        + '<div class="lm-state-controls">' + statusControls + '</div><p class="lm-state-help">O estado da parte pode herdar este padrão ou substituí-lo.</p></section>'
        + '<section class="lm-inspector-section lm-prototype-section"><div class="lm-prototype-mount"></div></section>'
        + '<section class="lm-inspector-section lm-fixture-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">DADOS DE DEMONSTRAÇÃO</span><small>EDITÁVEIS</small></header><div class="lm-fixture-mount"></div></section>'
        + '<footer class="lm-inspector-footer">O contexto aparece antes do conteúdo da parte selecionada na prévia.</footer></aside></div>';
      const editor = document.createElement('demo-data-editor') as DemoDataEditorElement;
      editor.configure(screen.fixtureKey, data);
      const prototypeEditor = document.createElement('demo-prototype-editor') as DemoPrototypeEditor;
      const selectedParameters = this.state.componentParameters[componentStateKey(screen.id, selectedId)] ?? {};
      prototypeEditor.configure(screen.id, selectedRegion ?? null, data, selectedParameters);
      const slots: Array<[string, HTMLElement]> = [
        ['<div class="lm-page-component-mount"></div>', pageElement],
        ['<div class="lm-prototype-mount"></div>', prototypeEditor],
        ['<div class="lm-fixture-mount"></div>', editor],
      ];
      const parts: Part[] = [];
      let cursor = 0;
      for (const [marker, element] of slots) {
        const markerIndex = markup.indexOf(marker, cursor);
        if (markerIndex < 0) throw new Error('Ponto de montagem ausente no Componenting Demo Lab.');
        add(parts, markup.slice(cursor, markerIndex));
        add(parts, element);
        cursor = markerIndex + marker.length;
      }
      add(parts, markup.slice(cursor));
      mountParts(this, parts);
      this.lastRenderedScreenId = screen.id;
      const pageScroll = this.querySelector<HTMLElement>('.lm-page-scroll');
      if (pageScroll) pageScroll.scrollTop = keepScrollPosition ? previousScrollTop : 0;
      this.observeScrollpoints();
    }
  }

  if (!customElements.get('demo-data-editor')) customElements.define('demo-data-editor', DemoDataEditor);
  if (!customElements.get('demo-prototype-editor')) customElements.define('demo-prototype-editor', DemoPrototypeEditor);
  if (!customElements.get('componenting-demo-lab')) customElements.define('componenting-demo-lab', ComponentingDemoLab);
  const lab = document.createElement('componenting-demo-lab') as HTMLElement & {
    configure(screens: readonly ReferenceScreenSpec[], fixtures: Record<string, unknown>): void;
  };
  lab.configure(screens, fixtures);
  return lab;
}

export interface ProgramGeneratorOptions {
  /** Pontos de injeção para inicialização controlada; o boot normal usa DOM/URL. */
  mount?: HTMLElement;
  search?: string;
}

/**
 * O generator controla a ordem da montagem. No modo demo, cria uma única página
 * stateful e injeta-a como renderer completo no `program`; no modo plataforma,
 * deixa o renderer e os eventos do `program` ativos.
 */
export function* programGenerator(
  options: ProgramGeneratorOptions = {},
): Generator<LumiraSystem, never, void> {
  const mount = options.mount ?? document.querySelector<HTMLElement>('#app');
  if (!mount) throw new Error('Elemento #app não encontrado.');

  const params = new URLSearchParams(options.search ?? location.search);
  const applicationMode = params.get('presentation') === 'application';
  const serviceMode = applicationMode && params.get('mode') === 'worker' ? 'worker' : 'demo';

  let renderView: (() => HTMLElement) | undefined;
  if (!applicationMode) {
    const demoPage = componentingDemoLab({
      screens: referenceScreenSpecs,
      fixtures: initialComponentData,
    });
    renderView = () => demoPage;
  }

  // O system API continua disponível, mas no demo toda renderização usa a
  // página e a ordem definidas pelo ComponentingDemoLab.
  const system = program({
    mount,
    mode: serviceMode,
    renderView: renderView ? () => renderView!() : undefined,
    documentTitle: applicationMode ? undefined : 'Lumira · Apresentação interativa',
    bindEvents: applicationMode,
  });

  while (true) yield system;
}

/** Uma instanciação do generator e um único ponto de montagem. */
export const system: LumiraSystem = programGenerator().next().value;
