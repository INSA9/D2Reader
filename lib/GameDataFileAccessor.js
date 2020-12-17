let { readFileSync } = require('fs');
let ByteArray = require('bytearray-node');
let { Endian } = require('bytearray-node/enums/');
let GameDataClassDefinition = require('./GameDataClassDefinition');
let GameDataProcess = require('./GameDataProcess');

class GameDataFileAccessor {
  static _self;

  constructor() {
    if (GameDataFileAccessor._self) {
      throw new Error();
    }
  }

  static getInstance() {
    if (!GameDataFileAccessor._self) {
      GameDataFileAccessor._self = new GameDataFileAccessor();
    }

    return GameDataFileAccessor._self;
  }

  init(fileUri) {
    let nativeFile = readFileSync(fileUri);

    if (!nativeFile) {
      throw new Error();
    }

    let moduleName = fileUri.split('/').pop().split('.')[0];

    if (!this._streams) {
      this._streams = {};
    }

    if (!this._streamStartIndex) {
      this._streamStartIndex = {};
    }

    let stream = this._streams[moduleName];

    if (!stream) {
      stream = new ByteArray(nativeFile);
      stream.endian = Endian.BIG_ENDIAN;
      this._streams[moduleName] = stream;
      this._streamStartIndex[moduleName] = 7;
    } else {
      stream.position = 0; 
    }

    this.initFromIDataInput(stream, moduleName);
  }

  initFromIDataInput(stream, moduleName) {
    let key = 0;
    let pointer = 0;
    let count = 0;
    let classIdentifier = 0;
    let formatVersion = 0;
    let len = 0;

    if (!this._streams) {
      this._streams = {};
    }

    if (!this._indexes) {
      this._indexes = {};
    }

    if (!this._classes) {
      this._classes = {};
    }

    if (!this._counter) {
      this._counter = {};
    }

    if (!this._streamStartIndex) {
      this._streamStartIndex = {};
    }

    if (!this._gameDataProcessor) {
      this._gameDataProcessor = {};
    }

    this._streams[moduleName] = stream;

    if (!this._streamStartIndex[moduleName]) {
      this._streamStartIndex[moduleName] = 7;
    }

    let indexes = {};
    this._indexes[moduleName] = indexes;
    let contentOffset = 0;
    let headers = stream.readMultiByte(3, 'ASCII');

    if (headers !== 'D2O') {
      stream.position = 0;

      try {
        headers = stream.readUTF();
      } catch (error) {}

      if (headers !== 'AKSF') {
        throw new Error();
      }

      formatVersion = stream.readShort();
      len = stream.readInt();
      stream.position = stream.position + len;
      contentOffset = stream.position;
      this._streamStartIndex[moduleName] = contentOffset + 7;
      headers = stream.readMultiByte(3, 'ASCII');

      if (headers !== 'D2O') {
        throw new Error();
      }
    }

    let indexesPointer = stream.readInt();
    stream.position = contentOffset + indexesPointer;
    let indexesLength = stream.readInt();

    for (let i = 0; i < indexesLength; i = i + 8) {
      key = stream.readInt();
      pointer = stream.readInt();
      indexes[key] = contentOffset + pointer;
      count++;
    }

    this._counter[moduleName] = count;
    let classes = {};
    this._classes[moduleName] = classes;
    let classesCount = stream.readInt();

    for (let j = 0; j < classesCount; j++) {
      classIdentifier = stream.readInt();
      this.readClassDefinition(classIdentifier, stream, classes);
    }

    if (stream.bytesAvailable) {
      this._gameDataProcessor[moduleName] = new GameDataProcess(stream);
    }
  }

  getDataProcessor(moduleName) {
    return this._gameDataProcessor[moduleName];
  }

  getClassDefinition(moduleName, classId) {
    return this._classes[moduleName][classId];
  }

  getCount(moduleName) {
    return this._counter[moduleName];
  }

  getObject(moduleName, objectId) {
    if (!this._indexes || !this._indexes[moduleName]) {
      return null;
    }

    let pointer = this._indexes[moduleName][objectId];

    if (!pointer) {
      return null;
    }

    this._streams[moduleName].position = pointer;
    let classId = this._streams[moduleName].readInt();
    return this._classes[moduleName][classId].read(moduleName, this._streams[moduleName]);
  }

  getObjects(moduleName) {
    if (!this._counter || !this._counter[moduleName]) {
      return null;
    }

    let len = this._counter[moduleName];
    let classes = this._classes[moduleName];
    let stream = this._streams[moduleName];
    stream.position = this._streamStartIndex[moduleName];
    let objs = new Array(len);

    for (let i = 0; i < len; i++) {
      let j = stream.readInt();
      if (classes[j]) {
        objs[i] = classes[j].read(moduleName, stream);
      }
    }

    return objs;
  }

  readClassDefinition(classId, stream, store) {
    let fieldName = null;
    let fieldType = 0;
    let className = stream.readUTF();
    let packageName = stream.readUTF();
    let classDef = new GameDataClassDefinition(packageName, className);
    let fieldsCount = stream.readInt();

    for (let i = 0; i < fieldsCount; i++) {
      fieldName = stream.readUTF();
      classDef.addField(fieldName, stream);
    }

    store[classId] = classDef;
  }
}

module.exports = GameDataFileAccessor;