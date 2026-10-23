export type Role = 'professor' | 'aluno' | 'admin';

export interface SessionUser {
  id: string;
  name: string;
  handle: string;
  role: Role;
  grade?: string;
  school: string;
}

export interface Competency {
  id: string;
  title: string;
  action: string;
  object: string;
  bncc: string[];
  criteria: string[];
  status: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  students: number;
  teacher: string;
  grade: number;
}

export interface ContractVersion {
  version: number;
  text: string;
}

export interface Contracts {
  interpretation: ContractVersion;
  generation: ContractVersion;
  evaluation: ContractVersion;
}

export interface Material {
  id: string;
  title: string;
  status: string;
  subject: string;
  skillIds: string[];
}

export interface CommunityPost {
  id: string;
  author: string;
  role: string;
  space: 'comunidade' | 'forum-docente';
  subject: string;
  title: string;
  text: string;
  likes: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: string;
  status: string;
  leaderboard: unknown[];
}

export interface SocialProfile {
  cover: string;
  bio: string;
  music: string;
  stories: string[];
  displayProgress: boolean;
}

export interface Preview {
  id: string;
  mode: string;
  status: string;
  contractVersion: number;
  question: string;
  internal: string;
}

export interface Answer {
  text: string;
  status: string;
  id: string;
}

export interface AgeGradeContext {
  age: number | null;
  grade: number;
  referenceAge: number | null;
  deviationYears: number | null;
  coefficient: number | null;
  policyVersion: string;
  note: string;
}

export interface SondagemPlan {
  id: string;
  status: 'draft';
  grade: number;
  ageGrade: AgeGradeContext;
  competencies: Array<{
    id: string;
    title: string;
    contexts: number;
    evidenceCriteria: string[];
    items: unknown[];
    state: string;
  }>;
  gradeAdvance: null;
  reviewRequired: true;
  policyVersion: string;
}

export interface AppSnapshot {
  user: SessionUser | null;
  competencies: Competency[];
  classes: ClassRoom[];
  contracts: Contracts;
  materials: Material[];
  posts: CommunityPost[];
  events: CommunityEvent[];
  social: SocialProfile;
  preview: Preview | null;
  sondagem: SondagemPlan | null;
  answer: Answer | null;
  activityOpen: boolean;
}

export interface LoginInput {
  role: Role;
}

export type ContractInput = Partial<Record<keyof Contracts, string>>;

export interface SondagemInput {
  grade: string | number;
  birthDate: string;
}

export interface PostInput {
  title: string;
  text: string;
  space?: 'comunidade' | 'forum-docente';
}

export interface ProfileInput {
  bio?: string;
  music?: string;
  cover?: string;
  displayProgress?: boolean;
}

export interface Gateway {
  readonly mode: 'demo' | 'worker';
  login(input: LoginInput): Promise<AppSnapshot>;
  logout(): Promise<AppSnapshot>;
  snapshot(): Promise<AppSnapshot>;
  saveContracts(input: ContractInput): Promise<AppSnapshot>;
  prepareSondagem(input: SondagemInput): Promise<AppSnapshot>;
  generatePreview(): Promise<AppSnapshot>;
  publishActivity(): Promise<AppSnapshot>;
  submitAnswer(text: string): Promise<AppSnapshot>;
  publishPost(input: PostInput): Promise<AppSnapshot>;
  saveProfile(input: ProfileInput): Promise<AppSnapshot>;
}

export interface LumiraSystem {
  navigate(route: string): void;
  render(): void;
  login(input: LoginInput): Promise<void>;
  logout(): Promise<void>;
  saveContracts(input: ContractInput): Promise<void>;
  prepareSondagem(input: SondagemInput): Promise<void>;
  generatePreview(): Promise<void>;
  publishActivity(): Promise<void>;
  submitAnswer(text: string): Promise<void>;
  publishPost(input: PostInput): Promise<void>;
  saveProfile(input: ProfileInput): Promise<void>;
  saveDraft(): void;
  snapshot(): AppSnapshot | null;
  info(): { mode: Gateway['mode']; role: Role | null; pending: boolean };
  destroy(): void;
}

