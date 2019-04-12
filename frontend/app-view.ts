import {LitElement, customElement, html, query} from 'lit-element';
import './version-view';
import './status-view';
import '@vaadin/vaadin-tabs/vaadin-tabs.js';
import '@vaadin/vaadin-tabs/vaadin-tab.js';
import '@polymer/iron-pages/iron-pages';
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
      <div class="appView">
        <vaadin-tabs>
          <vaadin-tab id="statusTab" @click="${this.statusTabClick}">Status</vaadin-tab>
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
