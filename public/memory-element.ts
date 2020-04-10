import {css, customElement, html, LitElement, property, queryAll} from 'lit-element';

export declare type BoardMode = 'toggle' | 'oneClick' | 'locked';

@customElement('memory-element')
export class MemoryElement extends LitElement {
  /** Width of the board */
  @property({type: Number}) protected width = 5;
  /** Height of the board */
  @property({type: Number}) protected height = 5;
  /** Number of numbers */
  @property({type: Number}) non = 4;
  /** The current board mode */
  protected boardMode: BoardMode = 'toggle';
  /** prevent clicking on the tiles */
  protected boardLocked = true;

  @queryAll('.tile') protected tiles: HTMLDivElement[];

  protected render() {
    // Redrawing resets the game

    // hide the tiles
    this.hideAllTiles();

    // pick random numbers
    if (this.non > this.width * this.height) {
      console.error('the number of numbers is superior to the board dimension');
      return null;
    }
    const randoms: number[] = [];
    while (randoms.length < this.non) {
      let rand;
      do {
        rand = Math.floor(Math.random() * this.width * this.height) + 1;
      } while (randoms.indexOf(rand) >= 0);
      randoms.push(rand);
    }

    return html`
    <style>
    :host {
      display: flex;
      flex-wrap: wrap;
      background-color: black;
      border-radius: 5px;
    }
    .tile {
      display: flex;
      justify-content: center;
      align-items: center;
      width: calc(100% / ${this.width});
      height: calc(100% / ${this.height});
      background-color: black; 
      color: transparent;
      cursor: pointer;
      user-select: none;
      border-radius: 5px;
    }
    .tile:hover {
      background-color: #9e9e9e61;
    }
    .tile[show] {
      color: white;
    }
    .tile[red] {
      color: red !important;
    }
    </style>
    ${[...Array(this.width * this.height)].map((v, i) => {
      const randomIndex = randoms.indexOf(i + 1);
      return html`
      <div class="tile"
          @click="${this.onTileClick}">
        ${randomIndex >= 0 ? randomIndex + 1 : ''}
      </div>
      `;
    })} 
    `;
  }

  protected updated() {
    // this.showAllTiles();
  }

  protected onTileClick(e: MouseEvent) {
    const el = e.target as HTMLDivElement;
    if (this.boardMode === 'locked') {
      // do nothing
    } else if (this.boardMode === 'oneClick') {
      if (!el.hasAttribute('show')) {
        el.setAttribute('show', '');
      }
    } else if (this.boardMode === 'toggle') {
      el[el.hasAttribute('show') ? 'removeAttribute' : 'setAttribute'](
          'show', '');
    }

    const number =
        parseInt((e.target as HTMLDivElement).textContent!.trim()) || null;

    this.dispatchEvent(new CustomEvent('tileClick', {
      detail: {
        tile: e.target,
        number,
      }
    }));
  }

  public async showAllTiles() {
    await this.updateComplete;
    this.tiles.forEach(tile => {
      tile.setAttribute('show', '');
    });
  }
  public hideAllTiles() {
    this.tiles.forEach(tile => {
      tile.removeAttribute('show');
      tile.removeAttribute('red');
    });
  }

  public redColorizeHiddenTiles() {
    this.tiles.forEach(tile => {
      if (!tile.hasAttribute('show')) {
        tile.setAttribute('red', '');
      }
    })
  }
}