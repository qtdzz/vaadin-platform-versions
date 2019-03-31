import {LitElement, customElement, html, query} from 'lit-element';


import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column.js';
import '@vaadin/vaadin-button/vaadin-button.js';
import '@vaadin/vaadin-combo-box/vaadin-combo-box.js';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout.js';
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';
import '@vaadin/vaadin-lumo-styles/icons.js';
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

  @query('vaadin-grid')
  vaadinGrid?: any;

  @query('vaadin-combo-box')
  vaadinComboBox?: any;

  @query('#addNewVersionButton')
  addNewVersionButton?: any;

  @query('#removeLastColumnButton')
  removeLastColumnButton?: any;

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
              <vaadin-button id="addNewVersionButton" @click="${this.onAddNewVersionClick}">
                <iron-icon icon="lumo:plus" slot="prefix">
                </iron-icon>
                Add to compare
              </vaadin-button>
              <vaadin-button id="removeLastColumnButton" theme="error" @click="${this.onRemoveLastColumnClick}">
                <iron-icon icon="lumo:cross" slot="prefix">
                </iron-icon>
                Remove last column
              </vaadin-button>
            </vaadin-horizontal-layout>
          </div>
          <div>
            <vaadin-button theme="tertiary-inline" @click="${this.openGithub}">
              <iron-icon icon="vaadin:cross-cutlery" slot="prefix">
              </iron-icon>
              Fix me on GitHub
            </vaadin-button>
          </div>
        </div>
        <vaadin-grid style="height: 100%;" theme="row-stripes column-borders wrap-cell-content">
          <vaadin-grid-filter-column path="name" header="Product name">
            <template>
                <div style="display:inline-block;">
                  <span id="product-[[index]]"><strong>[[item.name]]</strong></span>
                  </paper-badge>
                </div>
              </template>
          </vaadin-grid-filter-column>
          ${Object.keys(this.columnVersionMap).map((key) => html`
            <div>${key}</div>
            <vaadin-grid-column id="${key}">
              <template class="header"><vaadin-combo-box id="versionSelector_${key}" label="Platform version"></vaadin-combo-box></template>
              <template>
                <vaadin-vertical-layout id="item-[[index]]-${key}" theme="spacing padding">
                  <div hidden="[[item.data.${key}.name]]" class="notAvailable">Not available</div>
                  <img hidden="[[!item.data.${key}.javaVersion]]"
                     src="https://img.shields.io/static/v1.svg?label=Java&message=[[item.data.${key}.javaVersion]]&color=violet&cacheSeconds=3600&style=popout-square"/>
                  <img hidden="[[!item.data.${key}.npmName]]"
                     src="https://img.shields.io/static/v1.svg?label=npm&message=[[item.data.${key}.npmName]]:[[item.data.${key}.npmVersion]]&color=green&cacheSeconds=3600&style=popout-square"/>
                  <img hidden="[[!item.data.${key}.bowerVersion]]"
                     src="https://img.shields.io/static/v1.svg?label=bower&message=[[item.name]]:[[item.data.${key}.bowerVersion]]&color=blue&cacheSeconds=3600&style=popout-square"/>
                </vaadin-vertical-layout>
                <paper-badge for="item-[[index]]-${key}" class="badge-green" hidden="[[!item.data.${key}.isPro]]" label="PRO">
              </template>
            </vaadin-grid-column>
          `)}
        </vaadin-grid>
      </vaadin-vertical-layout>
      <custom-style>
        <style is="custom-style">
          .badge-green {
            --paper-badge-background: var(--lumo-success-color);
            --paper-badge-margin-left: -5px;
            --paper-badge-margin-bottom: -25px;
            --paper-badge-width: 30px;
            --paper-badge: {
                border-radius: 10%;
                font-weight: bold;
                font-size: 13px;
              }
          }
          .notAvailable {
            align-self: center;
            color: grey;
            opacity: 0.5;
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

  async onAddNewVersionClick(): Promise<void> {
    const currentColumn = COLUMN_PREFIX + Date.now();
    const newlyAddedVersion = this.vaadinComboBox.selectedItem;
    this.columnVersionMap[currentColumn] = newlyAddedVersion;
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

  async onRemoveLastColumnClick(): Promise<void> {
    Object.keys(this.columnVersionMap).map( (key: string, index: number, keys: string[]) => {
      if (index === keys.length - 1) {
        delete this.columnVersionMap[key];
      }
    });
    this.requestUpdate();
  }

  async firstUpdated(): Promise<void> {
    await this.versionController.setReleasedVersions();
    this.vaadinComboBox.addEventListener('value-changed', (e: any) => {
      this.addNewVersionButton.disabled = !e.detail.value;
    });
    this.addNewVersionButton.disabled = !this.vaadinComboBox.selectedItem;
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

  async updated() {
    this.removeLastColumnButton.disabled = Object.keys(this.columnVersionMap).length <= 1;
  }

  async openGithub(): Promise<void> {
    window.open('https://github.com/qtdzz/vaadin-platform-versions', '_blank');
  }

}
