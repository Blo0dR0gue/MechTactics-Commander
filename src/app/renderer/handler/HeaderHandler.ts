class HeaderHandler {
  private searchBar: HTMLInputElement;

  public constructor() {
    this.searchBar = document.getElementById(
      'planet-search'
    ) as HTMLInputElement;
  }
}

export { HeaderHandler };
