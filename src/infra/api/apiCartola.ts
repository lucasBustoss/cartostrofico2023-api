import { Team } from '@/models/Tournament';
import axios from 'axios';

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
}

export default new CartolaApi();
