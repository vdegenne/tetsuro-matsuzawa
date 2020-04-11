import './memory-element'
import '@material/mwc-button'
import '@material/mwc-linear-progress';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-icon-button';
import '@material/mwc-formfield';
import '@material/mwc-checkbox';

import {Button} from '@material/mwc-button';
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
  @query('#game-button') protected gameButton: Button;
  @query('#feedback') protected feedback: HTMLDivElement;

  @property({type: Number}) protected boardWidth = 5;
  @property({type: Number}) protected boardHeight = 5;
  @property({type: Number}) protected level = 3;
  @property({type: Number}) protected levelReached = 3;
  protected currentValue: number;

  @property({type: Boolean}) protected waitingNextClick = false;

  protected timeToThink = 3000;  // Math.round(this.level / 3) * 1000;

  @property() protected boardMode: BoardMode = 'locked';

  public static styles = [css`
  :host {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: Roboto;
    --mdc-theme-primary: black;
  }

  #board-container {
    display: flex;
    /* align-items: center; */
    flex: 1;
  }
  #wrapper {
    max-width: 360px;
    width: 100%;
    margin: 26px auto 0;
  }

  #level-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 5px 0;
  }
  memory-element {
    width: 100%;
    height:100%;
    margin: 0 auto 10px;
  }
  #board-bottom-bar {
    display: flex;
    /* align-items: center; */
  }
  #board-bottom-bar > #feedback {
    flex:1;
  }


  #controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

    // load the level
    if (localStorage.getItem('level') !== null) {
      const level = parseInt(localStorage.getItem('level')!.toString());
      this.levelReached = level;
      this.level = level;
    }
  }


  render() {
    return html`

    <div id="controls">
      <mwc-icon icon="arrow_forward" style="flex:1"></mwc-icon>
      <mwc-icon-button icon="settings" style="margin-left:6px;"
          @click="${() => this.dialog.show()}"></mwc-icon-button>
      <mwc-icon-button icon="help"></mwc-icon-button>
    </div>
    
    <!-- <div id="board-container"> -->
    <div id="wrapper">
      <div id="level-controls">
        <mwc-icon-button icon="arrow_backward"
          ?disabled="${this.level === 3}"
          @click="${this.onPreviousLevelClick}"
        ></mwc-icon-button>
        <b>${this.level}</b>
        <mwc-icon-button icon="arrow_forward"
          ?disabled="${this.levelReached === this.level}"
          @click="${this.onNextLevelClick}"
        ></mwc-icon-button>
      </div>
      <mwc-linear-progress progress=0></mwc-linear-progress>
      <memory-element
          width="${this.boardWidth}"
          height="${this.boardHeight}"
          non="${this.level}"
          .boardMode="${this.boardMode}"
          @tileClick="${this.onATileClick}">
      </memory-element>
      <div id="board-bottom-bar">
        <div id="feedback"></div>
        <mwc-button id="game-button" raised
            label="${this.waitingNextClick ? 'next' : 'start'}"
            icon="${this.waitingNextClick ? 'arrow_forward' : ''}"
            trailingIcon
            @click="${this.onBoardButtonClick}"></mwc-button>
      </div>
    </div>
    <!-- </div> -->

    <mwc-dialog heading="Options"> 
      <form>
        <mwc-formfield label="training mode">
          <mwc-checkbox></mwc-checkbox>
        </mwc-formfield>
        <mwc-button unelevated
          style="--mdc-theme-primary:red"
          @click="${this.onResetProgressClick}">reset progress</mwc-button>
      </form>
      <mwc-button unelevated slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>

    <mwc-snackbar timeoutMs="4000"></mwc-snackbar>
    `
  }

  protected onResetProgressClick() {
    const accept = confirm('Are you sure? Your progress will be lost.');
    if (accept) {
      this.resetProgress();
    }
  }

  protected onPreviousLevelClick() {
    this.endPreparingStart();
    this.feedback.textContent = '';
    this.boardMode = 'locked';
    if (this.waitingNextClick) {
      this.waitingNextClick = false;
    }
    this.level--;
  }
  protected onNextLevelClick() {
    this.endPreparingStart();
    this.feedback.textContent = '';
    this.boardMode = 'locked';
    if (this.waitingNextClick) {
      this.waitingNextClick = false;
    }
    this.level++;
  }

  // protected onOptionChange(e: Event) {
  //   const el = e.target as TextField;
  //   const optionName = el.getAttribute('option-name')!;
  //   let value = parseInt(el.value);
  //   if (optionName === 'timeToThink') {
  //     value = value * 1000;
  //   }
  //   // @ts-ignore
  //   this[optionName] = value;
  //   // @todo : save the values in the localStorage
  // }

  protected async onBoardButtonClick() {
    this.feedback.textContent = '';
    this.boardMode = 'locked';
    if (this.waitingNextClick) {
      this.level++;
      this.waitingNextClick = false;
    }
    this.resetGame();
    await this.prepareStartGame();
  }

  protected async onATileClick(e: CustomEvent) {
    // console.log(this.boardMode);
    if (this.boardMode === 'locked') {
      if (!this.startInterval) {
        return;
      }
      // else we are clicking during a start
      // we have to start the game
      // this.cancelStart();
      this.startGame();
      // starting the game will hide all tiles again
      // we make sure the current tile is shown
      (e.detail.tile as HTMLDivElement).setAttribute('show', '');
    }
    const number = e.detail.number;
    if (number <= this.currentValue) {
      return;
    }
    if (number !== null && number > this.currentValue &&
        number !== this.currentValue + 1) {
      this.board.redColorizeHiddenTiles();
      this.boardMode = 'locked';
      this.feedback.textContent = 'failed 😔 try again!';
      // this.snackbar.labelText = '😔 failed. But you can try again';
      // this.snackbar.open();
      return;
    }
    this.currentValue = number;

    if (this.currentValue === this.level) {
      this.openSnackbar('🎉 well done 🎉');
      this.boardMode = 'locked';
      // setTimeout(() => this.levelUp(), 1000);
      this.levelUp();
      return;
    }
  }

  protected firstUpdated() {
    this.resizeWrapper();
    // (this.shadowRoot!.querySelector('mwc-button') as Button).innerHTML =
    //     'start';
  }

  protected resizeWrapper() {
    // this.wrapper.style.height = `${this.wrapper.clientWidth}px`;
    this.board.style.height = `${this.wrapper.clientWidth}px`;
  }

  protected resetGame() {
    // this.currentValue = 0;
    this.board.requestUpdate();
    this.board.showAllTiles();
  }

  protected startInterval?: NodeJS.Timeout;
  protected progressBarCloseInterval?: NodeJS.Timeout;

  protected prepareStartGame() {
    const stepMs = 1000;
    let elapsed = 0;
    let intervalFct;

    // cancel previously preparation
    this.endPreparingStart();

    this.startInterval = setInterval(intervalFct = async () => {
      if (elapsed === 0) {
        // we waiting for the progress bar to reset
        await new Promise(resolve => setTimeout(resolve, 200));
        this.progressBar.closed = false;
      }
      elapsed += stepMs;
      this.progressBar.progress = (elapsed / this.timeToThink);
      if (elapsed > this.timeToThink) {
        // clearInterval(this.startInterval!);
        // this.cancelStart();
        // this.progressBarCloseInterval = setTimeout(() => {
        // this.progressBar.closed = true;
        this.startGame();
        // this.board.hideAllTiles();
        // this.boardMode = 'oneClick';
        // clearInterval(this.progressBarCloseInterval!);
        // }, 200);
      }
    }, stepMs);
    intervalFct();
  }
  protected startGame() {
    this.endPreparingStart();
    this.currentValue = 0;
    this.board.hideAllTiles();
    this.boardMode = 'oneClick';
  }
  protected endPreparingStart() {
    this.progressBar.closed = true;

    if (this.startInterval !== undefined) {
      clearInterval(this.startInterval);
      this.startInterval = undefined;
    }
    if (this.progressBarCloseInterval !== undefined) {
      clearInterval(this.progressBarCloseInterval);
      this.startInterval = undefined;
    }

    // reset the progress bar
    this.progressBar.progress = 0;
  }

  openSnackbar(message: string) {
    this.snackbar.labelText = message;
    this.snackbar.open();
  }

  protected levelUp() {
    if (this.level !== this.levelReached) {
      return;
    }
    this.feedback.innerHTML = 'You levelled up!<br>';
    this.levelReached = this.level + 1;
    this.waitingNextClick = true;
    localStorage.setItem('level', this.levelReached.toString());
  }

  protected resetProgress() {
    localStorage.removeItem('level');
    window.location.reload();
  }
}