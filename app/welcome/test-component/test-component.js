class TestComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  async connectedCallback() {
   const response = await fetch(import.meta.url.replace('.js', '.html'));
   const text = await response.text();
    this.shadowRoot.innerHTML = text;

}
}

customElements.define('test-component', TestComponent);