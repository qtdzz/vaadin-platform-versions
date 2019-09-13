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
import '@vaadin/vaadin-lumo-styles/badge.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js'
import './version-controller';
import { VersionController } from './version-controller';
import PlatformItem from './generated/com/qtdzz/platform/model/PlatformItem';
import PlatformItemsResult from './generated/com/qtdzz/platform/model/PlatformItemsResult';

const COLUMN_PREFIX = 'column';
const VERSIONS_LAYOUT_CACHED = 'com.qtdzz.vaadin-platform-versions.layout';
const SHOULD_HIGHLIGHT_CACHED = 'com.qtdzz.vaadin-platform-versions.hightlight';
const SHOULD_HIDE_SAME_VERSION_CACHED = 'com.qtdzz.vaadin-platform-versions.hideSameVersion';
const DEFAULT_VERSION_LAYOUT = {'column0': '13.0.3', 'column1': '10.0.12'};

@customElement('version-view')
export class VersionViewElement extends LitElement {
  private versionController: VersionController = new VersionController(
    this.setItems.bind(this),
    this.setReleasedVersions.bind(this)
  );

  constructor() {
    super();
    this.columnVersionMap = this.getCachedLayout();
    this.shouldHighlight = localStorage.getItem(SHOULD_HIGHLIGHT_CACHED) === 'true';
    this.shouldHideSameVersion = localStorage.getItem(SHOULD_HIDE_SAME_VERSION_CACHED) === 'true';
  }

  createRenderRoot() {return this;}

  @query('vaadin-grid')
  vaadinGrid?: any;

  @query('vaadin-combo-box')
  vaadinComboBox?: any;

  @query('#addNewVersionButton')
  addNewVersionButton?: any;

  @query('#removeLastColumnButton')
  removeLastColumnButton?: any;

  @query('#highlightCheckBox')
  highlightCheckBox?: any;
  @query('#hideSameCheckBox')
  hideSameCheckBox?: any;

