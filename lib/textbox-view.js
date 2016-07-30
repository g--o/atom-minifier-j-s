'use babel';

export default class TextBoxView {

    setupInput(e) {
        e.classList.add('minify-j-s');
        e.type = "text";
        e.enabled = "true";
        e.classList.add('textbox');
        e.classList.add('native-key-bindings');
    }

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');

    this.label1 = document.createElement('span');
    this.label1.innerHTML = "Directory of js files to minify: ";

    this.in1 = document.createElement('input');
    this.setupInput(this.in1);

    this.label2 = document.createElement('span');
    this.label2.innerHTML = "Output file: ";

    this.in2 = document.createElement('input');
    this.setupInput(this.in2);

    this.element.appendChild(this.label1);
    this.element.appendChild(this.in1);
    this.element.appendChild(this.label2);
    this.element.appendChild(this.in2);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  setDirText(txt) {
      this.in1.value = txt;
  }

  setOutText(txt) {
      this.in2.value = txt;
  }

  getDirText() {
      return this.in1.value;
  }

  getOutText() {
      return this.in2.value;
  }

}
