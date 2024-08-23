Feature: Shapes Drawing Module
  In order to create vector graphics
  As a graphic application user
  I want to draw various shapes using specific parameters

  Background:
    Given the ShapesModule is initialized and ready to draw

  Scenario: Drawing a circle
    When I call "drawCircle" with the following parameters:
      | centerX | centerY  | radius | fillColor | strokeColor | strokeWidth |
      | --------| -------- | ------ | --------- | ----------- | ----------- |
      | 100     | 100      | 50     | red       | black       | 2           |
    Then a circle should be drawn at (100,100) with a radius of 50 and filled with red color

  Scenario: Drawing a rectangle
    When I call "drawRectangle" with the following parameters:
      | x  | y  | width | height | fillColor | strokeColor | strokeWidth |
      | -- | -- | ----- | ------ | --------- | ----------- | ----------- |
      | 10 | 20 | 200   | 100    | blue      | black       | 2           |
    Then a rectangle should be drawn at (10,20) with a width of 200 and a height of 100 filled with blue color

  Scenario: Drawing a line
    When I call "drawLine" with the following parameters:
      | startX | startY | endX | endY | strokeColor | strokeWidth  |
      | -------| ------ | ---- | ---- | ----------- | ------------ |
      | 10     | 10     | 100  | 100  | green       | 2            |
    Then a line should be drawn from (10,10) to (100,100) with green color and a stroke width of 2

  Scenario: Drawing a Bezier curve
    When I call "drawBezierCurve" with the following parameters:
      | points [startPoint, controlPoint1, controlPoint2, endPoint]  | strokeColor | strokeWidth |
      | ------------------------------------------------------------ | ----------- | ----------- |
      | [(10,10), (20,20), (40,20), (50,10)]                         | black       | 2           |
    Then a Bezier curve should be drawn with the given points, black color and a stroke width of 2

  Scenario: Drawing a complex Bezier curve with multiple segments
    When I call "drawBezierCurve" with the following parameters:
      | points [startPoint, controlPoint1, controlPoint2, endPoint]     | strokeColor | strokeWidth |
      | --------------------------------------------------------------- | ----------- | ----------- |
      | [(10,10), (20,20), (40,20), (50,10), (60,0), (80,0), (90,10)]   | black       | 2           |
    Then a complex Bezier curve should be drawn with the given segments, black color and a stroke width of 2


Feature: Interactive Shapes Drawing
  In order to create vector graphics interactively
  As a graphic application user
  I want to use mouse actions to draw shapes and polygons with specific behaviors

  Background:
    Given the ShapesModule is initialized and ready for interaction

  # General scenario for shapes drawing with click and drag
  Scenario: Drawing a shape with click and drag
    When I click at point (startX, startY) and drag to point (endX, endY)
    And I release the mouse button at point (endX, endY)
    Then a shape should be drawn from the start point to the end point with default styles

  # Specific scenarios for each shape
  Scenario: Drawing a rectangle with click and drag
    When I click at point (10, 10) and drag to point (100, 50)
    And I release the mouse button at point (100, 50)
    Then a rectangle should be drawn from (10,10) to (100,50) with default fill and stroke

  Scenario: Drawing a circle with click and drag
    When I click at point (100, 100) and drag to point (150, 150)
    And I release the mouse button at point (150, 150)
    Then a circle should be drawn with center (100,100) and radius 50 with default fill and stroke

  Scenario: Drawing an ellipse with click and drag
    When I click at point (200, 200) and drag to point (250, 240)
    And I release the mouse button at point (250, 240)
    Then an ellipse should be drawn with center (200,200) and radii 50 and 40 with default fill and stroke

  Scenario: Drawing a line with click and drag
    When I click at point (300, 300) and drag to point (400, 400)
    And I release the mouse button at point (400, 400)
    Then a line should be drawn from (300,300) to (400,400) with default stroke color and width

  # Polygon drawing with click to mark points and double-click to close
  Scenario: Marking points for a polygon with clicks
    When I click at point (10, 10)
    And I click at point (50, 10)
    And I click at point (50, 50)
    And I click at point (10, 50)
    Then a temporary shape should be visualized with points marked at the clicked positions

  Scenario: Closing a polygon with a double-click
    Given I have marked points for a polygon
    When I double-click at the last point or near the starting point
    Then the polygon should be closed and rendered with default styles

  # Polygon editing
  Scenario: Editing a drawn polygon
    Given a polygon is already drawn on the canvas
    When I click and drag a polygon point to (newX, newY)
    And I release the mouse button at (newX, newY)
    Then the polygon should be updated with the new point positions

  # Error handling for invalid shapes
  Scenario: Attempting to draw an invalid shape
    When I click and drag in such a way that a valid shape cannot be formed
    Then no shape should be drawn
    And I should be notified that the shape is invalid

  # Cancelling drawing
  Scenario: Cancelling the drawing of a shape
    Given I have started to draw a shape
    When I press the 'Escape' key
    Then the drawing action should be cancelled
    And the canvas should be cleared of any temporary or incomplete shapes

  # Right-click to undo the last action
  Scenario: Undoing the last action with right-click
    Given I have drawn a shape
    When I right-click
    Then the last action should be undone
    And the canvas should reflect the removal of the last shape or line

  # Saving the drawn shapes
  Scenario: Saving the canvas with drawn shapes
    Given I have drawn several shapes
    When I click the 'Save' button
    Then all the shapes should be saved in the current state
    And I should receive confirmation that the canvas has been saved

