import {LitElement, html, customElement, property, query} from 'lit-element'
import {nothing} from 'lit-html'

@customElement('memory-element')
export class MemoryElement extends LitElement {

  @property({ type: Number })
  width = 10

  @property({ type: Number })
  height = 10.

  @property({ type: Number })
  nofn = 4 // number of numbers

  @property({ attribute: false })
  state = 'normal'

  private _track = 1

  // cases
  get cases () {
    return [...this.shadowRoot!.querySelectorAll('.case')]
  }

  public render () {
    return html`
    <style>
      :host {
        display: flex;
        flex-wrap: wrap;
        ${this.state === 'normal' ? html`background: black` : nothing};
        ${this.state === 'failure' ? html`background: red` : nothing};
        ${this.state === 'success' ? html`background: #4caf50` : nothing};
      }
      .case {
        /* background: black; */
        color: white;
        width: calc(100% / ${this.width});
        height: calc(100% / ${this.height});
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-indent: 9999px;
        overflow: hidden;
        transition: background .1s linear;
      }
      .case:hover {
        background: rgba(200, 200, 200, .3);
      }

      .revealed {
        text-indent: 0px;
      }
    </style>
    ${[...Array(this.width * this.height)].map((_, i) => {
      return html`<div class="case revealed" @click="${this.revealCase}"></div>`
    })}
    `
  }

  clearCases () {
    this.cases.forEach(c => c.textContent = '')
  }

  reset() {
    this.state = 'normal'
    this._track = 1
    this.placeNumbers()
  }

  placeNumbers() {
    this.clearCases()

    const cases = this.cases

    let i = 0
    while (i++ < this.nofn) {
      // pick a case
      let c
      do {
        c = Math.floor(Math.random() * (this.width * this.height))
      } while (cases[c].textContent !== '')
      cases[c].textContent = `${i}`
    }
  }

  hideNumbers() {
    this.cases.forEach(c => c.classList.remove('revealed'))
  }

  showNumbers(duration = 2) {
    this.cases.forEach(c => c.classList.add('revealed'))
    if (duration) {
      setTimeout(() => this.hideNumbers(), duration * 1000)
    }
  }

  revealCase (e: Event) {
    const c = e.target as HTMLElement
    c.classList.add('revealed')
    if (!c.textContent) {
      return
    }
    if (parseInt(c.textContent) !== this._track) {
      this.state = 'failure'
    }
    else {
      this._track += 1
      if (this._track > this.nofn) {
        this.state = 'success'
      }
    }
  }
}