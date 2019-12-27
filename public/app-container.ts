import { LitElement, customElement, html, css, query } from "lit-element";
import './memory-element'
import '@material/mwc-button'
import { MemoryElement } from "./memory-element";

@customElement('app-container')
export class AppContainer extends LitElement {

  public static styles = [css`
  :host {
    display: block;
    font-family: Roboto;
    text-align: center;
  }
  memory-element {
    width: 300px;
    height: 300px;
    margin: 0 auto 10px;
  }
  `]

  @query('memory-element')
  memoryElement!: MemoryElement


  render () {
    return html`
    <memory-element width=5 height=5 nofn=8></memory-element>
    <mwc-button unelevated @click="${this.startANew}">new</mwc-button>
    `
  }

  startANew() {
    this.memoryElement.reset()
    this.memoryElement.showNumbers(2)
  }
}