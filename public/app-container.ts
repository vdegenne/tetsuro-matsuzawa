import './memory-element'
import '@material/mwc-button'
import '@material/mwc-linear-progress';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-icon-button';

import {Dialog} from '@material/mwc-dialog';
import {LinearProgress} from '@material/mwc-linear-progress';
import {Snackbar} from '@material/mwc-snackbar';
import {TextField} from '@material/mwc-textfield';
import {css, customElement, html, LitElement, property, query} from 'lit-element';
import {nothing} from 'lit-html';

import {BoardMode, MemoryElement} from './memory-element';

@customElement('app-container')
export class AppContainer extends LitElement {
  // [prop: string]: any;
  @query('#wrapper') protected wrapper: HTMLDivElement;
  @query('memory-element') board: MemoryElement;
  @query('mwc-linear-progress') protected progressBar: LinearProgress;
  @query('mwc-snackbar') snackbar: Snackbar;
  @query('mwc-dialog') dialog: Dialog;

  @property({type: Number}) protected boardWidth = 5;
  @property({type: Number}) protected boardHeight = 5;
  @property({type: Number}) protected non = 8;
  protected currentValue: number;

  protected timeToThink = Math.round(this.non / 3) * 1000;

  @property() protected boardMode: BoardMode = 'locked';

  public static styles = [css`
  :host {
    display: block;
    font-family: Roboto;
    --mdc-theme-primary: black;
  }

  #wrapper {
    max-width: 360px;
    margin: 0 auto;
  }
  memory-element {
    width: 100%;
    height:100%;
    margin: 0 auto 10px;
  }

  #controls {
    display: flex;
    align-items: center;
  }
  form {
    display: flex;
    flex-direction: column;
  }

  form > mwc-textfield {
    margin: 8px 0;
  }
  `];

  constructor() {
    super();
    // @ts-ignore
    window.app = this;
    window.addEventListener('resize', () => this.resizeWrapper());
  }


  render() {
    return html`
    <mwc-linear-progress progress=0></mwc-linear-progress>
    <div id="wrapper">
      <memory-element width="${this.boardWidth}" height="${
        this.boardHeight}" non="${this.non}"
        .boardMode="${this.boardMode}"
        @tileClick="${this.onATileClick}"></memory-element>
    <div>

    <div id="controls">
      <mwc-button raised @click="${this.onNewClick}">start</mwc-button>
      <mwc-icon-button icon="settings" style="margin-left:6px;"
          @click="${() => this.dialog.show()}"></mwc-icon-button>
    </div>

    <mwc-dialog heading="Options">
      <form>
        <mwc-textfield label="width of board"
          option-name="boardWidth"
          type="number"
          value="${this.boardWidth}"
          @change="${this.onOptionChange}"></mwc-textfield>
        <mwc-textfield label="height of board"
          type="number"
          option-name="boardHeight"
          value="${this.boardHeight}"
          @change="${this.onOptionChange}"></mwc-textfield>
        <mwc-textfield label="how many numbers ?"
          type="number"
          option-name="non"
          value="${this.non}"
          @change="${this.onOptionChange}"></mwc-textfield>
        <mwc-textfield label="time before hiding"
          type="number"
          option-name="timeToThink"
          value="${this.timeToThink / 1000}"
          @change="${this.onOptionChange}"></mwc-textfield>
      </form>
      <mwc-button unelevated slot="primaryAction" dialogAction="close">apply</mwc-button>
    </mwc-dialog>

    <mwc-snackbar></mwc-snackbar>
    `
  }

  protected onOptionChange(e: Event) {
    const el = e.target as TextField;
    const optionName = el.getAttribute('option-name')!;
    let value = parseInt(el.value);
    if (optionName === 'timeToThink') {
      value = value * 1000;
    }
    // @ts-ignore
    this[optionName] = value;
    // @todo : save the values in the localStorage
  }

  protected onNewClick() {
    this.resetGame();
    this.startGame();
  }

  protected onATileClick(e: CustomEvent) {
    if (this.boardMode === 'locked') {
      return;
    }
    const number = e.detail.number;
    if (number <= this.currentValue) {
      return;
    }
    if (number !== null && number > this.currentValue &&
        number !== this.currentValue + 1) {
      this.board.redColorizeHiddenTiles();
      this.boardMode = 'locked';
      this.snackbar.labelText = '😔 failed. But you can try again';
      this.snackbar.open();
      return;
    }
    this.currentValue = number;

    if (this.currentValue === this.non) {
      this.snackbar.labelText = '🎉 well done !';
      this.snackbar.open();
      return;
    }
  }

  protected firstUpdated() {
    this.resizeWrapper();
    // (this.shadowRoot!.querySelector('mwc-button') as Button).innerHTML =
    //     'start';
  }

  protected resizeWrapper() {
    this.wrapper.style.height = `${this.wrapper.clientWidth}px`;
  }

  protected resetGame() {
    // this.requestUpdate();
    this.currentValue = 0;
    this.board.requestUpdate();
    // setTimeout(() => {
    this.board.showAllTiles();
    // }, 0);
  }

  protected startInterval: number;
  protected progressBarCloseInterval: number;
  protected async startGame() {
    const stepMs = 1000;
    let elapsed = 0;
    let intervalFct;

    if (this.startInterval) {
      clearInterval(this.startInterval);
    }
    if (this.progressBarCloseInterval) {
      clearInterval(this.progressBarCloseInterval);
    }

    // reset the progress bar
    this.progressBar.progress = 0;
    await new Promise(resolve => setTimeout(resolve, 200));
    this.progressBar.closed = false;

    this.startInterval = setInterval(intervalFct = () => {
      elapsed += stepMs;
      this.progressBar.progress = (elapsed / this.timeToThink);
      if (elapsed > this.timeToThink) {
        clearInterval(this.startInterval);
        this.progressBarCloseInterval = setTimeout(() => {
          this.progressBar.closed = true;
          this.board.hideAllTiles();
          this.boardMode = 'oneClick';
          clearInterval(this.progressBarCloseInterval);
        }, 200);
      }
    }, stepMs);
    intervalFct();
  }
}