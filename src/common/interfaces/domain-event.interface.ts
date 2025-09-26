export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    source?: string;
    [key: string]: any;
  };
}