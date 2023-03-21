class ServiceTournament {
  async load(): Promise<string> {
    return 'hello world!';
  }
}

export default new ServiceTournament();
