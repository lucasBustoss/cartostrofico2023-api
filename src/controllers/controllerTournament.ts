import serviceLeague from '@/services/serviceLeague';

class ControllerLeague {
  async load(req: any): Promise<string> {
    return serviceLeague.load();
  }
}

export default new ControllerLeague();
