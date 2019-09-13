import {LitElement, customElement, html, query} from 'lit-element';
import './version-view';
import './status-view';
import '@vaadin/vaadin-tabs/vaadin-tabs.js';
import '@vaadin/vaadin-tabs/vaadin-tab.js';
import '@polymer/iron-pages/iron-pages';
import '@vaadin/vaadin-icons';

const DEFAULT_TAB: number = 0;
const SELECTED_TAB_CACHED = 'com.qtdzz.vaadin-platform-versions.selectedTab';

@customElement('app-view')
export class AppViewElement extends LitElement {

  private selectedTab: number;
  createRenderRoot() {return this;}

  @query('statusTab')
  statusTab: any;

  @query('versionTab')
  versionTab: any;
  constructor() {
    super();
    this.selectedTab = this.getSelectedTab();
  }

  private getSelectedTab(): number {
    const cachedString = localStorage.getItem(SELECTED_TAB_CACHED);
    if (cachedString ) {
      try {
        return Number(cachedString);
      } catch(e) {
        return DEFAULT_TAB;
      }
    }
    return DEFAULT_TAB;
  }
  render() {
    return html`
      <div class="warning"><iron-icon icon="vaadin:warning"></iron-icon> Disclaimer: this is an unofficial application which fetches data from GitHub and vaadin.com by a walking alive human.
      So please DO NOT take this as an official reference. For official information, please visit: <a href="https://vaadin.com/roadmap" target="_blank">Vaadin roadmap</a> or <a href="https://github.com/vaadin/platform" target="_blank">Vaadin Platform repository</a>
      </div>
      <div class="appView">
        <vaadin-tabs selected="${this.selectedTab}">
          <vaadin-tab id="statusTab" @click="${this.statusTabClick}">Platform roadmap</vaadin-tab>
          <vaadin-tab id="versionTab" @click="${this.versionTabClick}">Versions Comparator</vaadin-tab>
        </vaadin-tabs>
      </div>
      <iron-pages .selected="${this.selectedTab}">
        <div><status-view></status-view></div>
        <div><version-view></version-view>></div>
      </iron-pages>
      <custom-style>
        <style is="custom-style">
          .appView {
            display: flex;
            justify-content: center;
          }
          .warning {
            color: #9F6000;
            background-color: #FEEFB3;
            margin: 10px 0px;
            padding: 12px;
          }
        </style>
      </custom-style>
    `;
  }

  async statusTabClick(): Promise<void> {
    this.selectTab(0);
    this.requestUpdate();
  }

  async versionTabClick(): Promise<void> {
    this.selectTab(1);
    this.requestUpdate();
  }

  private selectTab(selectTab: number) {
    this.selectedTab = selectTab;
    this.storeSelectedTab(selectTab);
  }

  private storeSelectedTab(tab: number) {
    localStorage.setItem(SELECTED_TAB_CACHED, String(tab));
  }
}
