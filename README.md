# Tetsuro Matsuzawa

Small application/game embedding a custom element simulating the memory program used by Tetsuro Matsuzawa in his cognitive tradeoff hypothesis.

<p align="center">
  <img src="./presentation.gif">
</p>

## Installation

Clone the repo then install the deps

```bash
yarn install
```

## Serve

Install `pm2` then

```bash
pm2 start pm2.config.js
```

### production

Use `npm run watch` instead of `pm2` method if you want to modify the code and refresh the page on code change.

## Usage

Finally visit `http://localhost:43789/` to use the app.