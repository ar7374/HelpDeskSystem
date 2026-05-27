export const UserRole = {
  Admin: 0,
  Agent: 1,
  Customer: 2,
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const TicketPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
} as const;
export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const TicketStatus = {
  Open: 0,
  InProgress: 1,
  Resolved: 2,
  Closed: 3,
} as const;
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export interface UserAuthInfo {
  id: string;
  fullName: string;
  email: string;
  role: string; // "Admin" | "Agent" | "Customer"
  tenantId: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserAuthInfo;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface DashboardSummary {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  slaBreachedTickets: number;
  averageResolutionHours: number;
  ticketsByPriority: Record<number | string, number>; // 0, 1, 2, 3 or string priority counts
}

export interface User {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAtUtc: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAtUtc: string;
}

export interface TicketListItem {
  id: string;
  ticketNumber: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  customerName: string;
  agentName?: string;
  createdAtUtc: string;
  slaDueAtUtc: string;
}

export interface TicketDetails {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  customer: User;
  agent?: User;
  createdAtUtc: string;
  slaDueAtUtc: string;
  resolvedAtUtc?: string;
  comments: TicketComment[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAtUtc: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAtUtc: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  status: boolean;
  message: string;
  data?: T;
}

export interface SearchRequest<T> {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection: number; // 0: Asc, 1: Desc
  criteria?: T;
}

export interface TicketSearchCriteria {
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  search?: string | null;
}

export interface CreateTicketRequest {
  tenantId: string;
  customerId: string;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface UpdateTicketRequest {
  status: TicketStatus;
  agentId: string | null;
}

export interface AddCommentRequest {
  authorId: string;
  body: string;
}

export interface PaginatedListDto<T> {
  data: T[];
  size: number;
  totalRecords: number;
}
