// Enums
export enum EvaluationAlgorithm {
  Unknown = 0,
  SimpleWeighted = 1,
  ComplexWeighted = 2,
  MachineLearning = 3
}

export enum EvaluationStatus {
  Pending = 0,
  Running = 1,
  Completed = 2,
  Failed = 3
}

export enum FactorCategory {
  Physical = 0,
  Chemical = 1,
  Biological = 2,
  Environmental = 3,
  Other = 4
}

export enum FactorType {
  Numeric = 0,
  Boolean = 1,
  String = 2,
  Date = 3,
  Json = 4
}

export enum PlanetStatus {
  Active = 0,
  Inactive = 1,
  UnderReview = 2,
  Archived = 3,
  Deleted = 4
}

export enum ChartType {
  Bar = 0,
  Line = 1,
  Pie = 2,
  Scatter = 3,
  Radar = 4
}

export enum UserRole {
  SuperAdmin = 0,
  PlanetAdmin = 1,
  ViewerType1 = 2,
  ViewerType2 = 3
}

// Request Types
export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface EvaluationRequest {
  planetIds?: number[];
  algorithm: EvaluationAlgorithm;
  weights?: Record<string, number>;
}

export interface CreatePlanetRequest {
  name?: string;
  description?: string;
  location?: string;
  discoveredDate: string;
}

export interface UpdatePlanetRequest {
  name?: string;
  description?: string;
  location?: string;
  status: PlanetStatus;
}

export interface AddFactorRequest {
  factorName?: string;
  category: FactorCategory;
  value?: any;
  unit?: string;
  dataType: FactorType;
  weight: number;
  description?: string;
}

export interface UpdateFactorRequest {
  value?: any;
  weight: number;
  description?: string;
}

export interface CreatePermissionRequest {
  role: UserRole;
  resource: string;
  action: string;
  resourceId?: number;
}

export interface UpdatePermissionRequest {
  role: UserRole;
  resource: string;
  action: string;
  resourceId?: number;
}

export interface CheckPermissionRequest {
  userId?: number;
  resource: string;
  action: string;
  resourceId?: number;
}

// Response Types
export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: string;
  user?: User;
  errorMessage?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  assignedPlanetId?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role?: UserRole;
  assignedPlanet?: Planet;
  createdEvaluations?: Evaluation[];
}

export interface Planet {
  id: number;
  name: string;
  description?: string;
  location?: string;
  discoveredDate: string;
  status: PlanetStatus;
  createdAt: string;
  updatedAt: string;
  factors?: PlanetFactor[];
  evaluationResults?: EvaluationResult[];
  assignedUsers?: User[];
  permissions?: Permission[];
}

export interface PlanetFactor {
  id: number;
  planetId: number;
  factorName: string;
  category: FactorCategory;
  valueJson: string;
  unit?: string;
  dataType: FactorType;
  weight: number;
  description?: string;
  recordedAt: string;
  recordedBy?: string;
  planet?: Planet;
  value?: any;
}

export interface Evaluation {
  id: number;
  planetIdsJson: string;
  algorithm: EvaluationAlgorithm;
  weightsJson: string;
  createdAt: string;
  createdBy?: string;
  createdByUserId?: number;
  status: EvaluationStatus;
  results?: EvaluationResult[];
  report?: EvaluationReport;
  createdByUser?: User;
  planetIds?: number[];
  weights?: Record<string, number>;
}

export interface EvaluationResult {
  id: number;
  evaluationId: number;
  planetId: number;
  totalScore: number;
  categoryScoresJson: string;
  rank: number;
  recommendation?: string;
  strengthsJson: string;
  weaknessesJson: string;
  risksJson: string;
  evaluation?: Evaluation;
  planet?: Planet;
  categoryScores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  risks?: string[];
}

export interface EvaluationReport {
  id: number;
  evaluationId: number;
  title: string;
  summary?: string;
  detailedAnalysis?: string;
  generatedAt: string;
  evaluation?: Evaluation;
  charts?: Chart[];
}

export interface Chart {
  id: number;
  evaluationReportId: number;
  title: string;
  type: ChartType;
  data: string;
  configuration?: string;
  evaluationReport?: EvaluationReport;
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
  planetId?: number;
  planet?: Planet;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
}
