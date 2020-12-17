class GameDataProcess {
  constructor(stream) {
    this._stream = stream;
    this._sortIndex = {};
    this.parseStream();
  }

  getQueryableField() {
    return this._queryableField;
  }

  getFieldType(fieldName) {
    return this._searchFieldType[fieldName];
  }

  parseStream() {
    let size = 0;
    let fieldName = null;
    this._queryableField = [];
    this._searchFieldIndex = {};
    this._searchFieldType = {};
    this._searchFieldCount = {};
    let fieldListSize = this._stream.readInt();
    let indexSearchOffset = this._stream.position + fieldListSize + 4;

    while (fieldListSize) {
      size = this._stream.bytesAvailable;
      fieldName = this._stream.readUTF();
      this._queryableField.push(fieldName);
      this._searchFieldIndex[fieldName] = this._stream.readInt() + indexSearchOffset;
      this._searchFieldType[fieldName] = this._stream.readInt();
      this._searchFieldCount[fieldName] = this._stream.readInt();
      fieldListSize = fieldListSize - (size - this._stream.bytesAvailable);
    }
  }
}

module.exports = GameDataProcess;