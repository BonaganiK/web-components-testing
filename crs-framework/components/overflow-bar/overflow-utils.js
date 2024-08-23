async function createOverflowItems(instance, btnOverflow, overflowContainer, useIcons) {
  await resetAllChildren(instance);
  btnOverflow.removeAttribute("aria-hidden");
  const overflowControlsWidth = await getOverflowControlsWidth(instance);
  const width = instance.offsetWidth;
  let right = 0;
  let hasOverflow = false;
  const children = instance.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.dataset.ignore === "true") {
      child.setAttribute("aria-hidden", "true");
      continue;
    }
    right += child.offsetWidth;
    if (hasOverflow) {
      await addItemToOverflow(child, overflowContainer, useIcons);
      continue;
    }
    if (right > width - overflowControlsWidth) {
      await addItemToOverflow(child, overflowContainer, useIcons);
      hasOverflow = true;
    }
  }
  if (right < width) {
    const firstNotIgnoredChild = instance.querySelector("[aria-hidden='true']:not([data-ignore])");
    if (firstNotIgnoredChild != null) {
      const id = firstNotIgnoredChild.dataset.id;
      firstNotIgnoredChild.removeAttribute("aria-hidden");
      const listItem = overflowContainer.querySelector(`[data-id="${id}"]`);
      listItem?.remove();
    }
    hasOverflow = overflowContainer.children.length > 0;
  }
  if (hasOverflow == false) {
    btnOverflow.setAttribute("aria-hidden", "aria-hidden");
  }
  return hasOverflow;
}
async function createOverflowFromCount(instance, btnOverflow, overflowContainer, count, useIcons, pinned) {
  await resetAllChildren(instance);
  const hasOverflow = instance.children.length > count;
  if (hasOverflow == false)
    return false;
  if (pinned == true) {
    count -= 1;
  }
  for (let i = count; i < instance.children.length; i++) {
    const child = instance.children[i];
    child.setAttribute("aria-hidden", "true");
    await addItemToOverflow(child, overflowContainer, useIcons);
  }
  btnOverflow.removeAttribute("aria-hidden");
  return true;
}
async function resetAllChildren(instance) {
  for (const child of instance.children) {
    child.removeAttribute("aria-hidden");
  }
  instance.overflow.innerHTML = "";
}
async function addItemToOverflow(item, overflowContainer, useIcons) {
  item.setAttribute("aria-hidden", "true");
  if (useIcons === true) {
    return await createLiForIcons(item, overflowContainer);
  }
  await createLiForText(item, overflowContainer);
}
async function createLiForIcons(item, parent) {
  const icon = item.textContent;
  const text_content = item.getAttribute("title");
  const isSelected = item.getAttribute("aria-selected") != null;
  const result = await crs.call("dom", "create_element", {
    tag_name: "li",
    parent,
    text_content,
    dataset: {
      id: item.dataset.id,
      action: item.dataset.action || "",
      icon
    }
  });
  if (item.dataset.invalid != null) {
    result.dataset.invalid = item.dataset.invalid;
  }
  if (isSelected) {
    result.setAttribute("aria-selected", "true");
  }
  return result;
}
async function createLiForText(item, parent) {
  const isSelected = item.getAttribute("aria-selected") != null;
  const result = await crs.call("dom", "create_element", {
    tag_name: "li",
    parent,
    text_content: item.textContent,
    dataset: {
      id: item.dataset.id,
      action: item.dataset.action || ""
    }
  });
  if (item.dataset.invalid != null) {
    result.dataset.invalid = item.dataset.invalid;
  }
  if (isSelected) {
    result.setAttribute("aria-selected", "true");
  }
  return result;
}
async function showOverflow(instance, btnOverflow, overflowContainer) {
  await clearHighlighted(overflowContainer);
  const isMobile = await crs.call("system", "is_mobile", {});
  if (isMobile === true) {
    await showFullscreen(overflowContainer);
  } else {
    await showRelative(instance, btnOverflow, overflowContainer);
  }
  instance.dialogOpen = true;
}
async function showRelative(instance, btnOverflow, overflowContainer) {
  instance.background = await crs.call("dom", "create_element", {
    tag_name: "div",
    parent: instance,
    styles: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "transparent"
    }
  });
  overflowContainer.style.opacity = 0;
  overflowContainer.removeAttribute("aria-hidden");
  await crs.call("fixed_layout", "set", {
    target: btnOverflow,
    element: overflowContainer,
    at: "bottom",
    anchor: "right"
  });
  requestAnimationFrame(() => {
    overflowContainer.style.opacity = 1;
  });
}
async function showFullscreen(overflowContainer) {
  overflowContainer.style.position = "fixed";
  overflowContainer.style.top = 0;
  overflowContainer.style.left = 0;
  overflowContainer.style.right = 0;
  overflowContainer.style.bottom = 0;
  overflowContainer.removeAttribute("aria-hidden");
}
async function closeOverflow(overflow, overflowContainer) {
  overflow.background?.remove();
  overflow.background = null;
  overflowContainer.setAttribute("aria-hidden", "true");
  overflow.dialogOpen = false;
  await clearHighlighted(overflowContainer);
}
async function setPinned(instance, action, id, textContent, icon, invalid) {
  const overflowCell = instance.shadowRoot.querySelector(".overflow-cell");
  delete instance.pinnedContent.dataset.invalid;
  instance.pinnedContent.removeAttribute("aria-hidden");
  instance.pinnedContent.textContent = textContent;
  instance.pinnedContent.dataset.id = id;
  instance.pinnedContent.dataset.action = action;
  if (invalid != null) {
    instance.pinnedContent.dataset.invalid = invalid;
  }
  overflowCell.classList.add("pinned");
  if (icon != null) {
    instance.pinnedContent.textContent = icon;
    instance.pinnedContent.setAttribute("title", textContent);
  }
}
async function unPin(instance) {
  instance.pinnedContent.textContent = "";
  instance.pinnedContent.setAttribute("aria-hidden", "true");
  instance.overflowCell.removeAttribute("aria-selected");
  instance.overflowCell.classList.remove("pinned");
  delete instance.pinnedContent.dataset.id;
  delete instance.pinnedContent.dataset.action;
  const overflowCell = instance.shadowRoot.querySelector(".overflow-cell");
  overflowCell.classList.remove("pinned");
}
async function toggleSelection(selected, container) {
  if (selected == null)
    return;
  const current = container.querySelector('[aria-selected="true"]');
  current?.removeAttribute("aria-selected");
  const id = selected.dataset.id;
  const selectedElement = container.querySelector(`[data-id="${id}"]`);
  selectedElement?.setAttribute("aria-selected", "true");
}
function getOverflowControlsWidth(instance) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const overflowCell = instance.shadowRoot.querySelector(".overflow-cell");
      resolve(overflowCell.offsetWidth);
    });
  });
}
async function moveHighlight(collection, direction) {
  const highlighted = collection.querySelector(".highlighted");
  if (highlighted == null) {
    const first = collection.querySelector("li");
    first?.classList.add("highlighted");
    return;
  }
  const nextHighlighted = direction == 1 ? highlighted.nextElementSibling : highlighted.previousElementSibling;
  if (nextHighlighted == null)
    return;
  highlighted.classList.remove("highlighted");
  nextHighlighted.classList.add("highlighted");
  return nextHighlighted;
}
async function clearHighlighted(collection) {
  const highlighted = collection.querySelector(".highlighted");
  highlighted?.classList.remove("highlighted");
}
export {
  closeOverflow,
  createOverflowFromCount,
  createOverflowItems,
  moveHighlight,
  setPinned,
  showOverflow,
  toggleSelection,
  unPin
};
