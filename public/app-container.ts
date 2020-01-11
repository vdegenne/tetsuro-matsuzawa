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

    --mdc-theme-primary: black;
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
    const multiplication_a = Math.floor(Math.random() * 9) + 1
    const multiplication_b = Math.floor(Math.random() * 9) + 1

    return html`
    <memory-element width=5 height=5 nofn=7></memory-element>
    <mwc-button raised @click="${this.startANew}">new</mwc-button>

    <div style="margin: 70px 0 30px 0;">
      <h2 title="${multiplication_a*multiplication_b}">${multiplication_a} x ${multiplication_b}</h2>
      <mwc-button raised @click="${() => this.requestUpdate()}">update</mwc-button>
    </div>
    `
  }

  startANew() {
    this.memoryElement.reset()
    this.memoryElement.showNumbers(2)
  }
}