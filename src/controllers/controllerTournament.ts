import serviceLeague from '@/services/serviceTournament';

class ControllerLeague {
  async load(req: any): Promise<string> {
    return serviceLeague.load();
  }
}

export default new ControllerLeague();
