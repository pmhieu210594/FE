export type AuditLogFilters = {
  module: string;
  operationType: string;
  actor: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};

export type AuditLogListItem = {
  id: string;
  occurredAt: string | null;
  actorUsername: string | null;
  module: string | null;
  entityType: string | null;
  entityId: string | null;
  operationType: string | null;
};

export type AuditLogPage = {
  items: AuditLogListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AuditLogDetail = {
  id: string;
  occurredAt: string | null;
  actorUserId: string | null;
  actorUsername: string | null;
  actorRoleName: string | null;
  module: string | null;
  entityType: string | null;
  entityId: string | null;
  operationType: string | null;
  changedFields: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  userAgent: string | null;
  errorMessage: string | null;
  traceId: string | null;
};
