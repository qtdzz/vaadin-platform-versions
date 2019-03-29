import {LitElement, customElement, html, property, query} from 'lit-element';


import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-combo-box/vaadin-combo-box.js';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout.js';
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout.js';
import './version-controller';
import '@polymer/paper-badge';
import { VersionController } from './version-controller';
import PlatformItem from './generated/com/qtdzz/model/PlatformItem';
import PlatformItemsResult from './generated/com/qtdzz/model/PlatformItemsResult';

@customElement('version-view')
export class VersionViewElement extends LitElement {
  private versionController: VersionController = new VersionController(
    this.setItems.bind(this),
    this.setReleasedVersions.bind(this)
  );

  createRenderRoot() {return this;}

  @property() numOfColumn: number = 1;
  @query('vaadin-grid')
  vaadinGrid?: any;

  @query('vaadin-combo-box')
  vaadinComboBox?: any;

  private columnData: {[key: string]: {[key: string] : PlatformItem}} = {};
  private versionsArray: String[] = [];

  render() {
    return html`
      <vaadin-vertical-layout style="height: 100vh;" theme="spacing">
        <vaadin-horizontal-layout theme="spacing">
          <vaadin-combo-box></vaadin-combo-box>
          <vaadin-button @click="${this.onUpdateClick}">Add to compare</vaadin-button>
        </vaadin-horizontal-layout>
        <vaadin-grid style="height: 100%;" theme="row-stripes">
          <vaadin-grid-column>
          <template class="header">Product name</template>
            <template>
              <div style="display:inline-block;">
                <span id="product-[[index]]">[[item.name]]</span>
                <paper-badge for="product-[[index]]" class="badge-green" hidden="[[!item.isPro]]" label="PRO">
                </paper-badge>
              </div>
            </template>
          </vaadin-grid-column>
          ${Array(this.numOfColumn).join('0').split('0').map((_, i) => html`
            <vaadin-grid-column id="column${i}">
              <template class="header"><vaadin-combo-box id="versionSelector${i}"></vaadin-combo-box></template>
              <template>
                <div hidden="[[!item.data.column${i}.javaVersion]]">Java version: [[item.data.column${i}.javaVersion]]</div>
                <div hidden="[[!item.data.column${i}.npmName]]">npm package: [[item.data.column${i}.npmName]]:[[item.data.column${i}.npmVersion]]</div>
                <div hidden="[[!item.data.column${i}.bowerVersion]]">Bower version: [[item.data.column${i}.bowerVersion]]</div>
                <div hidden="[[!item.data.column${i}.isComponent]]">Component: [[item.data.column${i}.isComponent]]</div>
              </template>
            </vaadin-grid-column>
          `)};
        </vaadin-grid>
      </vaadin-vertical-layout>
      <custom-style>
        <style is="custom-style">
          .badge-green {
            --paper-badge-background: var(--lumo-success-color);
            --paper-badge-margin-left: 30px;
            --paper-badge-width: 25px;
            --paper-badge: {
                border-radius: 20%;
                font-weight: bold;
              }
          }
        </style>
      </custom-style>
    `;
  }

  private setItems(result: PlatformItemsResult, column: number) {
    const currentComponentList = result.platformItems.map( i=> !!i ? i.name : "");
    for (var property in this.columnData) {
      if (this.columnData.hasOwnProperty(property) && !currentComponentList.includes(property)) {
        this.columnData[property][`column${column}`] = {isPro: false, isComponent: false};
      }
    }
    result.platformItems.forEach(i => {
      if (i && i.name) {
        const itemsOfThisComponent = this.columnData[i.name] || [];
        itemsOfThisComponent[`column${column}`] = i;
        this.columnData[i.name] = itemsOfThisComponent;
      }
    });
    const arrayItems: any[] = [];
    for (var property in this.columnData) {
      if (this.columnData.hasOwnProperty(property)) {
        arrayItems.push({'name': property, 'data': this.columnData[property]});
      }
    }
    this.vaadinGrid.items = arrayItems;
    this.vaadinGrid.querySelector(`#versionSelector${column}`).selectedItem = result.platformVersion;
  }

  private setReleasedVersions(versions: Array<String | null>) {
    const versionsArray: String[] =  [];
    versions.forEach(i => {
      if(i) {
        versionsArray.push(i);
      }
    });
    this.vaadinComboBox.items = versionsArray;
    this.versionsArray = versionsArray;
  }

  async onUpdateClick(): Promise<void> {
    this.numOfColumn++;
    const currentColumn = this.numOfColumn - 1;
    this.versionController.setPlatformItems(this.vaadinComboBox.selectedItem, currentColumn);
    setTimeout(() => {
      const newComboBox = this.vaadinGrid.querySelector(`#versionSelector${currentColumn}`);
      newComboBox.items = this.versionsArray;
      newComboBox.addEventListener('value-changed', (e: any) => {
        if (e.detail.value) {
          this.versionController.setPlatformItems(e.detail.value, currentColumn);
        } else {
          this.versionController.setPlatformItemsForLatestRelease(currentColumn);
        }
      }, 500);
    });
  }

  async firstUpdated(): Promise<void> {
    await this.versionController.setReleasedVersions();
    await this.versionController.setPlatformItemsForLatestRelease(0);
    for(let i = 0; i < this.numOfColumn; i++) {
      this.vaadinGrid.querySelector(`#versionSelector${i}`).addEventListener('value-changed', (e: any) => {
        if (e.detail.value) {
          this.versionController.setPlatformItems(e.detail.value, i);
        } else {
          this.versionController.setPlatformItemsForLatestRelease(i);
        }
      });
    }
  }

}