Feature: Transform Tools for Shapes
  In order to manipulate vector graphics
  As a graphic application user
  I want to move, rotate, and scale shapes using specific parameters

  Background:
    Given the TransformModule is initialized and ready for interaction

  Scenario: Moving a shape
    When I call "move_shape" with the following parameters:
      | shape_id | new_x | new_y |
      | -------- | ----- | ----- |
      | 1        | 150   | 150   |
    Then shape with id 1 should be moved to position (150,150)

  Scenario: Rotating a shape
    When I call "rotate_shape" with the following parameters:
      | shape_id | angle |
      | -------- | ----- |
      | 1        | 45    |
    Then shape with id 1 should be rotated by 45 degrees

  Scenario: Scaling a shape
    When I call "scale_shape" with the following parameters:
      | shape_id | scale_x | scale_y |
      | -------- | ------- | ------- |
      | 1        | 1.5     | 0.5     |
    Then shape with id 1 should be scaled horizontally by 150% and vertically by 50%

  Scenario: Applying multiple transformations
    When I call "transform_shape" with the following parameters:
      | shape_id | move_x | move_y | rotate | scale_x | scale_y |
      | -------- | ------ | ------ | ------ | ------- | ------- |
      | 1        | 100    | 100    | 30     | 2       | 2       |
    Then shape with id 1 should be moved, rotated, and scaled with the given parameters

Feature: Layer Management for Drawing Application
  In order to manage different aspects of a drawing separately
  As a graphic application user
  I want to create, reorder, hide, show, and delete layers

  Background:
    Given the LayerModule is initialized and ready for interaction
    And By deffault, we have a layer named "Background" that is visible
    And By deffault, we have a layer named "Layer 1" that is visible

  Scenario: Set background image
    When Creating the canvas you need to provide a background
    When The background is a static image
    Then The background should be set to the image provided at top 0 and left 0
    When The background is a geographical map
    Then A map mangement provider should be loaded that will update this layer as we pand and zoom
    And the manager will be queried to get geographical data for the current view location and zoom level
    When The background is a 3d model
    Then The picking tools must enable face picking and rotation of the model

  Scenario: Creating a new layer
    When I call "create_layer" with the following parameters:
      | name          | visibility |
      | "Layer 1"     | true       |
    Then a new layer named "Layer 1" should be created and set to visible

  Scenario: Hiding a layer
    Given I have a layer named "Layer 1"
    When I call "set_layer_visibility" with the following parameters:
      | name          | visibility |
      | "Layer 1"     | false      |
    Then "Layer 1" should be set to invisible

  Scenario: Showing a layer
    Given I have a layer named "Layer 1" that is invisible
    When I call "set_layer_visibility" with the following parameters:
      | name          | visibility |
      | "Layer 1"     | true       |
    Then "Layer 1" should be set to visible

  Scenario: Deleting a layer
    Given I have a layer named "Layer 1"
    When I call "delete_layer" with the following parameter:
      | name          |
      | "Layer 1"     |
    Then "Layer 1" should be deleted

  Scenario: Reordering layers
    Given I have the following layers:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
      | "Layer 3" |
    When I call "reorder_layers" with the following parameters:
      | layers_order                      |
      | ["Layer 2", "Layer 1", "Layer 3"] |
    Then the layers should be reordered with "Layer 2" at the top followed by "Layer 1" and "Layer 3"

  Scenario: Renaming a layer
    Given I have a layer named "Layer 1"
    When I call "rename_layer" with the following parameters:
      | old_name      | new_name      |
      | "Layer 1"     | "Background"  |
    Then the layer should be renamed from "Layer 1" to "Background"

  Scenario: Merging layers
    Given I have the following layers:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
    When I call "merge_layers" with the following parameters:
      | base_layer_name | merge_layer_name |
      | "Layer 1"       | "Layer 2"        |
    Then "Layer 2" should be merged into "Layer 1" and "Layer 2" should be deleted

  Scenario: Moving a layer up in the stack
    Given I have the following layers in order:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
      | "Layer 3" |
    When I call "move_layer_up" with the following parameter:
      | name      |
      | "Layer 2" |
    Then "Layer 2" should be above "Layer 1" in the stack
    And the layers should now be in the following order:
      | name      |
      | "Layer 2" |
      | "Layer 1" |
      | "Layer 3" |

  Scenario: Moving a layer down in the stack
    Given I have the following layers in order:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
      | "Layer 3" |
    When I call "move_layer_down" with the following parameter:
      | name      |
      | "Layer 2" |
    Then "Layer 2" should be below "Layer 3" in the stack
    And the layers should now be in the following order:
      | name      |
      | "Layer 1" |
      | "Layer 3" |
      | "Layer 2" |

  Scenario: Attempting to move the top layer up in the stack
    Given I have the following layers in order:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
    When I call "move_layer_up" with the following parameter:
      | name      |
      | "Layer 1" |
    Then no change in the layer order should occur
    And an appropriate error message should be displayed

  Scenario: Attempting to move the bottom layer down in the stack
    Given I have the following layers in order:
      | name      |
      | "Layer 1" |
      | "Layer 2" |
    When I call "move_layer_down" with the following parameter:
      | name      |
      | "Layer 2" |
    Then no change in the layer order should occur
    And an appropriate error message should be displayed