export interface ProjectAssistantContext {
  title: string;
  authors: string;
  goal: string;
  justification: string;
  summary: string;
  audience: string;
  competencies: string[];
  learningEvidence: string;
  socialDraft: boolean;
  milestones: Array<{ title: string; date: string }>;
}

export interface ProjectAssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProjectAssistantRequest {
  requestId: string;
  partId: 'teacher-projects' | 'student-projects';
  kind: 'conversation' | 'reflection' | 'review';
  prompt: string;
  context: ProjectAssistantContext;
  conversation: ProjectAssistantMessage[];
}

export interface QuestionnaireMonitorAnswer {
  questionId: string;
  title: string;
  context: string;
  prompt: string;
  response: string;
}

export interface QuestionnaireMonitorRequest {
  requestId: string;
  partId: 'competency-question-response';
  attemptNumber: number;
  competency: string;
  answers: QuestionnaireMonitorAnswer[];
}

export interface QuestionnaireMonitorResult {
  requestId: string;
  reply?: string;
  error?: string;
}

export interface LevelingSkillInput {
  code: string;
  description: string;
}

export interface LevelingThesisInput {
  delimitation: string;
  claim: string;
  evidence: string;
  counterpoint: string;
  limits: string;
  conclusion: string;
}

export interface LevelingQuestionGenerationRequest {
  requestId: string;
  partId: 'leveling-assessment';
  age: number;
  grade: number;
  thesis: LevelingThesisInput;
  competency: { title: string; description: string; skills: LevelingSkillInput[] };
  intents: string[];
  questionCount: number;
}

export interface ForgeAuthenticationRequest {
  requestId: string;
  repositoryPat: string;
  routerKey: string;
}

export interface ForgeAuthenticationResult {
  requestId: string;
  error?: string;
}

export interface LevelingGeneratedQuestion {
  id: string;
  title: string;
  context: string;
  prompt: string;
  evidence: string;
  choices: string[];
  correctOption: number;
  explanation: string;
  points: number;
  skillCodes: string[];
  intent: string;
}

export interface LevelingQuestionGenerationResult {
  requestId: string;
  questions?: LevelingGeneratedQuestion[];
  error?: string;
}

export interface SubjectSkillUnderstandingRequest {
  requestId: string;
  partId: 'pedagogy-context';
  skillName: string;
}

export interface SubjectSkillUnderstandingResult {
  requestId: string;
  skillName: string;
  explanation?: string;
  error?: string;
}

export interface SubjectFoundationAssistantRequest {
  requestId: string;
  partId: 'pedagogy-context';
  kind: 'reflection' | 'conversation';
  prompt: string;
  context: {
    name: string;
    nature: string;
    understanding: string;
    approach: string;
    aspects: string;
    skills: string[];
  };
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface SubjectFoundationAssistantResult {
  requestId: string;
  kind: 'reflection' | 'conversation';
  reply?: string;
  error?: string;
}

export type OpinionCircleActorRole = 'professor' | 'aluno' | 'visitante';

export interface OpinionCircleMessageSendRequest {
  requestId: string;
  partId: 'community-feed';
  circleId: string;
  actorRole: OpinionCircleActorRole;
  text: string;
}

export interface OpinionCircleMessageEvent {
  type: 'opinion-circle.message';
  id: string;
  sequence: number;
  circleId: string;
  author: string;
  role: string;
  tone: string;
  text: string;
  createdAt: string;
  time: string;
}

export interface OpinionCircleMessageDelivery {
  requestId: string;
  message: OpinionCircleMessageEvent;
}

export interface OpinionCircleMessageRejection {
  requestId: string;
  circleId: string;
  reason: string;
}

export interface CognoscereStatus {
  available: boolean;
  configured: boolean;
  systemModelConfigured: boolean;
  model: string;
  endpoint: string;
  message: string;
}
