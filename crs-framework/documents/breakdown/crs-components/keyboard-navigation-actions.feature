Feature: keyboard-navigation-actions
  # this is a process api module that can be enabled and disabled on any list related element
  # this would be used on
  # 1. kanban to navigate between swimlanes and cards
  # 2. list to navigate between items
  # 3. hierarchical list to navigate between items and expand and collapse items
  # 4. tree view to navigate between items and expand and collapse items
  # 5. grid / table to navigate between rows and cells

  Background:
    Given I am on the "list" page
    And I want to enable keyboard navigation and focus management on that list
    Then I want to enable keyboard navigation and focus management on that list using the process api

  Background:
    Given Virtualization is used on the list
    Then On events that require scrolling into view the external observer must handle this

  Scenario: enable keyboard navigation
    Given I am on the "list" page
    When I enable keyboard navigation
    Then I should have navigational and selection capabilities
    And A manager is attached to the list that will perform the work

    Example: enable keyboard navigation
      ```js
      await crs.call("keyboard-navigation-actions", "enable", {
        element: ul,
        multi_select: true
      });
      ```
  Scenario: disable keyboard navigation
    Given I am on the "list" page
    When I disable keyboard navigation
    Then I should not have navigational and selection capabilities
    And All memory should be cleared

    Example: disable keyboard navigation
      ```js
      await crs.call("keyboard-navigation-actions", "disable", { element: ul });
      ```

  Scenario: perform keyboard actions using process api
    Given I am on the "list" page
    And I enable keyboard navigation
    When I perform keyboard actions using process api
    Then I should be able to navigate and select items using the process api instead of the keyboard

    Example: perform keyboard actions using process api
      ```js
      await crs.call("keyboard-navigation-actions", "enable", { element: ul });
      await crs.call("keyboard-navigation-actions", "perform", { element: ul, action: 'select', id: 1001 });
      ```

    @supported_actions
      | action          | description                        | parameters              | keyboard keys | mouse events |
      | --------------- | ---------------------------------- | ----------------------- | ------------- | ------------ |
      | focus           | focus list / item id               | none / id               | none          | none         |
      | activate        | perform activate action            | id                      | enter         | dblclick     |
      | gotoNext        | go to next item / row              | none / id               | down          | none         |
      | gotoPrevious    | go to previous item / row          | none / id               | up            | none         |
      | gotoFirst       | go to first item                   | none                    | home          | none         |
      | gotoLast        | go to last item                    | none                    | end           | none         |
      | select          | select item                        | id                      | space         | click        |
      | deselect        | deselect item                      | id                      | space         | click        |
      | toggle          | toggle item                        | id                      | space         | click        |
      | selectAll       | select all items                   | none                    | ctr + a       | none         |
      | deselectAll     | deselect all items                 | none                    | ctr + a       | none         |
      | toggleAll       | toggle all items                   | none                    | ctr + a       | none         |
      | groupSelect     | select from this item to that item | from id / to id         | shift + down  | shift click  |
      | clearSelection  | clear selection                    | none                    | none          | none         |
      | expand          | expand item                        | id                      | right         | dblclick     |
      | collapse        | collapse item                      | id                      | left          | dblclick     |
      | gotoNextCell    | to to the cell on the right        | id                      | right         | none         |
      | gotoPreviousCell| to to the cell on the left         | id                      | left          | none         |
      | expandAll       | expand all items                   | none                    | ctr + right   | none         |
      | collapseAll     | collapse all items                 | none                    | ctr + left    | none         |

    Scenario: use the focus action
      Given I have keyboard navigation enabled
      And The component auto selects first item
      And I used the focus action
      Then The first item in the list should be focused
      And The event observer should deal with scrolling to the focused item

    Scenario: raise event when navigation action is preformed
      Given I am on the "list" page
      And I enable keyboard navigation
      When I perform keyboard actions using process api or keyboard
      Then I should be able to navigate and select items using keyboard
      And I should see the event raised defining what action was performed
      And The event should define the previous element and the current element

  Scenario: get the selected items
    Given I am on the "list" page
    And I enable keyboard navigation
    When I select an item
    Then I should be able to get the selected items

    Example: get the selected items
      ```js
      await crs.call("keyboard-navigation-actions", "enable", { element: ul });
      await crs.call("keyboard-navigation-actions", "select", { element: ul, id: 1001 });
      const selected = await crs.call("keyboard-navigation-actions", "get_selected_items", { element: ul });
      ```
  Rule: selection dom update
    Given a element is selected
    Then update the aria-selected attribute of the selected element and set it to true
    And update the previously selected element and set it's aria-selected to false

  Rule: differentiate between the current focused item and selected items
    Given we have a selected item and we pressed up or down arrow key on the keyboard
    Then the current focused item should show as focused but not selected

  Rule: selecting a item
    Given we have a selected item in the list
    And the select key is pressed
    Then the currently focused item should be selected

  Rule: deselect current when new selection is made if multi select is not enabled
    Given we have a selected item in the list
    And the select key is pressed
    And the multi select is not enabled
    Then the currently focused item should be selected
    And the previously selected item should be deselected

  Rule: leave selection on multi selected items
    Given multi selection is enabled
    And any navigation or selection action is performed
    Then leave the selection as is just update the focused item

  Rule: discern between next cell or expand - collapse does the same thing
    Given we have a focused item
      And the right key is pressed
      Then if the item has a aria-expanded attribute
      Then expand the item
      But if the item does not have a aria-expanded attribute
      Then go to the next cell


@acceptance_criteria
  # -- can navigate between items using the keyboard
  # -- can navigate between cells using the process api
  # -- can select items using the keyboard
  # -- can select items using the process api
  # -- can expand and collapse items using the keyboard if applicable
  # -- can expand and collapse items using the process api if applicable
  # -- can select multiple items using the keyboard
  # -- can select multiple items using the process api
  # -- activate / execute a selected item using the keyboard
  # -- activate / execute a selected item using the process api
  # -- can select all items using the keyboard
  # -- can select all items using the process api
  # -- can deselect all items using the keyboard
  # -- can deselect all items using the process api
  # -- can toggle all items using the keyboard
  # -- can toggle all items using the process api
  # -- can clear selection using the keyboard
  # -- can clear selection using the process api
  # -- can expand all items using the keyboard
  # -- can expand all items using the process api
  # -- can collapse all items using the keyboard
  # -- can collapse all items using the process api
  # -- can select a range of items using the keyboard and mouse
  # -- can select a range of items using the process api