Feature: Pan and Zoom in Drawing Application
  In order to view different parts and levels of detail in a drawing
  As a graphic application user
  I want to pan across the canvas and zoom in and out

  Background:
    Given the ViewModule is initialized and ready for interaction

  Scenario: Panning the view
    Given I am viewing the canvas at the default position
    When I call "pan_view" with the following parameters:
      | direction | distance |
      | "right"   | 100      |
      | "down"    | 50       |
    Then the canvas view should be shifted 100 units right and 50 units down

  Scenario: Zooming in on the canvas
    Given I am viewing the canvas at 100% scale
    When I call "zoom_view" with the following parameter:
      | zoom_factor |
      | 1.5         |
    Then the canvas should be zoomed in by 150%

  Scenario: Zooming out of the canvas
    Given I am viewing the canvas at 200% scale
    When I call "zoom_view" with the following parameter:
      | zoom_factor |
      | 0.75        |
    Then the canvas should be zoomed out to 150% scale

  Scenario: Panning the view with the mouse
    Given I am viewing the canvas at the default position
    When I press the middle mouse button at canvas position (200, 200)
    And I drag the mouse to position (300, 300)
    And I release the middle mouse button
    Then the canvas view should be panned according to the mouse movement

  Scenario: Zooming in with the mouse wheel
    Given I am viewing the canvas at 100% scale
    When I scroll the mouse wheel up at canvas position (200, 200)
    Then the canvas should be zoomed in centered on position (200, 200)

  Scenario: Zooming out with the mouse wheel
    Given I am viewing the canvas at 200% scale
    When I scroll the mouse wheel down at canvas position (200, 200)
    Then the canvas should be zoomed out centered on position (200, 200)

  Scenario: Panning the view with arrow keys
    Given I am viewing the canvas at the default position
    When I press the "arrow right" key
    And I press the "arrow down" key
    Then the canvas view should be shifted slightly to the right and down

  Scenario: Zooming in with keyboard shortcuts
    Given I am viewing the canvas at 100% scale
    When I press the "Ctrl" key and the "+" key together
    Then the canvas should be zoomed in by a predefined increment

  Scenario: Zooming out with keyboard shortcuts
    Given I am viewing the canvas at 200% scale
    When I press the "Ctrl" key and the "-" key together
    Then the canvas should be zoomed out by a predefined decrement

