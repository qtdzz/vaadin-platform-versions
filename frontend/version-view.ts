import {LitElement, customElement, html, property, query} from 'lit-element';


import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';
import './version-controller';
import '@polymer/paper-badge';
import { VersionController } from './version-controller';
import PlatformItem from './generated/com/qtdzz/model/PlatformItem';

@customElement('version-view')
export class VersionViewElement extends LitElement {
  private versionController: VersionController = new VersionController(
    this.setItems.bind(this)
  );
  createRenderRoot() {return this;}

  @property() items: Array<PlatformItem | null> = [];

  @query('vaadin-grid')
  vaadinGrid?: any;


  render() {
    return html`
      <vaadin-grid style="height: 100vh;" theme="row-stripes">
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
        <vaadin-grid-column>
          <template class="header">Vaadin 13.0.2</template>
          <template>
            <div>Java version: [[item.javaVersion]]</div>
            <div hidden="[[!item.npmName]]">npm package: [[item.npmName]]:[[item.npmVersion]]</div>
            <div hidden="[[!item.bowerVersion]]">Bower version: [[item.bowerVersion]]</div>
            <div hidden="[[!item.isPro]]">Pro: [[item.isPro]]</div>
            <div hidden="[[!item.isComponent]]">Component: [[item.isComponent]]</div>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
      <custom-style>
        <style is="custom-style">
          .badge-green {
            --paper-badge-background: var(--lumo-success-color);
            --paper-badge-margin-left: 29px;
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

  private setItems(items: Array<PlatformItem | null>) {
    this.items = items;
    const a : PlatformItem[] = [];
    items.forEach(i => {
      if(i) {
        a.push(i);
      }
    });
    this.vaadinGrid.items = a;
    console.log(this.items);
  }

  async firstUpdated(): Promise<void> {
    this.versionController.setItemAction();
  }
}
