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
import type { LumiraSystem, PresentationKeyResult } from './types';

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
type InspectorTab = 'part' | 'page' | 'data';
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
  inspectorTab: InspectorTab;
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
    'teacher-workspace': 'lumira-teacher-workspace-page',
    'student-profile': 'lumira-student-profile-page',
    'student-activity': 'lumira-student-activity-page',
    'leveling-enrollment': 'lumira-leveling-enrollment-page',
    quests: 'lumira-quests-page',
    'competency-questions': 'lumira-competency-questions-page',
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
const DEMO_ACCESS_KEY_SHA256 = '577354857eae071767721a0f07cd8d9663502309f08bfd341bdc12f10d0ae94f';
const DEMO_ACCESS_SESSION_KEY = 'lumira.presentation.pta-access.v1';

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
    private pageElements = new Map<string, ComponentPageElement>();
    private scrollpointObserver: IntersectionObserver | undefined;
    private popStateHandler = (): void => this.restoreSelectionFromLocation();

    constructor() {
      super();
      const initialScreen = screens.find(screen => screen.id === 'teacher-workspace') ?? screens.find(screen => screen.id === 'teacher-profile') ?? screens[0];
      this.transitions = stateIterator<LabState>({
        screens: [], fixtures: {}, screenId: initialScreen?.id ?? '',
        componentId: initialScreen?.defaultComponentId ?? '', role: 'professor', screenState: 'ready', componentStates: {}, componentParameters: {}, fullView: false, inspectorTab: 'part',
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
        const point = current?.target as HTMLElement | undefined;
        const componentId = point?.dataset.scrollpoint;
        const screenId = point?.dataset.screenId ?? this.state.screenId;
        if (componentId && screenId) this.selectLocation(screenId, componentId, true);
      }, { root: scroller, rootMargin: '-12% 0px -72% 0px', threshold: 0 });
      this.querySelectorAll<HTMLElement>('[data-scrollpoint]').forEach(point => this.scrollpointObserver?.observe(point));
    }
    private focusedScrollpoint(): { screenId: string; componentId: string } | undefined {
      const scroller = this.querySelector<HTMLElement>('.lm-page-scroll');
      if (!scroller) return undefined;
      const bounds = scroller.getBoundingClientRect();
      const focusY = bounds.top + Math.max(1, bounds.height * 0.2);
      const points = [...this.querySelectorAll<HTMLElement>('[data-scrollpoint]')];
      const point = points.find(item => {
        const rect = item.getBoundingClientRect();
        return rect.top <= focusY && rect.bottom >= focusY;
      }) ?? points
        .map(item => {
          const rect = item.getBoundingClientRect();
          const distance = rect.bottom < focusY ? focusY - rect.bottom : rect.top - focusY;
          return { item, distance };
        })
        .sort((left, right) => left.distance - right.distance)[0]?.item;
      const screenId = point?.dataset.screenId;
      const componentId = point?.dataset.scrollpoint;
      return screenId && componentId ? { screenId, componentId } : undefined;
    }
    private captureExpandedLocation(): void {
      if (!this.state.fullView) return;
      const focused = this.focusedScrollpoint();
      if (focused) this.selectLocation(focused.screenId, focused.componentId, true);
    }
    private scrollToComponent(componentId: string, screenId = this.state.screenId): void {
      requestAnimationFrame(() => {
        const scroller = this.querySelector<HTMLElement>('.lm-page-scroll');
        const point = [...this.querySelectorAll<HTMLElement>('[data-scrollpoint]')]
          .find(item => item.dataset.scrollpoint === componentId && item.dataset.screenId === screenId);
        if (!scroller || !point) return;
        const top = scroller.scrollTop + point.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
        scroller.scrollTop = Math.max(0, top);
      });
    }
    private selectComponent(componentId: string, replaceUrl: boolean): void {
      this.selectLocation(this.state.screenId, componentId, replaceUrl);
    }
    private roleForScreen(screenId: string): LabRole {
      return ['student-profile', 'student-activity', 'leveling-enrollment', 'quests', 'competency-questions'].includes(screenId)
        ? 'aluno'
        : screenId === 'access' ? 'visitante' : 'professor';
    }
    private selectLocation(screenId: string, componentId: string, replaceUrl: boolean): void {
      const screen = this.state.screens.find(item => item.id === screenId);
      const region = screen?.regions.find(item => item.id === componentId);
      if (!screen || !region) return;
      const selectionChanged = screenId !== this.state.screenId || componentId !== this.state.componentId;
      if (!selectionChanged) return;
      this.state = this.transitions.next(state => ({
        ...state,
        screenId,
        componentId,
        role: screenId === state.screenId ? state.role : this.roleForScreen(screenId),
        screenState: screenId === state.screenId ? state.screenState : 'ready',
        inspectorTab: state.fullView ? state.inspectorTab : 'part',
      })).value;
      this.syncInspectorTabs();
      this.writeSelectionToLocation(replaceUrl);

      this.querySelectorAll<HTMLElement>('[data-component-id]').forEach(part => {
        const belongsToScreen = part.dataset.screenId === screenId;
        part.classList.toggle('is-selected', belongsToScreen && part.dataset.componentId === componentId);
        if (belongsToScreen) part.dataset.selectedRegion = componentId;
      });
      this.querySelectorAll<HTMLButtonElement>('.lm-scrollpoint-button').forEach(button => {
        const active = button.dataset.screenId === screenId && button.dataset.componentSelect === componentId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'location' : 'false');
      });
      this.querySelectorAll<HTMLButtonElement>('.lm-page-nav [data-screen-select]').forEach(button => {
        const active = button.dataset.screenSelect === screenId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'page' : 'false');
      });
      const toolbarTitle = this.querySelector<HTMLElement>('[data-current-screen-title]');
      if (toolbarTitle) toolbarTitle.textContent = screen.title;
      const roleLabel = this.querySelector<HTMLElement>('[data-current-role]');
      if (roleLabel) roleLabel.textContent = this.state.role;
      const responsibility = region.responsibility ?? region.description;
      const paragraphs = responsibility.split(/\n\s*\n/).map(paragraph => '<p>' + e(paragraph.trim()) + '</p>').join('');
      const responsibilityPanel = [...this.querySelectorAll<HTMLElement>('.lm-page-responsibility')]
        .find(item => !item.dataset.screenId || item.dataset.screenId === screenId);
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
      const page = this.pageElements.get(screenId) as HTMLElement | undefined;
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
        ?? nextScreens.find(screen => screen.id === 'teacher-workspace')
        ?? nextScreens.find(screen => screen.id === 'teacher-profile')
        ?? nextScreens[0];
      const initialRegion = initialScreen?.regions.find(region => region.id === params.get('part'));
      const requestedRole = params.get('role');
      const initialRole: LabRole = requestedRole === 'aluno' || requestedRole === 'visitante' || requestedRole === 'professor'
        ? requestedRole
        : ['student-profile', 'student-activity', 'leveling-enrollment', 'quests', 'competency-questions'].includes(initialScreen?.id ?? '') ? 'aluno' : initialScreen?.id === 'access' ? 'visitante' : 'professor';
      this.state = this.transitions.next(state => ({
        ...state, screens: nextScreens, fixtures: copiedFixtures,
        screenId: initialScreen?.id ?? '', componentId: initialRegion?.id ?? initialScreen?.defaultComponentId ?? '', role: initialRole, inspectorTab: 'part',
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
        : ['student-profile', 'student-activity', 'leveling-enrollment', 'quests', 'competency-questions'].includes(screen.id) ? 'aluno' : screen.id === 'access' ? 'visitante' : 'professor';
      this.state = this.transitions.next(state => ({
        ...state, screenId: screen.id, componentId: region?.id ?? screen.defaultComponentId, role, screenState: 'ready', inspectorTab: 'part',
      })).value;
      this.render();
      this.scrollToComponent(region?.id ?? screen.defaultComponentId);
    }
    private selectInspectorTab(tab: InspectorTab): void {
      if (tab !== this.state.inspectorTab) {
        this.state = this.transitions.next(state => ({ ...state, inspectorTab: tab })).value;
      }
      this.syncInspectorTabs();
    }
    private syncInspectorTabs(): void {
      this.querySelectorAll<HTMLButtonElement>('[data-inspector-tab]').forEach(button => {
        const selected = button.dataset.inspectorTab === this.state.inspectorTab;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      this.querySelectorAll<HTMLElement>('[data-inspector-panel]').forEach(panel => {
        const selected = panel.dataset.inspectorPanel === this.state.inspectorTab;
        panel.hidden = !selected;
        panel.setAttribute('aria-hidden', String(!selected));
      });
    }
    private onClick(event: Event): void {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      const tabButton = target.closest<HTMLButtonElement>('[data-inspector-tab]');
      if (tabButton && this.contains(tabButton)) {
        const tab = tabButton.dataset.inspectorTab as InspectorTab | undefined;
        if (tab === 'part' || tab === 'page' || tab === 'data') this.selectInspectorTab(tab);
        return;
      }
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
        this.captureExpandedLocation();
        const enteringFullView = !this.state.fullView;
        if (!enteringFullView) this.clearWorkspaceSearch();
        this.state = this.transitions.next(state => ({ ...state, fullView: enteringFullView })).value;
        this.render();
        this.scrollToComponent(this.state.componentId, this.state.screenId);
        this.querySelector<HTMLButtonElement>('[data-full-view-toggle]')?.focus();
        return;
      }
      const screenButton = target.closest<HTMLButtonElement>('[data-screen-select]');
      if (screenButton && this.contains(screenButton)) {
        const screen = this.state.screens.find(item => item.id === screenButton.dataset.screenSelect);
        if (screen) {
          const requestedComponent = screenButton.dataset.componentSelect;
          const componentId = screen.regions.some(region => region.id === requestedComponent)
            ? requestedComponent as string
            : screen.defaultComponentId;
          if (this.state.fullView) {
            this.selectLocation(screen.id, componentId, true);
            this.scrollToComponent(componentId, screen.id);
            return;
          }
          this.clearLoadingTimer();
          const role = this.roleForScreen(screen.id);
          this.state = this.transitions.next(state => ({
            ...state,
            screenId: screen.id,
            componentId,
            role,
            screenState: 'ready',
            inspectorTab: 'part',
          })).value;
          this.writeSelectionToLocation(false);
          this.render();
          this.scrollToComponent(componentId, screen.id);
          return;
        }
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
      if (componentId && selectedElement && this.contains(selectedElement)) {
        const screenId = componentButton?.dataset.screenId ?? pageComponent?.dataset.screenId ?? this.state.screenId;
        if (componentId !== this.state.componentId || screenId !== this.state.screenId) {
          this.selectLocation(screenId, componentId, false);
        }
        if (componentButton) this.scrollToComponent(componentId, screenId);
      }
    }
    private onKeyDown(event: KeyboardEvent): void {
      const search = event.target instanceof Element
        ? event.target.closest<HTMLInputElement>('[data-workspace-search]')
        : null;
      if (search && this.contains(search) && event.key === 'Enter') {
        const match = this.querySelector<HTMLElement>('.lm-part-session.lm-search-match[data-scrollpoint]');
        const screenId = match?.dataset.screenId;
        const componentId = match?.dataset.scrollpoint;
        if (screenId && componentId) {
          event.preventDefault();
          this.selectLocation(screenId, componentId, true);
          this.scrollToComponent(componentId, screenId);
        }
        return;
      }
      const currentTab = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>('[data-inspector-tab]')
        : null;
      if (currentTab && this.contains(currentTab)) {
        const tabs = [...this.querySelectorAll<HTMLButtonElement>('[data-inspector-tab]')];
        const currentIndex = tabs.indexOf(currentTab);
        const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length
          : event.key === 'ArrowLeft' ? (currentIndex - 1 + tabs.length) % tabs.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (nextIndex >= 0) {
          event.preventDefault();
          const nextTab = tabs[nextIndex];
          const tab = nextTab.dataset.inspectorTab as InspectorTab | undefined;
          if (tab === 'part' || tab === 'page' || tab === 'data') this.selectInspectorTab(tab);
          nextTab.focus();
          return;
        }
      }
      if (event.key !== 'Escape' || !this.state.fullView) return;
      event.preventDefault();
      this.captureExpandedLocation();
      this.clearWorkspaceSearch();
      this.state = this.transitions.next(state => ({ ...state, fullView: false })).value;
      this.render();
      this.scrollToComponent(this.state.componentId, this.state.screenId);
      this.querySelector<HTMLButtonElement>('[data-full-view-toggle]')?.focus();
    }
    private clearWorkspaceSearch(): void {
      this.querySelectorAll<HTMLInputElement>('[data-workspace-search]').forEach(input => { input.value = ''; });
      this.querySelectorAll<HTMLOutputElement>('[data-workspace-search-count]').forEach(output => { output.textContent = ''; });
      this.querySelectorAll<HTMLElement>('.lm-part-session').forEach(point => {
        point.classList.remove('lm-search-match', 'lm-search-muted');
      });
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
      const pageMounts: Array<[string, HTMLElement]> = [];
      const screensToMount = this.state.fullView ? this.state.screens : [screen];
      const pageMarkup = screensToMount.map((item, screenIndex) => {
        const isActive = item.id === screen.id;
        const flowIndexOffset = this.state.screens.slice(0, screenIndex)
          .reduce((total, preceding) => total + preceding.regions.length, 0);
        const itemRegion = isActive
          ? selectedRegion
          : item.regions.find(region => region.id === item.defaultComponentId) ?? item.regions[0];
        const itemSelectedId = itemRegion?.id ?? item.defaultComponentId;
        const itemData = labRecord(this.state.fixtures[item.fixtureKey]);
        const itemComponentStates: Record<string, DemoScreenState> = {};
        item.regions.forEach(region => {
          const status = this.state.componentStates[componentStateKey(item.id, region.id)];
          if (status) itemComponentStates[region.id] = status;
        });
        const itemPrototypeParameters: Record<string, PrototypeParameterValues> = {};
        item.regions.forEach(region => {
          const values = this.state.componentParameters[componentStateKey(item.id, region.id)];
          if (values) itemPrototypeParameters[region.id] = values;
        });
        const situation: ComponentMockSituation = {
          screenId: item.id,
          fixtureKey: item.fixtureKey,
          selectedRegionId: itemSelectedId,
          role: isActive ? this.state.role : this.roleForScreen(item.id),
          status: isActive ? this.state.screenState : 'ready',
          presentationMode: 'continuous-list',
          ...(this.state.fullView ? { flowIndexOffset } : {}),
          componentStates: itemComponentStates,
        };
        const page = componentingPage(item, { data: itemData, situation, prototypeParameters: itemPrototypeParameters }, this.pageElements.get(item.id));
        page.classList.add('lm-demo-flow');
        this.pageElements.set(item.id, page);
        const marker = this.state.fullView
          ? '<span class="lm-flow-page-mount" data-flow-page-mount="' + e(item.id) + '"></span>'
          : '<div class="lm-page-component-mount"></div>';
        pageMounts.push([marker, page]);
        if (!this.state.fullView) return marker;
        return marker;
      }).join('');
      const statuses: DemoScreenState[] = ['ready', 'loading', 'empty', 'error', 'forbidden'];
      const labels: Record<DemoScreenState, string> = { ready: 'Pronto', loading: 'Carregando', empty: 'Vazio', error: 'Erro', forbidden: 'Restrito' };
      const pageButtons = this.state.screens.map(item => '<button type="button" data-screen-select="' + e(item.id) + '" class="' + (item.id === screen.id ? 'active' : '') + '" aria-current="' + (item.id === screen.id ? 'page' : 'false') + '"><span class="lm-page-icon">' + (item.id === 'community' ? '◌' : item.id === 'teacher-profile' ? '◎' : item.id === 'student-profile' ? '◇' : item.id === 'teacher-workspace' ? '▤' : item.id === 'student-activity' ? '✎' : item.id === 'leveling-enrollment' ? '＋' : item.id === 'quests' ? '⚑' : item.id === 'competency-questions' ? '▤' : '↗') + '</span><span><b>' + e(item.title) + '</b><small>' + e(item.evidence === 'observed' ? 'TELA DE REFERÊNCIA' : item.evidence === 'derived' ? 'PROPOSTA DERIVADA' : 'MAPA DE NAVEGAÇÃO') + '</small></span><i>→</i></button>').join('');
      const componentButtons = screen.regions.map((region, index) =>
        '<button type="button" data-component-select="' + e(region.id) + '" data-screen-id="' + e(screen.id) + '" class="lm-scrollpoint-button ' + (region.id === selectedId ? 'active' : '') + '" aria-current="' + (region.id === selectedId ? 'location' : 'false') + '">'
        + '<span class="lm-component-index">' + String(index + 1).padStart(2, '0') + '</span><span><b>' + e(region.title) + '</b><small>' + e(region.evidence === 'observed' ? 'REFERÊNCIA' : region.evidence === 'derived' ? 'DERIVADA' : 'NAVEGAÇÃO') + '</small></span></button>',
      ).join('');
      const selectedState = this.state.componentStates[componentStateKey(screen.id, selectedId)] ?? 'inherit';
      const selectedStateOptions = ['inherit', ...statuses].map(status => {
        const value = status === 'inherit' ? 'inherit' : status;
        const label = status === 'inherit' ? 'Herdar estado da página' : labels[status as DemoScreenState];
        return '<option value="' + value + '" ' + (selectedState === value ? 'selected' : '') + '>' + e(label) + '</option>';
      }).join('');
      const statusControls = statuses.map(status => '<button type="button" data-state-select="' + status + '" class="' + (this.state.screenState === status ? 'active' : '') + '">' + e(labels[status]) + '</button>').join('');
      const inspectorTabs: Array<[InspectorTab, string]> = [['part', 'Parte'], ['page', 'Página'], ['data', 'Dados']];
      const inspectorTabButtons = inspectorTabs.map(([tab, label]) => {
        const selected = this.state.inspectorTab === tab;
        return '<button type="button" id="inspector-tab-' + tab + '" role="tab" aria-controls="inspector-panel-' + tab + '" aria-selected="' + String(selected) + '" tabindex="' + (selected ? '0' : '-1') + '" data-inspector-tab="' + tab + '" class="' + (selected ? 'active' : '') + '">' + label + '</button>';
      }).join('');
      const markup = '<div class="componenting-lab-shell' + (this.state.fullView ? ' is-full-view' : '') + '">'
        + '<aside class="lm-app-rail"><header class="lm-lab-brand"><span class="lm-brand-glyph">L</span><div><b>LUMIRA</b><small>APRESENTAÇÃO INTERATIVA</small></div></header>'
        + '<div class="lm-rail-label">TELAS DE REFERÊNCIA</div><nav class="lm-page-nav">' + pageButtons + '</nav>'
        + '<div class="lm-rail-label lm-scrollpoint-label">PONTOS DA PÁGINA</div><nav class="lm-scrollpoint-nav" aria-label="Navegação por partes da página">' + componentButtons + '</nav>'
        + '<div class="lm-rail-bottom"><span>ROTEIRO DE APRESENTAÇÃO</span><b>' + String(this.state.screens.length).padStart(2, '0') + ' TELAS · ESTADOS INTERATIVOS</b></div></aside>'
        + '<section class="lm-preview-column"><header class="lm-preview-toolbar"><div><span class="lm-live-dot"></span><span>APRESENTAÇÃO LUMIRA</span><i>/</i><b data-current-screen-title>' + e(screen.title) + '</b></div><div class="lm-viewport-controls"><button type="button" class="lm-share-link" data-copy-demo-link><span aria-hidden="true">↗</span><span data-copy-demo-label>Compartilhar esta parte</span></button><button type="button" class="lm-full-view-toggle" data-full-view-toggle aria-pressed="' + String(this.state.fullView) + '" aria-label="' + (this.state.fullView ? 'Voltar ao laboratório' : 'Expandir prévia') + '"><span aria-hidden="true">' + (this.state.fullView ? '⤡' : '⤢') + '</span><span>' + (this.state.fullView ? 'Voltar ao laboratório' : 'Expandir prévia') + '</span></button></div></header>'
        + '<div class="lm-page-scroll">' + (this.state.fullView
          ? '<div class="lm-continuous-component-list lm-full-flow-list" data-screen-id="' + e(screen.id) + '" data-screen-state="' + e(this.state.screenState) + '">' + pageMarkup + '</div>'
          : '<div class="lm-page-caption"><div><span class="lm-eyebrow">LUMIRA · EXPERIÊNCIA DE PÁGINA</span><h1>' + e(screen.title) + '</h1>'
            + '<div class="lm-page-responsibility" data-screen-id="' + e(screen.id) + '"><span class="lm-eyebrow">RESPONSABILIDADE NA PLATAFORMA · ' + e(selectedRegion?.title ?? screen.title) + '</span>' + responsibilityParagraphs + '</div>'
            + '<p class="lm-page-description">' + e(screen.description) + '</p></div><span class="lm-evidence-badge ' + e(screen.evidence) + '">' + e(screen.evidence) + '</span></div>'
            + '<div class="lm-continuous-component-list" data-screen-id="' + e(screen.id) + '" data-screen-state="' + e(this.state.screenState) + '">' + pageMarkup + '</div>') + '</div>'
        + '<footer class="lm-preview-footer"><span>Dados demonstrativos · papel <b data-current-role>' + e(this.state.role) + '</b></span><span>Selecione uma parte para abrir seu contexto de apresentação</span></footer></section>'
        + '<aside class="lm-inspector"><header class="lm-inspector-heading"><div><span class="lm-eyebrow">CONTROLES DA DEMONSTRAÇÃO</span><h2>Estado e propriedades</h2></div><span class="lm-inspector-mark">L</span></header>'
        + '<nav class="lm-inspector-tabs" role="tablist" aria-label="Propriedades da demonstração">' + inspectorTabButtons + '</nav>'
        + '<section class="lm-inspector-panel" id="inspector-panel-part" role="tabpanel" aria-labelledby="inspector-tab-part" data-inspector-panel="part" tabindex="0"' + (this.state.inspectorTab === 'part' ? '' : ' hidden') + '>'
        + '<section class="lm-inspector-section lm-presentation-overview"><span class="lm-eyebrow">PARTE SELECIONADA</span><h3>' + e(selectedRegion?.title ?? screen.title) + '</h3>'
        + '<p>' + e(selectedRegion?.presentation ?? screen.presentation) + '</p></section>'
        + '<section class="lm-inspector-section lm-controls-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">ESTADO DA PARTE</span></header>'
        + '<label class="lm-selected-state"><span>' + e(selectedRegion?.title ?? 'Parte') + '</span><select data-component-state="' + e(selectedId) + '" data-screen-id="' + e(screen.id) + '" aria-label="Estado de ' + e(selectedRegion?.title ?? 'Parte') + '">' + selectedStateOptions + '</select></label></section>'
        + '<section class="lm-inspector-section lm-prototype-section"><div class="lm-prototype-mount"></div></section></section>'
        + '<section class="lm-inspector-panel" id="inspector-panel-page" role="tabpanel" aria-labelledby="inspector-tab-page" data-inspector-panel="page" tabindex="0"' + (this.state.inspectorTab === 'page' ? '' : ' hidden') + '>'
        + '<section class="lm-inspector-section lm-controls-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">ESTADO PADRÃO DA PÁGINA</span><label class="lm-role-picker">Papel<select data-role-select><option value="professor" ' + (this.state.role === 'professor' ? 'selected' : '') + '>Professora</option><option value="aluno" ' + (this.state.role === 'aluno' ? 'selected' : '') + '>Estudante</option><option value="visitante" ' + (this.state.role === 'visitante' ? 'selected' : '') + '>Visitante</option></select></label></header>'
        + '<div class="lm-state-controls">' + statusControls + '</div><p class="lm-state-help">O estado da parte pode herdar este padrão ou substituí-lo.</p></section></section>'
        + '<section class="lm-inspector-panel" id="inspector-panel-data" role="tabpanel" aria-labelledby="inspector-tab-data" data-inspector-panel="data" tabindex="0"' + (this.state.inspectorTab === 'data' ? '' : ' hidden') + '>'
        + '<section class="lm-inspector-section lm-fixture-section"><header class="lm-inspector-section-heading"><span class="lm-eyebrow">DADOS DE DEMONSTRAÇÃO</span><small>EDITÁVEIS</small></header><div class="lm-fixture-mount"></div></section></section>'
        + '<footer class="lm-inspector-footer">Controles demonstrativos da parte, da página e dos dados simulados.</footer></aside></div>';
      const editor = document.createElement('demo-data-editor') as DemoDataEditorElement;
      editor.configure(screen.fixtureKey, data);
      const prototypeEditor = document.createElement('demo-prototype-editor') as DemoPrototypeEditor;
      const selectedParameters = this.state.componentParameters[componentStateKey(screen.id, selectedId)] ?? {};
      prototypeEditor.configure(screen.id, selectedRegion ?? null, data, selectedParameters);
      const slots: Array<[string, HTMLElement]> = [
        ...pageMounts,
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

type AccessGateState = { page: HTMLElement | null; error: string; entry: string; authorized: boolean };
function accessKeyDigest(value: string): Promise<string> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)).then(buffer =>
    Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join(''));
}
function normalizeAccessKey(value: string): string {
  return value.normalize('NFKC').trim().toLocaleUpperCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
function protectDemoWithAccessKey(page: HTMLElement): HTMLElement {
  interface AccessGateElement extends HTMLElement { configure(page: HTMLElement): void; }
  if (!customElements.get('lumira-access-gate')) {
    class LumiraAccessGate extends HTMLElement implements AccessGateElement {
      private transitions: LabStateIterator<AccessGateState>;
      private state: AccessGateState;
      constructor() {
        super();
        this.transitions = stateIterator<AccessGateState>({ page: null, error: '', entry: '', authorized: false });
        this.state = this.transitions.next().value;
        this.addEventListener('submit', event => { void this.onSubmit(event); });
      }
      configure(content: HTMLElement): void {
        this.state = this.transitions.next(state => ({ ...state, page: content })).value;
        this.render();
      }
      private async onSubmit(event: Event): Promise<void> {
        const form = event.target instanceof HTMLFormElement ? event.target : undefined;
        if (!form?.matches('[data-demo-access-form]')) return;
        event.preventDefault();
        const input = form.querySelector<HTMLInputElement>('[name="accessKey"]');
        const entry = input?.value ?? '';
        const candidate = normalizeAccessKey(entry);
        if (!candidate) {
          this.state = this.transitions.next(state => ({ ...state, entry, error: 'Digite a chave PTA para continuar.' })).value;
          this.render();
          this.querySelector<HTMLInputElement>('[name="accessKey"]')?.focus();
          return;
        }
        try {
          let authorized = false;
          if (window.lumiraDesktop) {
            const result: PresentationKeyResult = await window.lumiraDesktop.verifyPresentationKey(candidate);
            if (!result.configured) {
              this.state = this.transitions.next(state => ({ ...state, entry, error: 'Configure LUMIRA_PTA_KEY no arquivo .env do app Electron.' })).value;
              this.render();
              this.querySelector<HTMLInputElement>('[name="accessKey"]')?.focus();
              return;
            }
            authorized = result.valid;
          } else {
            const digest = await accessKeyDigest(candidate);
            let difference = 0;
            for (let index = 0; index < DEMO_ACCESS_KEY_SHA256.length; index++) {
              difference |= digest.charCodeAt(index) ^ DEMO_ACCESS_KEY_SHA256.charCodeAt(index);
            }
            authorized = difference === 0;
          }
          if (!authorized) {
            this.state = this.transitions.next(state => ({ ...state, entry, error: 'Chave não reconhecida. Confira o código de acesso.' })).value;
            this.render();
            this.querySelector<HTMLInputElement>('[name="accessKey"]')?.focus();
            return;
          }
          try { sessionStorage.setItem(DEMO_ACCESS_SESSION_KEY, 'authorized'); } catch { /* Acesso vale nesta aba mesmo sem sessão persistente. */ }
          this.state = this.transitions.next(state => ({ ...state, error: '', entry: '', authorized: true })).value;
          this.render();
        } catch {
          this.state = this.transitions.next(state => ({ ...state, entry, error: 'A conferência da chave exige uma conexão segura HTTPS.' })).value;
          this.render();
        }
      }
      private render(): void {
        let sessionAuthorized = false;
        try { sessionAuthorized = sessionStorage.getItem(DEMO_ACCESS_SESSION_KEY) === 'authorized'; } catch { /* Sessão indisponível. */ }
        if (this.state.page && (this.state.authorized || sessionAuthorized)) {
          this.replaceChildren(this.state.page);
          return;
        }
        const helpId = this.state.error ? 'lm-presentation-key-error' : 'lm-presentation-key-help';
        const helpText = window.lumiraDesktop
          ? 'A PTA do desktop é validada a partir de LUMIRA_PTA_KEY no arquivo .env local.'
          : 'A chave diferencia esta apresentação das páginas públicas de referência.';
        this.innerHTML = '<main class="lm-access-gate"><section class="lm-access-gate-intro"><span class="lm-access-gate-mark">L</span><span class="lm-eyebrow">LUMIRA · COMPONENTING DEMO LAB</span><h1>Uma plataforma que torna o raciocínio visível.</h1><p>Explore as telas, as partes de página e suas interações demonstrativas.</p><small>Apresentação de produto · acesso por convite</small></section>'
          + '<section class="lm-access-gate-panel"><form data-demo-access-form><span class="lm-eyebrow">CHAVE DE APRESENTAÇÃO</span><h2>Digite a chave PTA</h2><p>Use o código que acompanha o convite para abrir a demonstração.</p><label for="lm-presentation-key">Chave de acesso</label><input id="lm-presentation-key" name="accessKey" type="password" autocomplete="current-password" spellcheck="false" required aria-invalid="' + String(Boolean(this.state.error)) + '" aria-describedby="' + helpId + '" value="' + e(this.state.entry) + '" placeholder="PTA-XXXX-XXXX-…">'
          + (this.state.error ? '<p id="lm-presentation-key-error" class="lm-access-gate-error" role="alert">' + e(this.state.error) + '</p>' : '<small id="lm-presentation-key-help">' + e(helpText) + '</small>')
          + '<button type="submit" class="lm-access-gate-submit">Abrir apresentação <span aria-hidden="true">↗</span></button></form><small class="lm-access-gate-note">O código é compartilhado separadamente.</small></section></main>';
      }
    }
    customElements.define('lumira-access-gate', LumiraAccessGate);
  }
  const gate = document.createElement('lumira-access-gate') as AccessGateElement;
  gate.configure(page);
  return gate;
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
    const protectedDemo = protectDemoWithAccessKey(demoPage);
    renderView = () => protectedDemo;
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
