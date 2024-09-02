(function(thisObj) {
    // Function to build the UI
    function buildUI(thisObj) {
        // Create a dockable panel
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "ExprEasy", undefined, {resizeable: true});

        // Dropdown Menu with Transform Properties in the specified order
        var transformDropdown = myPanel.add("dropdownlist", undefined, ["Anchor Point", "Position", "Scale", "Rotation", "Opacity"]);
        transformDropdown.selection = 0;  // Default to Anchor Point

        // Multiline text field to enter custom expression, allowing expansion
        var expressionInput = myPanel.add("edittext", undefined, "", {multiline: true, scrolling: true});
        expressionInput.size = [250, 80];  // Set size of the text field

        // Apply Button
        var applyButton = myPanel.add("button", undefined, "Apply Expression");

        // Function to apply the expression to the selected transform property
        applyButton.onClick = function() {
            var selectedProperty = transformDropdown.selection.text;
            var expression = expressionInput.text;

            // Apply the expression to the selected transform property
            applyExpressionToTransform(selectedProperty, expression);
        };

        myPanel.layout.layout(true);
        return myPanel;
    }

    // Function to apply the expression to the selected property
    function applyExpressionToTransform(propertyName, expression) {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            // Check if layers are selected
            if (comp.selectedLayers.length === 0) {
                alert("Bro select atleast one layer");
                return;
            }

            app.beginUndoGroup("ExprEasy");

            for (var i = 0; i < comp.selectedLayers.length; i++) {
                var layer = comp.selectedLayers[i];

                // Check for layer type and apply expression to the correct transform property
                var transformGroup = layer.property("ADBE Transform Group");

                if (transformGroup) {
                    var property = null;

                    // Determine which property to apply the expression to
                    switch (propertyName) {
                        case "Anchor Point":
                            property = transformGroup.property("ADBE Anchor Point");
                            break;
                        case "Position":
                            property = transformGroup.property("ADBE Position");
                            break;
                        case "Scale":
                            property = transformGroup.property("ADBE Scale");
                            break;
                        case "Rotation":
                            property = transformGroup.property("ADBE Rotate Z"); // Assuming 2D layer
                            break;
                        case "Opacity":
                            property = transformGroup.property("ADBE Opacity");
                            break;
                    }

                    if (property && property.canSetExpression) {
                        // Replace any existing expression with the new one
                        property.expression = expression;
                    } else {
                        alert("Unable to apply expression to " + propertyName);
                    }
                }
            }

            app.endUndoGroup();
        } else {
            alert("Please select a composition with at least one layer.");
        }
    }

    // Create the UI in After Effects
    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) {
        myUI.layout.layout(true);
        myUI.onResizing = myUI.onResize = function() { myUI.layout.resize(); }
        myUI.show();
    }

})(this);
