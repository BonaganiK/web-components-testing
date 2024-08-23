@Feature: Combobox behaviours

  @Scenario: Required combobox that can not be null
    Given It is required
    And It has a placeholder attribute
    When I don't have a value
    Then Show the placeholder value
    And Mark as invalid

    Given It is required
    And It does NOT have a placeholder
    And The value is not defined
    Then Select the first option as the selected option

    When It does have a value
    Then Show that value

  @Scenario: Optional combobox that can be null but has a "None" option
    Given We do no have a value
    Then Show the "None" as the selected option

    When We have a value
    Then Show that value

  @Scenario: Standard combobox that is option
    Given We do no have a value
    And We do not have a placeholder
    Then Show ""

    Given We have a placeholder
      And the value is not define or is ""
      Then Show the placeholder value

  @Scenario: Select item in combobox
    Given We have a value
      When The items are set
      Then build the options
      Then select the option that has the relevant value
      And show the text of that option in the edit