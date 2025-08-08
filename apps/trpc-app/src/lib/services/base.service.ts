export type RequestOptions = {
  headers?: Record<string, string>;
};

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export abstract class BaseService {
  protected async makeAuthenticatedRequest<T>(
    _endpoint: string,
    _options: RequestOptions = {}
  ): Promise<T> {
    throw new ServiceError("Not implemented", 501);
  }

  protected handleError(error: unknown): never {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError((error as Error)?.message ?? "Unknown error", 500);
  }
}