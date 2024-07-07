export interface IOpenApiRepository {
  oracleHealth():Promise<number | undefined>;
}