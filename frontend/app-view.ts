import {LitElement, customElement, html, property} from 'lit-element';

import './login-view';
import './status-view';
import './version-view';

@customElement('app-view')
export class AppViewElement extends LitElement {
  @property({type: Boolean})
  loggedIn: boolean = false;

  createRenderRoot() {return this;}

  render() {
    return html`
      <version-view></version-view>
    `;
  }
}
