export interface IOpenApiRepository {
  databaseHealth():Promise<number | undefined>;
}