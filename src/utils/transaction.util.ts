import { QueryRunner, DataSource } from 'typeorm';

/**
 * Executes a given operation within a database transaction.
 *
 * @template T The type of the result returned by the operation.
 * @param {DataSource} dataSource - The TypeORM DataSource to create the QueryRunner from.
 * @param {(queryRunner: QueryRunner) => Promise<T>} operation - The operation to be executed within the transaction.
 * @returns {Promise<T>} A promise that resolves to the result of the operation if it succeeds, or rejects with an error if it fails.
 * @throws Will throw an error if the transaction fails and is rolled back.
 */
export async function createTransactionRunner<T>(
  dataSource: DataSource,
  operation: (queryRunner: QueryRunner) => Promise<T>,
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await operation(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new Error(`Operation in transaction failed: ${error}`);
  } finally {
    await queryRunner.release();
  }
}
