'use babel';

export default class MinifyJSView {

  constructor(serializedState, msg) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('minify-j-s');

    // Create message element
    this.message = document.createElement('div');
    this.message.textContent = msg;
    this.message.classList.add('message');
    this.element.appendChild(this.message);
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

  setMessage(msg) {
    this.message.textContent = msg;
  }

}