Feature: Grid Snapping in Drawing Application
  In order to align elements precisely
  As a graphic application user
  I want to enable and disable grid snapping and set snapping parameters

  Background:
    Given the GridModule is initialized and ready for interaction

  Scenario: Enabling grid snapping
    When I call "set_grid_snapping" with the following parameters:
      | status    | grid_size |
      | "enabled" | 10        |
    Then grid snapping should be enabled with a grid size of 10 units

  Scenario: Disabling grid snapping
    When I call "set_grid_snapping" with the following parameter:
      | status    |
      | "disabled"|
    Then grid snapping should be disabled

  Scenario: Snapping a shape to the grid
    Given grid snapping is enabled with a grid size of 10 units
    And I have a shape at position (12, 15)
    When I call "snap_shape_to_grid" with the following parameter:
      | shape_id |
      | 1        |
    Then the shape with id 1 should be moved to the nearest grid position at (10, 20)

Feature: Advanced Image Widget Repository for Drag and Drop
  In order to utilize and manipulate images effectively in drawings
  As a graphic application user
  I want to drag images from a repository onto the canvas, customize their properties, and manage their placement

  Background:
    Given the ImageRepositoryModule and CanvasModule are initialized and ready for interaction

  Scenario: Dragging and dropping an SDF image onto the canvas with property customization
    Given I have an image repository with SDF images
    When I drag an image with id "icon_1" from the repository
    And I drop it onto the canvas at position (200, 200)
    Then the image should be placed on the canvas at position (200, 200)
    And I set the background color to "#FF5733"
    And I set the fill color to "#FFFFFF"
    And I set the stroke color to "#000000"
    And I adjust the image size to width "50" and height "50"
    And I set the opacity to "0.8"
    And I rotate the image to "45" degrees
    And I lock the image in place

  Scenario: Aligning and snapping an image to the grid after placement
    Given I have placed an SDF image with id "icon_2" on the canvas
    And grid snapping is enabled with a grid size of 10 units
    When I move the image and it snaps to the nearest grid position at (100, 100)
    Then the image should be aligned to the grid position (100, 100)

  Scenario: Grouping images and manipulating them as a single unit
    Given I have placed SDF images with ids "icon_1" and "icon_2" on the canvas
    When I select both images and group them
    And I move the grouped images to position (300, 300)
    Then the images should move together maintaining their relative positions

  Scenario: Searching for an image in the repository and placing it on the canvas
    Given I have searched for "house" in the image repository
    When I find SDF images related to "house"
    And I drag an image with id "icon_3" from the search results
    And I drop it onto the canvas at position (400, 400)
    Then the image should be placed on the canvas at position (400, 400)

  Scenario: Undoing and redoing image manipulation actions
    Given I have placed an SDF image with id "icon_4" on the canvas and changed its size
    When I perform an undo action
    Then the size change should be reverted
    When I perform a redo action
    Then the size change should be reapplied

Feature: Widget - entity association

  Scenario: Associate a widget with an entity
    Given we have a widget that we want to associate with a entity
    When assigning a entity to an widget
    And using that widget in a drawing
    Then the identity would be registered on the widget
    And when interacting with that widget, the entity is updated

  Scenario: Associate a widget with a process
    Given we have a widget that we want to associate with a process
    When assigning a process to an widget
    Then the process execution details are attached to the widget
    And when interacting with that widget, the process is executed

  Scenario: Associating a record with a glyph
    Given we have a glyph that we want to associate with a record
    When assigning a record to a glyph
    Then the record is associated with the glyph
    And when interacting with that glyph, the record is displayed

Feature: custom process drawing tools

  Scenario:
    Given we have a process that we want to execute
    Then we can create a new custom tool that inherits from a existing tool
    When using that drawing tool the process is executed

    Example: we create a work order marker tool
      When we draw on the canvas
      And the action is completed
      Then a work order is created by opening a work order edit screen
      But if the work order creation is cancelled, the drawing is removed from the canvas

Feature: export graphic

  Scenario:
    Given we have a graphic that we want to export
    When exporting the graphic
    Then the graphic is saved to that machine to a png file


Feature: updating glyphs based on data changes

  Scenario: update associated glyphs on load
    Given we have a glyph that is associated with a record
    When the record is loaded
    Then the glyph is updated to reflect the record data

  Scenario: updating associated glyphs
    Given we have a glyph that is associated with a record
    When the record is updated
    Then the glyph is updated to reflect the changes

  Scenario: updating glyphs with update process
    Given we have a glyph that is associated with a record
    And we have registered the glphy with a update process
    When the record is updated
    Then the glyph is updated to reflect the changes