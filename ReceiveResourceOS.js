class ReceiveResourceOS extends HTMLElement {
  receiveResource = async resource => {
    this.resource = resource;
    this.update();
  };
  setOs = async os => {
    this.os = os;
  };
  constructor() {
    super();
  }
  connectedCallback() {
    // console.log("receiveresourceos connected")
    //this.innerHTML = "<slot/>";
    let ev = new CustomEvent("pod-os:resource", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: this.receiveResource
    });
    this.dispatchEvent(ev);
    let ev2 = new CustomEvent("pod-os:init", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: this.setOs
    });
    this.dispatchEvent(ev2);
    // These are needed with setupPodOS because pos-app caused rerenders that no longer happen
    // Replaces @State os
    setTimeout(() => {
      if (typeof this.os == "undefined") this.connectedCallback();
    }, 10);
    if (typeof session != "undefined")
      session.onChange("isLoggedIn", this.connectedCallback.bind(this));
  }
  update() {
    return true;
  }
}
//window.customElements.define("receive-resource-os", ReceiveResourceOS);
