# Tetsuro Matsuzawa

Small application embedding a custom element simulating the memory program used by Tetsuro Matsuzawa in his cognitive tradeoff hypothesis.

<p align="center">
  <img src="./presentation.gif">
</p>

## installation

Clone the repo then install the deps

```bash
npm i
```

Create a symlink to the node_modules directory in public

```bash
cd public
ln -s ../node_modules node_modules
```

## serve

Install `pm2` then

```bash
pm2 start pm2.config.js
```

### production

Use `npm run watch` instead of `pm2` method if you want to modify the code and refresh the page on code change.
