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
const COLUMN_PREFIX = 'column';
@customElement('version-view')
export class VersionViewElement extends LitElement {
  private versionController: VersionController = new VersionController(
    this.setItems.bind(this),
    this.setReleasedVersions.bind(this)
  );

  createRenderRoot() {return this;}

  @property() columnArray: string[] = ['column0', 'column1'];
  @query('vaadin-grid')
  vaadinGrid?: any;

  @query('vaadin-combo-box')
  vaadinComboBox?: any;

  private columnData: {[key: string]: {[key: string] : PlatformItem}} = {};
  private versionsArray: String[] = [];
  private columnVersionMap: {[key: string]: string} = {'column0': '13.0.2', 'column1': '10.0.12'};

  render() {
    return html`
      <vaadin-vertical-layout style="height: 100vh;" theme="spacing">
        <div style="display: flex; width: 100%;">
          <div style="flex-grow: 1;">
            <vaadin-horizontal-layout theme="spacing">
              <vaadin-combo-box></vaadin-combo-box>
              <vaadin-button @click="${this.onUpdateClick}">Add to compare</vaadin-button>
            </vaadin-horizontal-layout>
          </div>
          <div style="justify-self: flex-end;">flex</div>
        </div>
        <vaadin-grid style="height: 100%;" theme="row-stripes column-borders">
          <vaadin-grid-column>
          <template class="header">Product name</template>
            <template>
              <div style="display:inline-block;">
                <span id="product-[[index]]"><strong>[[item.name]]</strong></span>
                <paper-badge for="product-[[index]]" class="badge-green" hidden="[[!item.isPro]]" label="PRO">
                </paper-badge>
              </div>
            </template>
          </vaadin-grid-column>
          ${this.columnArray.map((key) => html`
            <div>${key}</div>
            <vaadin-grid-column id="${key}">
              <template class="header"><vaadin-combo-box id="versionSelector_${key}"></vaadin-combo-box></template>
              <template>
                <vaadin-vertical-layout theme="spacing">
                  <div hidden="[[!item.data.${key}.javaVersion]]">Java version: [[item.data.${key}.javaVersion]]</div>
                  <div hidden="[[!item.data.${key}.npmName]]">npm package: [[item.data.${key}.npmName]]:[[item.data.${key}.npmVersion]]</div>
                  <div hidden="[[!item.data.${key}.bowerVersion]]">Bower version: [[item.data.${key}.bowerVersion]]</div>
                  <div hidden="[[!item.data.${key}.isComponent]]">Component: [[item.data.${key}.isComponent]]</div>
                </vaadin-vertical-layout>
              </template>
            </vaadin-grid-column>
          `)}
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

  private setItems(result: PlatformItemsResult, column: string) {
    const currentComponentList = result.platformItems.map( i=> !!i ? i.name : "");
    for (var property in this.columnData) {
      if (this.columnData.hasOwnProperty(property) && !currentComponentList.includes(property)) {
        this.columnData[property][column] = {isPro: false, isComponent: false};
      }
    }
    result.platformItems.forEach(i => {
      if (i && i.name) {
        const itemsOfThisComponent = this.columnData[i.name] || [];
        itemsOfThisComponent[column] = i;
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
    const currentColumn = COLUMN_PREFIX + this.columnArray.length;
    const newlyAddedVersion = this.vaadinComboBox.selectedItem;
    this.columnArray.push(currentColumn);
    this.requestUpdate();
    this.versionController.setPlatformItems(newlyAddedVersion, currentColumn);
    setTimeout(() => {
      const newComboBox = this.vaadinGrid.querySelector(`#versionSelector_${currentColumn}`);
      newComboBox.items = this.versionsArray;
      newComboBox.selectedItem = newlyAddedVersion;
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
    Object.keys(this.columnVersionMap).forEach((key) => {
      this.versionController.setPlatformItems(this.columnVersionMap[key], key);
      const columnComboBox = this.vaadinGrid.querySelector(`#versionSelector_${key}`);
      columnComboBox.items = this.versionsArray;
      columnComboBox.selectedItem = this.columnVersionMap[key];
      columnComboBox.addEventListener('value-changed', (e: any) => {
        if (e.detail.value) {
          this.versionController.setPlatformItems(e.detail.value, `${key}`);
        } else {
          this.versionController.setPlatformItemsForLatestRelease(`${key}`);
        }
      });
    });
  }

}
