import {LitElement, customElement, html} from 'lit-element';
// import { StatusController } from './status-controller';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';

@customElement('status-view')
export class VersionViewElement extends LitElement {
  // private statusController: StatusController = new StatusController();

  createRenderRoot() {return this;}

  render() {
    return html`
    <vaadin-grid>
    </vaadin-grid>
    `;
  }
}
