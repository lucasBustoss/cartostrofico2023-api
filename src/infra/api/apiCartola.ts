import { Team } from '@/models/Tournament';
import axios from 'axios';
import fs from 'fs';

interface StatusMarket {
  actualRound: number;
  statusMarket: number;
}

class CartolaApi {
  private readonly api = axios.create({
    baseURL: 'https://api.cartola.globo.com',
  });

  async getTeam(name: string): Promise<Team | null> {
    const params = {
      q: name,
    };

    const response = await this.api.get('times', { params });

    if (response && response.data && response.data.length > 0) {
      const {
        nome_cartola,
        slug,
        url_escudo_png,
        url_escudo_svg,
        nome,
        time_id,
      } = response.data[0];

      const team = {
        name: nome,
        slug,
        logoPng: url_escudo_png,
        logoSvg: url_escudo_svg,
        coach: nome_cartola,
        teamId: time_id,
      };

      return team;
    }

    return null;
  }

  async getStatusMarket(): Promise<StatusMarket | null> {
    const response = await this.api.get('mercado/status');

    if (response && response.data) {
      const { rodada_atual, status_mercado } = response.data;

      return {
        actualRound: Number(rodada_atual),
        statusMarket: Number(status_mercado),
      };
    }

    return null;
  }

  async getTeamPoints(id: number): Promise<number> {
    const response = await this.api.get(`time/id/${id}`);

    if (response && response.data) {
      const points = response.data.pontos || 0;

      return points;
    }

    return 0;
  }

  async getTeamPointsByJson(id: number): Promise<number> {
    const response = JSON.parse(
      fs.readFileSync(
        'C:/Users/Lucas/Documents/cartostrófico/backend/src/infra/api/pontos.json',
        'utf8',
      ),
    );

    const team = response.find((t: any) => t.time.time_id === id);
    return team.pontos;
  }
}

export default new CartolaApi();