  private columnData: {[key: string]: {[key: string] : PlatformItem}} = {};
  private versionsArray: String[] = [];
  private columnVersionMap: {[key: string]: string};
  private shouldHighlight: boolean;
  private shouldHideSameVersion: boolean;
  private gridItems: any[] = [];
  render() {
    return html`
      <vaadin-vertical-layout style="height: 100vh;" theme="spacing">
        <vaadin-horizontal-layout theme="spacing" style="width: 100%;">
          <vaadin-combo-box></vaadin-combo-box>
          <vaadin-button id="addNewVersionButton" theme="primary" @click="${this.onAddNewVersionClick}">
            <iron-icon icon="lumo:plus" slot="prefix">
            </iron-icon>
            Add to compare
          </vaadin-button>
          <vaadin-button
            id="removeLastColumnButton"
            theme="primary error"
            @click="${this.onRemoveLastColumnClick}"
            >
              <iron-icon icon="lumo:cross" slot="prefix">
              </iron-icon>
              Remove last column
          </vaadin-button>
          <div style="flex-grow: 1;">
          </div>
          <vaadin-button theme="tertiary-inline" @click="${this.openGithub}">
              <iron-icon icon="vaadin:cross-cutlery" slot="prefix">
              </iron-icon>
              Fix me on GitHub
            </vaadin-button>
        </vaadin-horizontal-layout>
        <paper-toggle-button class="lumo" id="highlightCheckBox" ?checked=${this.shouldHighlight}>
          Highlight different versions.
        </paper-toggle-button>
        <paper-toggle-button class="lumo" id="hideSameCheckBox" ?checked=${this.shouldHideSameVersion}>
          Hide same versions.
        </paper-toggle-button>
        <vaadin-grid style="height: 100%;" theme="row-stripes column-borders wrap-cell-content">
          <vaadin-grid-filter-column path="name" header="Product name" id="productName">
          </vaadin-grid-filter-column>
          ${Object.keys(this.columnVersionMap).map((key) => html`
            <vaadin-grid-column id="${key}" class="dataColumn">
            </vaadin-grid-column>
          `)}
        </vaadin-grid>
      </vaadin-vertical-layout>
      <custom-style>
        <style include="lumo-badge">
          [theme~="badge"] {
            border-radius: 0;
          }

          [theme~="badge"][theme~="contrast"][theme~="primary"] {
            background-color: #686a6d;
          }

          [theme~="badge"][theme~="primary"][theme~="java"] {
            background-color: violet;
          }

          [theme~="badge"][theme~="success"][theme~="primary"][theme~="npm"] {
            background-color: blue;
          }

        </style>
        <style is="custom-style">

          html {
            font-family: var(--lumo-font-family);
          }

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

          .isPro {
            font-weight: bold;
            right: 5px;
            position: absolute;
          }

          .same {
            opacity: 0.5;
          }

          .same.hide {
            display: none;
          }

          .versionList {
            display: flex;
            flex-direction: column;
          }

          paper-toggle-button.lumo {
            --paper-toggle-button-checked-bar-color:  var(--lumo-primary-color);
            --paper-toggle-button-checked-button-color:  var(--lumo-primary-color);
            --paper-toggle-button-checked-ink-color: var(--lumo-primary-color-50pct);
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
        if (i.npmVersion && i.npmVersion.indexOf("{{version}}") > -1) {
          i.npmVersion = result.platformVersion;
        }
        if (i.bowerVersion && i.bowerVersion.indexOf("{{version}}") > -1) {
          i.bowerVersion = result.platformVersion;
        }
        itemsOfThisComponent[column] = i;
        this.columnData[i.name] = itemsOfThisComponent;
      }
    });
    const arrayItems: any[] = [];
    for (var property in this.columnData) {
      if (this.columnData.hasOwnProperty(property)) {
        const gridItems = this.createGridItem(property, this.columnData[property]);
        arrayItems.push(gridItems);
      }
    }
    this.gridItems = arrayItems;
    this.vaadinGrid.items = arrayItems.filter(i => !i.shouldHide);
    this.updateColumnVersionMap(column, result.platformVersion);
  }

  private createGridItem(productName: string, columnObjects: {[key: string]: PlatformItem}) {
    let javaVersions = [];
    let bowerVersion = [];
    let npmVersion = [];
    for (var col in columnObjects) {
      if (columnObjects.hasOwnProperty(col)) {
        javaVersions.push(columnObjects[col].javaVersion);
        bowerVersion.push(columnObjects[col].bowerVersion);
        npmVersion.push(columnObjects[col].npmVersion);
      }
    }
    const isJavaDiff = new Set(javaVersions).size > 1;
    const isBowerDiff = new Set(bowerVersion).size > 1;
    const isNpmDiff = new Set(npmVersion).size > 1;
    const result = {'name': productName,
                    'data': columnObjects,
                    'isJavaDiff': isJavaDiff,
                    'isBowerDiff': isBowerDiff,
                    'isNpmDiff': isNpmDiff,
                    'shouldHide': (!isJavaDiff && !isNpmDiff && !isBowerDiff) && this.shouldHideSameVersion
                  };
    return result;
  }

  private rebuildGridItem() {
    const items = this.gridItems.map((i: any) => {
      i.shouldHide = (!i.isJavaDiff && !i.isNpmDiff && !i.isBowerDiff) && this.shouldHideSameVersion;
      return i;
    });
    this.vaadinGrid.items = items.filter(i => !i.shouldHide);
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
    const versionSelectors = this.vaadinGrid.querySelectorAll('vaadin-combo-box');
    for (let i = 0; i < versionSelectors.length; i++) {
      versionSelectors[i].items = versionsArray;
    }
  }

  async onAddNewVersionClick(): Promise<void> {
    const currentColumn = COLUMN_PREFIX + Date.now();
    const newlyAddedVersion = this.vaadinComboBox.selectedItem;
    this.columnVersionMap[currentColumn] = newlyAddedVersion;
    this.requestUpdate();
    this.versionController.setPlatformItems(newlyAddedVersion, currentColumn);
    setTimeout(() => {
      const newColumn = this.vaadinGrid.querySelector(`#${currentColumn}`);
      if (!newColumn.renderer) {
        this.addColumnRenderer(newColumn);
      }
    }, 500);
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
    this.versionController.setReleasedVersions();
    this.vaadinComboBox.addEventListener('value-changed', (e: any) => {
      this.addNewVersionButton.disabled = !e.detail.value;
    });
    this.addNewVersionButton.disabled = !this.vaadinComboBox.selectedItem;
    const columns = this.vaadinGrid.getElementsByClassName('dataColumn');
    for (var i = 0; i < columns.length; i++) {
      this.addColumnRenderer(columns[i]);
    }
    this.addProductNameColumnRenderer();
    this.addCheckBoxListeners();
    Object.keys(this.columnVersionMap).forEach((key: any) => {
      this.versionController.setPlatformItems(this.columnVersionMap[key], key);
    });
  }

  async addProductNameColumnRenderer() {
    const columnProductName = document.getElementById('productName') as any;
    columnProductName.renderer = (root: any, _: any, rowData: any) => {
      const item = rowData.item;
      root.innerHTML = `<span class="${this.shouldHighlight ? (item.isJavaDiff || item.isBowerDiff || item.isNpmDiff ? 'diff' : 'same') : ''}"><strong>${item.name}</strong></span>`;
    };
  }

  async addColumnRenderer(gridColumn: any) {
    const key = gridColumn.id;

    gridColumn.headerRenderer = (root: any) => {
      const comboBox = document.createElement('vaadin-combo-box') as any;
      comboBox.id = `versionSelector_${key}`;
      comboBox.class = 'versionSelector';
      comboBox.selectedItem = this.columnVersionMap[key];
      comboBox.items = this.versionsArray;
      comboBox.label = 'Platform version';
      comboBox.addEventListener('value-changed', async (e: any) => {
        if (e.detail.value) {
          this.versionController.setPlatformItems(e.detail.value, key);
        } else {
          this.versionController.setPlatformItemsForLatestRelease(key);
        }
      });
      root.appendChild(comboBox);
    };

    gridColumn.renderer = (root: any, _: any, rowData: any) => {
      const item = rowData.item;
      if (!item.data[key]) {
        return;
      }
      if (!item.data[key].name) {
        root.innerHTML = `<div class="versionList"><span class="notAvailable">Not available</span></div>`;
        return;
      }
      let vertical = '';
      if (item.data[key].isPro) {
        vertical += `<span theme="badge success primary" class="isPro">PRO</span>`;
      }
      if (item.data[key].javaVersion) {
        const javaItem = `<span theme="badge contrast primary">Java</span><span theme="badge primary java">${item.data[key].javaVersion}</span>`;
        vertical += this.createVersionItemWrapper(item.isJavaDiff, javaItem);
      }
      if (item.data[key].npmName) {
        const npmItem = `<span theme="badge contrast primary">npm</span><span theme="badge primary">${item.data[key].npmName}:${item.data[key].npmVersion}</span>`;
        vertical += this.createVersionItemWrapper(item.isNpmDiff, npmItem);
      }
      if (item.data[key].bowerVersion) {
        const bowerItem = `<span theme="badge contrast primary">Bower</span><span theme="badge success primary">${item.name}:${item.data[key].bowerVersion}</span>`;
        vertical += this.createVersionItemWrapper(item.isBowerDiff, bowerItem);;
      }
      if (item.name === 'vaadin-designer') {
        vertical += this.createDesignerVersionItem();
      }
      root.innerHTML = `<div class="versionList">${vertical}</div>`;
    };
  }

  private createVersionItemWrapper(diff: boolean, content: string): string {
    let wrapperContent = `<p class="${this.shouldHighlight ? (diff ? 'diff' : 'same') : ''}">`;
    wrapperContent += content;
    wrapperContent += "</p>";
    return wrapperContent;
  }

  async addCheckBoxListeners() {
    this.highlightCheckBox.addEventListener('checked-changed', (e: any) => {
      this.shouldHighlight = e.detail.value;
      localStorage.setItem(SHOULD_HIGHLIGHT_CACHED, e.detail.value);
      this.vaadinGrid.clearCache();
    });
    this.hideSameCheckBox.addEventListener('checked-changed', (e: any) => {
      this.shouldHideSameVersion = e.detail.value;
      localStorage.setItem(SHOULD_HIDE_SAME_VERSION_CACHED, e.detail.value);
      this.rebuildGridItem();
      this.vaadinGrid.clearCache();
    });
  }

  private getCachedLayout(): {[key: string]: string} {
    const cachedString = localStorage.getItem(VERSIONS_LAYOUT_CACHED);
    if (cachedString ) {
      try {
        const cachedObject = JSON.parse(cachedString);
        if (Object.keys(cachedObject).length > 0) {
          return cachedObject;
        }
      } catch(e) {
        console.debug(`Cannot parse cached layout`, e);
      }
    }
    return DEFAULT_VERSION_LAYOUT;
  }

  async updated() {
    this.removeLastColumnButton.disabled = Object.keys(this.columnVersionMap).length <= 1;
    this.storeCache();
  }

  private updateColumnVersionMap(column: string, version: string) {
    this.columnVersionMap[column] = version;
    this.storeCache();
  }

  private storeCache() {
    localStorage.setItem(VERSIONS_LAYOUT_CACHED, JSON.stringify(this.columnVersionMap));
  }

  async openGithub(): Promise<void> {
    window.open('https://github.com/qtdzz/vaadin-platform-versions', '_blank');
  }

  private createDesignerVersionItem() {
    let content = `<p><a href="https://vaadin.com/designer" target="_blank">
                    <img border="0"= alt="Vaadin Designer in Eclipse Marketplace" src="/images/logo-vaadin.png" width="100"></p>`;
    content += `<p><a href="https://marketplace.eclipse.org/content/vaadin-plugin-eclipse" target="_blank">
                  <img border="0"= alt="Vaadin Designer in Eclipse Marketplace" src="/images/logo-eclipse.png" width="100"></a></p>`;
    content += `<p><a href="https://plugins.jetbrains.com/plugin/9519-vaadin-designer" target="_blank">
                  <img border="0"= alt="Vaadin Designer Intellij IDEA plugin" src="/images/logo-intellij.png" width="100"></a></p>`
    return content;
  }
}
