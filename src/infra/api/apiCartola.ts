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
    try {
      const params = {
        q: name,
      };

      const response = await this.api.get('times', { params });

      if (response && response.data && response.data.length > 0) {
        let teamCartola;

        if (response.data.length > 1) {
          teamCartola = response.data.find((d: any) => d.nome === name);
        }

        /* eslint-disable*/
      if (!teamCartola || response.data.length === 1) {
        teamCartola = response.data[0];
      }
      /* eslint-enable */

        const {
          nome_cartola,
          slug,
          url_escudo_png,
          url_escudo_svg,
          nome,
          time_id,
        } = teamCartola;

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
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  async getSearchTeam(name: string): Promise<Team[] | null> {
    const params = {
      q: name,
    };

    const headers = {
      'Accept-Encoding': 'application/json',
    };

    const response = await this.api.get('times', { params, headers });

    if (response && response.data && response.data.length > 0) {
      const teams = [];
      for (let i = 0; i < response.data.length; i++) {
        const teamCartola = response.data[i];

        const {
          nome_cartola,
          slug,
          url_escudo_png,
          url_escudo_svg,
          nome,
          time_id,
        } = teamCartola;

        const team = {
          name: nome,
          slug,
          logoPng: url_escudo_png,
          logoSvg: url_escudo_svg,
          coach: nome_cartola,
          teamId: time_id,
        };

        teams.push(team);
      }

      return teams;
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
    const headers = {
      'Accept-Encoding': 'application/json',
    };

    const response = await this.api.get(`time/id/${id}`, { headers });

    if (response && response.data) {
      const points = Number(response.data.pontos.toFixed(2)) || 0;

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
