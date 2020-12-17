let GameDataField = require('./GameDataField');

class GameDataClassDefinition {
  constructor(packageName, className) {
    this._class = `${packageName}.${className}`;
    this._fields = [];
  }

  get fields() {
    return this._fields;
  }

  read(module, stream) {
    let field = null;
    let inst = {};

    for (let field of this._fields) {
      inst[field.name] = field.readData(module, stream);
    }

    return inst;
  }

  addField(fieldName, stream) {
    let field = new GameDataField(fieldName);
    field.readType(stream);
    this._fields.push(field);
  }
}

module.exports = GameDataClassDefinition;