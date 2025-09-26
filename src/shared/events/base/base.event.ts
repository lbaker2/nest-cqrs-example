export abstract class BaseEvent {
  public readonly occurredOn: Date;
  public readonly version: number = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public readonly userId?: string,
  ) {
    this.occurredOn = new Date();
  }
}