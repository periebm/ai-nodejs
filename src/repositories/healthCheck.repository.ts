import { db } from '../config/database';
import { IHealthCheckRepository } from '../features/healthCheck/IHealthCheck.repository';

class HealthCheckRepository implements IHealthCheckRepository {
  async databaseHealth(): Promise<number | undefined> {
    try {
      const response = await db.query('SELECT 1');
      console.log(response?.rows[0]);
      return response?.rows[0];
    } catch (error) {
      console.error('Erro ao fazer a consulta de health check:', error);
      return undefined;
    }
  }
}

const healthCheckRepository = new HealthCheckRepository();

export default healthCheckRepository;
