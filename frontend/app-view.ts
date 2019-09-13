import {LitElement, customElement, html, query} from 'lit-element';
import './version-view';
import './status-view';
import '@vaadin/vaadin-tabs/vaadin-tabs.js';
import '@vaadin/vaadin-tabs/vaadin-tab.js';
import '@polymer/iron-pages/iron-pages';
import '@vaadin/vaadin-icons';

@customElement('app-view')
export class AppViewElement extends LitElement {
  private selectedTab: number = 0;
  createRenderRoot() {return this;}

  @query('statusTab')
  statusTab: any;

  @query('versionTab')
  versionTab: any;

  render() {
    return html`
      <div class="warning"><iron-icon icon="vaadin:warning"></iron-icon> Disclaimer: this is an unofficial application which fetches data from github and vaadin.com by a walking human.
      So please DO NOT take this as an official reference. For official information, please visit: <a href="https://vaadin.com/roadmap" target="_blank">Vaadin roadmap</a> or <a href="https://github.com/vaadin/platform" target="_blank">Vaadin Platform repository</a>
      </div>
      <div class="appView">
        <vaadin-tabs>
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
    this.selectedTab = 0;
    this.requestUpdate();
  }

  async versionTabClick(): Promise<void> {
    this.selectedTab = 1;
    this.requestUpdate();
  }
}
