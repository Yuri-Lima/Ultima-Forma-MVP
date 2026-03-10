import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentRepositoryPort,
  DataRequestResultForConsumer,
} from '@ultima-forma/domain-consent';

export class GetDataRequestResultForConsumerUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

  async execute(requestId: string): Promise<DataRequestResultForConsumer> {
    const result =
      await this.repo.findDataRequestResultForConsumer(requestId);
    if (!result) {
      throw new AppError('REQUEST_NOT_FOUND', 'Data request not found', 404);
    }
    return result;
  }
}
