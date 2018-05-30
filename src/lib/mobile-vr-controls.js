var MobileVRControls = function () { };

MobileVRControls.prototype = {
    addVRClickListener: function (clickCallback) {
        let lastButtonState = [];
        let presentingDisplay = null;

        // Set up a loop to check gamepad state while any VRDisplay is presenting.
        function onClickListenerFrame() {
            // Only reschedule the loop if a display is still presenting.
            if (presentingDisplay && presentingDisplay.isPresenting) {
                presentingDisplay.requestAnimationFrame(onClickListenerFrame);
            }

            let gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; ++i) {
                let gamepad = gamepads[i];
                // Ensure the gamepad is valid and has buttons.
                if (gamepad &&
                    gamepad.buttons.length) {
                    let lastState = lastButtonState[i] || false;
                    let newState = gamepad.buttons[0].pressed;
                    // If the primary button state has changed from not pressed to pressed 
                    // over the last frame then fire the callback.
                    if (newState && !lastState) {
                        clickCallback(gamepad);
                    }
                    lastButtonState[i] = newState;
                }
            }
        }

        window.addEventListener('vrdisplaypresentchange', (event) => {
            // When using the polyfill, CustomEvents require event properties to
            // be attached to the `detail` property; native implementations
            // are able to attach `display` directly on the event.
            var display = event.detail ? event.detail.display : event.display;
            if (display.isPresenting) {
                let scheduleFrame = !presentingDisplay;
                presentingDisplay = display;
                if (scheduleFrame)
                    onClickListenerFrame();
            } else if (presentingDisplay == display) {
                presentingDisplay = null;
            }
        });
    }
};

module.exports = MobileVRControls;

