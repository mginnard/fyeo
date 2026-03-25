export type UserContext = {
  id?: string;
  email?: string;
  name?: string;
  country?: string;
  plan?: string;
  [key: string]: string | number | boolean | undefined;
};

export type FlagType = "boolean";

export interface Environment {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Flag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  default_value: string;
  created_at: string;
  updated_at: string;
}

export interface FlagEnvironment {
  id: string;
  flag_id: string;
  environment_id: string;
  enabled: number;
  value: string | null;
  rollout_percentage: number;
  rules: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: number;
  flag_key: string;
  environment: string | null;
  action: string;
  changes: string;
  actor: string;
  created_at: string;
}

export interface FyeoConfig {
  environment: string;
  dbPath?: string;
  secret?: string;
  defaultContext?: (request?: Request) => UserContext;
}
