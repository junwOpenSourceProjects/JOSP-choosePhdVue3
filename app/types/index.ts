export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
  traceId?: string
}

export interface RankingSource {
  id: number
  slug: string
  nameZh: string
  nameEn: string
  kind: number
  ownerOrg: string
  active: number
}

export interface Subject {
  id: number
  slug: string
  nameZh: string
  nameEn: string
  ownerOrg: string
  active: boolean
}

export interface UniversityTag {
  id: number
  slug: string
  nameZh: string
  nameEn?: string
  category?: string
  color?: string
  description?: string
  sortOrder?: number
  active?: number
}

export interface University {
  urlId: string
  nameZh: string
  nameEn: string
  nameZhTw?: string
  country: string
  region: string
  badgeUrl?: string
  website?: string
  motto?: string
  foundedDate?: string
  address?: string
  tags?: UniversityTag[]
}

export interface UniversitySourceSummary {
  sourceId: number
  sourceNameZh?: string
  sourceNameEn?: string
  latestYear?: number
  latestRankDisplay?: string
  latestRankValue?: number
}

export interface UniversityDetail {
  university: University
  sources: UniversitySourceSummary[]
  tags?: UniversityTag[]
}

export interface RankingEntry {
  id: number
  universityId: string
  sourceId: number
  subjectId?: number
  year: number
  rankDisplay: string
  rankValue?: number
  score?: number | string
  rankDelta?: number
  direction?: 'up' | 'down' | 'flat' | string
}

export interface RankingEntryVo extends RankingEntry {
  universityNameZh?: string
  universityNameEn?: string
  country?: string
  sourceName?: string
  subjectName?: string
}

export interface User {
  id: number
  username: string
  role: string
  membership?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ShortlistItem {
  id?: number
  userId: number
  universityId: string
  priority: number
  note?: string
  addedAt?: string
  university?: University
}

export interface StatsOverview {
  universityCount: number
  rankingEntryCount: number
  rankingSourceCount: number
  subjectCount: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
}
