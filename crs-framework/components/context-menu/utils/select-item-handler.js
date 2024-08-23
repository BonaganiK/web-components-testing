async function handleSelection(li, options, component) {
  if (li.matches(".parent-menu-item")) {
    await expandAndCollapseSubmenu(li);
    return;
  }
  const option = await findInStructure(options, li.id);
  if (option?.type != null) {
    crs.call(option.type, option.action, option.args);
  }
  component.dataset.value = option.id;
  component.callback?.({ detail: option });
  component.remove();
}
async function setFocusState(li) {
  li.tabIndex = 0;
  li.focus();
}
async function findInStructure(collection, id) {
  for (const item of collection) {
    if (item.id === id || item.id === parseInt(id))
      return item;
    if (item.children != null) {
      const childItem = await findInStructure(item.children, id);
      if (childItem != null) {
        return childItem;
      }
    }
  }
}
async function expandAndCollapseSubmenu(li) {
  if (li.getAttribute("aria-expanded") === "true") {
    return toggleExpansionState(li);
  }
  await collapseOpenedListItems(li);
  await toggleExpansionState(li);
}
async function collapseOpenedListItems(selectedLi) {
  const listItems = selectedLi.parentElement.querySelectorAll(".parent-menu-item[aria-expanded='true']");
  for (const li of listItems) {
    if (li === selectedLi)
      continue;
    await toggleExpansionState(li);
  }
}
async function toggleExpansionState(li, filterHeader, isMobile, groupHeader) {
  const isExpanded = li.getAttribute("aria-expanded") === "true";
  li.setAttribute("aria-expanded", !isExpanded);
  const ul = li.querySelector(".submenu");
  ul.dataset.onEdge = "false";
}
export {
  handleSelection,
  setFocusState,
  toggleExpansionState
};
