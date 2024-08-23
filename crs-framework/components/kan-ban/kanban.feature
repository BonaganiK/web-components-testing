@kanban
  # Basic work breakdown
  # JHR - cards manager
  # JHR - swimlane component
  # JHR - horizontal virtualization
  # Charles - kanban settings
  # Note we are not using any binding engine features here.
  # Keep it bare metal
  # --------------------------------------------------------------------------------------------------------------------
  # Basic work breakdown
swim  # JHR - swimlane component
  # JHR - horizontal virtualization
  # Charles / Kieran - kanban settings
  # Kieran - data management (grouping, creating data managers, etc)
  # Kieran - kanban component

Feature: kanban component - HTMLElement
  # this is the overarching component that ties all the features together
  # it is the main component that is used in the app
  # <kanban-component></kanban-component>

  @requirements
    | entity type name  | what entity is this going to use          | passed to the settings    |
    | field_name        | what field is used to group the swim lane | passed to the settings    |
    | compulsory filter | what records are filtered out by default  | passed to the settings    |
    | data              | what data is going to be used             | retried from the settings |
    | swim lanes        | what swim lanes are going to be used      | retried from the settings |
    | bucket field name | what field must be used for the bucket    | used internally           |
    | swim_lane_header  | what is the card name that we need for the header | passed to the swimlane |
    | swim_lane_car     | what is the card name that we need for the record | passed to the swimlane |

  @startup
    Scenario: open and process the kanban settings
      Given the kanban component has been initialized
      When the kanban component is ready
      Then open the kanban settings to start the process
      Example
      """
        await crs.call("kanban_settings", "open", {
          ... // settings
          callback: this.#settingsChangedHandler
        })
      """
      Example
      | type of change  | actions to take                        |
      |-----------------|----------------------------------------|
      | data            | create data managers based on grouping |
      | swim lanes      | create swim lanes based on swim lanes  |

  @registerCards
    Scenario: register the card header and record templates with the card manager
      Given the kanban has templates for the header and record cards
      When the kanban component is loading
      Then read the templates from the component body and register them with the card manager
      Example:
        """
          <kanban-component>
            <template data-type="header-card" id="staff_kanban_header">...</template>
            <template data-type="record-card" id="staff_kanban_record>...</template>
          </kanban-component>

          // data-type is a standard with one of two values as seen above.
          // add id for unique key to be used in cards manager
        """

  @settingsChangedHandler
    Scenario: process the kanban settings
      Given the kanban settings have been changed
      Then apply the settings to the kanban component
      Example
      | type of change  | actions to take                        |
      |-----------------|----------------------------------------|
      | data            | update data managers based on grouping |
      | swim lanes      | update swim lanes as required          |

  @addLanes
    Scenario: add swim lane data managers when the settings change
      Given the kanban settings has changed and additional swim lanes are required
      Then add the required swim lane data managers and swim lanes
      Example the user adds a new staff member to the kanban settings
      Example the user updates the data and in the new set of data there is a new staff member

  @removeLanes
    Scenario: remove swim lane data managers when the settings change
      Given the kanban settings has changed and swim lanes are no longer required
      Then remove the swim lane data managers and swim lanes
      Example the user removes a staff member from the kanban settings

  @refreshData
    Scenario: data is refreshed
      # Note that you will need to show a loading indicator from the start of the refresh to when it is complete

      Given the user clicks on the refresh button
      Then refresh the data for each data manager and refresh the cards for each swim lane
      Example the user clicks on the refresh button

Feature: kanban settings - Schema HTMLElement (ask Gerhard)
  # this is a process that allows the user to configure the kanban component
  # you define what data to fetch and what swim lanes will be available
  # there are two steps to this process
  # the first step is to define what data is fetched and then fetch that data
  # the second you glean from the data what swim lanes are available and then
  # we also be able to add other swim lanes that are not in the data
  # but also remove ones you don't want to see
  # -----------------------------------------------------------------------------------
  # NB: keep in mind that this must be generic and must be reusable for other scenarios

Feature: swimlane component - HTMLElement
  # this is the component that is used to display the swim lanes
  # it displays cards in a vertical column and is virtualized
  # it operates from it's own data manger

  @requirements
    | manager           | data manager name to use                            |
    | headerCard        | name of card in card manager to use for header      |
    | recordCard        | name of card in card manager to use for each record |
    | allowDrag         | can records be dragged and dropped                  |
    | allowDrop         | can records be dropped on this lane                 |

  @events
    | ready             | fires when the component is ready and intractable   |
    | updated           | when the content of the lane has changed            |
    | beforeDrag        | when a record is about to be dragged                |
    | beforeDrop        | when a record is about to be dropped on this lane   |
    | afterDrop         | when a record has been dropped on this lane         |

    # Note that the kanban needs to listen to these events to make decisions about what to do
    # In cases like beforeDrag and beforeDrop a process might be required to check if you can perform those tasks
    # After drop is required to update the data manager and the swim lane

  @isReady
    Scenario: swim lane is ready
      Given the swim lane component has been loaded
      And the headerCard is defined
      And the recordCard is define
      And the data manager is defined
      Then the swim lane is ready to be used

  @onDataChanged
    Scenario: data manager change event fires
      Given we have a data manager set up and we are listenging to the change event
      When the change event fires
      Then we update the swim lane with the new data

  @dataManager.update
    Scenario: update the data manager
      Given the swim lane component has been loaded
      And the data manager is defined
      When the data manager is updated
      Then the swim lane is updated with the new data

  @cardRemoved
    Scenario: remove the card from the swim lane
      Given given allowDrag is true
      When a card was successfully moved to another swim lane
      Then remove the card from the data manager
      When the data manager fires it's update event
      Then apply the change to the swimlane in this case removing it

  @cardAdded
    Scenario: add the card to the swim lane
      Given given allowDrop is true
      When a card was successfully moved to this swim lane
      Then add the card to the data manager
      When the data manager fires it's update event
      Then apply the change to the swimlane in this cas adding it


Feature: cards manager - process api
  # this is used to store templates and create cards based on what is registered
  # it has two parts
  # 1. the data manager class - cards-manager.js
  # 2. the data manager process api actions - cards-manager-actions.js

  Rule: the cards manager is a singleton
    Given the cards manager is a singleton
    Then there is only one instance of the cards manager
    Example crs.cardManager

  Rule: you do not use the card manager instance directly
    Given the cards manager actions are registered
    Then use the process api calls on the card manager actions to perform actions as required
    Example
    """
     await crs.call("card_manager", "register", { ... })
    """

  Rule: the key is unique for each template
    Given the cards manager is a singleton
    Then the key is unique for each template

  Rule: override a template on duplicate key
    Given a card template is registered with a existing key
    Then the template is overridden with the new template

  @register
    Scenario: register a template with the card manager
      Given the card manager actions has been registered
      When I register a template with the card manager
      Then the template is registered with the card manager store using a key value pair
      Example
      """
        await crs.call("cards_manager", "register", {
          "name": "work_orders",
          "template": HTMLTemplateElement
        })
      """

  @unregister
    Scenario: unregister a template with the card manager
      Given the card manager actions has been registered
      When I unregister a template with the card manager
      Then the template is unregistered with the card manager store using a key value pair
      Example
      """
        await crs.call("cards_manager", "unregister", {
          "name": "work_orders"
        })
      """

  @create
    Scenario: create a card/s with the card manager
      Given the card manager actions has been registered
      When given a collection of records
      Then for each record in the collection a card is created using the template and inflated with the record data
      Example
      """
        await crs.call("cards_manager", "create", {
          "name": "work_orders",
          "data": collection
        })
      """
