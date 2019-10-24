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
    this.element = document.createElement('form');

    // input field
    this.input_label = document.createElement('span');
    this.input_label.innerHTML = "Directory of js files to minify: ";

    this.input_textbox = document.createElement('input');
    this.setupInput(this.input_textbox);

    // output field
    this.output_label = document.createElement('span');
    this.output_label.innerHTML = "Output file: ";

    this.output_textbox = document.createElement('input');
    this.setupInput(this.output_textbox);

    this.reload_button = document.createElement('button');
    this.reload_button.innerHTML = "Reload paths";
    this.reload_button.style = "margin-top: 20px;";

    // add to root
    this.element.appendChild(this.input_label);
    this.element.appendChild(this.input_textbox);
    this.element.appendChild(this.output_label);
    this.element.appendChild(this.output_textbox);
    this.element.appendChild(this.reload_button);
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
      this.input_textbox.value = txt;
  }

  setOutText(txt) {
      this.output_textbox.value = txt;
  }

  getDirText() {
      return this.input_textbox.value;
  }

  getOutText() {
      return this.output_textbox.value;
  }

  focusNext(e) {
        var target = e.srcElement || e.target;
        if (target == this.input_textbox)
            this.output_textbox.focus();
        else
            this.input_textbox.focus();
  }

}
