@layout-container

Feature: layout-container - HTMLElement
  # this is the overarching component that controls the layout of the document
  # it is responsible for creating the content layout and adjusting it
  #<layout-component data-columns= "1fr 1fr" data-rows= "1fr 1fr"></layout-component>

  @requirements
  | data-columns  | the grid value for the column width | passed through the data-attribute (data-columns) |
  | data-rows     | the grid value for the row height   | passed through the data-attribute (data-rows)    |
  | dispatchEvent | dispatched 'change'| dispatches an event once the state has changed |
  | onMessage()   | listens for postMessage | listens for postMessage and updates the state |
  | change.setValue Event  | sets the column state | sets the column state based on the event |
  | id | the id of the component | passed through the attributes (id) |

  Scenario: Create a four column layout with two rows
    Given I have a layout-container with four columns and two rows
    Then The component should have a data-columns value of "1fr 1fr 1fr 1fr"
    And The component should have a data-rows value of "1fr 1fr"
    Example
      """
        <layout-container data-column="1fr 1fr 1fr 1fr" data-rows="1fr 1fr">
              <div id="Left">Left</div>
              <div id="Center">Center</div>
              <div id="Right">Right</div>
        </layout-container>
      """

  Scenario: Create a three column layout and show or hide the first column based on the click of a button
    Given I have a layout-component with three columns and one row
    When I click on show/hide button a post message event fires which is picked up by the layout-container
    Then the setState property should be set to custom
    And the first column should be hidden
    And the second and third column should be visible, where the second column is twice the width of the third column
    And the component should dispatch an event with the new state.
    Example
      """
          <layout-container id="lc-assets" data-columns="1fr 1fr 1fr" data-rows="1fr" change.setValue="state = $event.detail">
             <div id ='sidebar' hidden.if="state != 'custom' ? true">
                <button id="show-button" click.post="setState['#my-container'](parameters: {state='default'})">launch</button>
             </div>
             <div id="Left-1" hidden.if="state == 'custom' ? true">
                <button id="hide-button" click.post="setState[#my-container](parameters: {state='custom', columns='5rem 2fr 1fr'})">minimize-widget</button>
             </div>
             <div id="Center-1">Center</div>
             <div id="Right-1">Right</div>
          </layout-container>
      """

  Scenario: Create a four column and one row layout and show or hide the second row based on the click of a button
    Given I have a layout-component with four columns and two rows
    When I click on show/hide button a post message event fires which is picked up by the layout-container
    Then the setState property should be set to custom
    And the second row should be removed
    And all columns are visible in the first row
    And the component should dispatch an event with the new state.
  Example
      """
          <layout-container id="lc-assets" data-columns="1fr 1fr" data-rows="1fr 1fr"  change.setValue= state = $event.detail">
              <div id ='sidebar-1' hidden.if="state != 'custom' ? true">
                  <button id="show-row-button" click.post="setState['#my-rows'](parameters: {state='default'})">launch</button>
              </div>
              <div id="Left-2" hidden.if="state == 'custom' ? true">
                  <button id="hide-row-button" click.post="setState[#my-rows](parameters: {state='custom',columns='1fr 1fr 1fr 1fr', rows='1fr'})">minimize-widget</button>
              </div>
              <div id="Center-2">Center</div>
              <div id="Right-2">Right</div>
              <div id="Next-2">Next</div>
          </layout-container>
      """