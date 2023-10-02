class ActionBarHandler {
  private navButtons: NodeListOf<HTMLDivElement>;
  private contentArea: HTMLDivElement;

  public constructor() {
    this.navButtons = document.querySelectorAll('.btn-actionBar');
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
  }

  public init() {
    this.navButtons.forEach((element) => {
      if (element.id === undefined || element.dataset.content === undefined)
        return;
      element.addEventListener(
        'click',
        function () {
          this.showTab(element.dataset.content);
        }.bind(this)
      );
    });
  }

  private showTab(tabName) {
    // Hide all tab contents
    const tabContents = this.contentArea
      .children as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.add('hide');
    }

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab === null) return;
    selectedTab.classList.remove('hide');
  }
}

export { ActionBarHandler };
