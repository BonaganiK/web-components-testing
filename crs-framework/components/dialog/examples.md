# Binding Examples

```html
<dialogs data-display="stack">
    <dialog id="dialog1" title="Dialog 1" width="400px" height="300px" x="100px" y="100px">
        <header slot="header"></header>
        <my-body slot="main"></my-body>
        <footer slot="footer"></footer>
    </dialog>

    <dialog id="dialog2" title="Dialog 2" width="400px" height="300px" x="100px" y="100px">
        <header slot="header">
            <crs-widget></crs-widget>
        </header>
    </dialog>
</dialogs>
``` 

```js
crs.call("dialogs", "show", {
    title: "Dialog 1",
    id: "work order",
    content: {
        header, main, footer
    },
    options: {
        relative_to: "button 1",
        remember_transform: true
    }
}, context)
```

1. hide current dialog
2. show new dialog
