import {LitElement, customElement, html} from 'lit-element';
import './version-view';

@customElement('app-view')
export class AppViewElement extends LitElement {

  createRenderRoot() {return this;}

  render() {
    return html`
      <version-view></version-view>
    `;
  }
}
