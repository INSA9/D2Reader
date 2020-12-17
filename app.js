let GameDataFileAccessor = require('./lib/GameDataFileAccessor');
let express = require('express');
let app = express();
let port = 3000;

let test = new GameDataFileAccessor();
test.init('./MapPositions.d2o');
let maps = test.getObjects('MapPositions');

app.get('/:id', (req, res) => {
  try {
    let m;
    for (let map of maps) {
      if (map) {
        if (map.id == req.params.id) {
          m = map;
        }
      }
    }
    res.json({
      id: m.id,
      posX: m.posX,
      posY: m.posY
    });
  } catch(err) {
    res.json({
      error: true
    });
  }
});

app.listen(port, () => {
  console.log('Started');
});