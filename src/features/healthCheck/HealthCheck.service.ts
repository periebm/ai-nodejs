import { IHealthCheckRepository } from './IHealthCheck.repository';

export class HealthCheckService {
  constructor(private repository: IHealthCheckRepository) {}

  private formatUpTime(seconds: number) {
    function pad(s: number) {
      return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor((seconds % (60 * 60)) / 60);
    var seconds = Math.floor(seconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
  }

  async checkHealth() {
    var uptime = this.formatUpTime(process.uptime());

    const startTimeDatabase = new Date().getTime();
    const databaseHealth = await this.repository.oracleHealth();
    const endTimeDatabase = new Date().getTime();

    const databaseDbStatus = !databaseHealth
      ? 'Database connection error'
      : `Success. Response returned in ${endTimeDatabase - startTimeDatabase}ms`;

    return {
        apiName: `ai-nodejs - ${process.env.NODE_ENV} mode`,
        uptime,
        database: databaseDbStatus
     };
  }
}
