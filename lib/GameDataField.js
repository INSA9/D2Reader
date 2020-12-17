class GameDataField {
  static NULL_IDENTIFIER = -1431655766;
  static _classesByName = {};

  constructor(fieldName) {
    this.name = fieldName;
  }

  readType(stream) {
    let type = stream.readInt();
    this.readData = this.getReadMethod(type, stream);
  }

  getReadMethod(type, stream) {
    switch (type) {
      case -1:
        return this.readInteger;
      case -2:
        return this.readBoolean;
      case -3:
        return this.readString;
      case -4:
        return this.readNumber;
      case -5:
        return this.readI18n;
      case -6:
        return this.readUnsignedInteger;
      case -99:
        if (!this._innerReadMethods) {
          this._innerReadMethods = [];
          this._innerTypeNames = [];
        }

        this._innerTypeNames.push(stream.readUTF());
        this._innerReadMethods.unshift(this.getReadMethod(stream.readInt(), stream));
        //console.log(this);
        return this.readVector;
      default:
        if (type > 0) {
          return this.readObject;
        }

        throw new Error();
    }
  }

  readVector(moduleName, stream, innerIndex = 0) {
    let len = stream.readInt();
    let content = {};

    if (this._innerTypeNames.includes('Vector')) {
    
      //let vectorTypeName = this._innerTypeNames[innerIndex];
      

      //console.log(len);
      //console.log(this);

      for (let i = 0; i < len; i++) {
        console.log(this);
        content[i] = this._innerReadMethods[innerIndex](moduleName, stream, innerIndex + 1);
      }

      console.log(content);
    }
    
    return content;
  }

  readObject(moduleName, stream, innerIndex = 0) {
    let classIdentifier = stream.readInt();

    if (classIdentifier === GameDataField.NULL_IDENTIFIER) {
      return null;
    }

    let classDefinition = GameDataFileAccessor.getInstance().getClassDefinition(moduleName, classIdentifier);
    return classDefinition.read(moduleName, stream);
  }

  readInteger(moduleName, stream, innerIndex = 0) {
    return stream.readInt();
  }

  readBoolean(moduleName, stream, innerIndex = 0) {
    return stream.readBoolean();
  }

  readString(moduleName, stream, innerIndex = 0) {
    let result = stream.readUTF();

    if (result === 'null') {
      result = null;
    }

    return result;
  }

  readNumber(moduleName, stream, innerIndex = 0) {
    return stream.readDouble();
  }

  readI18n(moduleName, stream, innerIndex = 0) {
    return stream.readInt();
  } 

  readUnsignedInteger(moduleName, stream, innerIndex = 0) {
    return stream.readUnsignedInt();
  }
}

module.exports = GameDataField;