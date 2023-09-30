class ActionBarHandler {
  private planetDetailsButton: HTMLDivElement;
  private routingButton: HTMLDivElement;
  private contentArea: HTMLDivElement;

  public constructor() {
    this.planetDetailsButton = document.getElementById(
      'planet-details-tab'
    ) as HTMLDivElement;
    this.routingButton = document.getElementById(
      'routing-tab'
    ) as HTMLDivElement;
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
  }

  public init() {
    this.planetDetailsButton.addEventListener(
      'click',
      function () {
        this.showTab('planet-details');
      }.bind(this)
    );
    this.routingButton.addEventListener(
      'click',
      function () {
        this.showTab('routing');
      }.bind(this)
    );
  }

  private showTab(tabName) {
    // Hide all tab contents
    const tabContents = this.contentArea
      .children as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.add('hide');
    }

    // Show the selected tab content
    const selectedTab = document.getElementById(`${tabName}-tab-content`);
    if (selectedTab === null) return;
    selectedTab.classList.remove('hide');
  }
}

export { ActionBarHandler };
