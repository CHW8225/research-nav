const fs = require('fs');
const path = require('path');

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

class JSONDatabase {
  constructor(filePath, defaultData) {
    this.filePath = filePath;
    this.defaultData = defaultData;
    this.data = cloneData(defaultData);
  }

  read() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.data = cloneData(this.defaultData);
      return;
    }

    const content = fs.readFileSync(this.filePath, 'utf8').trim();
    this.data = content ? JSON.parse(content) : cloneData(this.defaultData);
  }

  write() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
  }
}

module.exports = {
  JSONDatabase
};
