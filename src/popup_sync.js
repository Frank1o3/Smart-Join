// --- Sync Range and Number Inputs Logic ---

// Function to handle the syncing for a pair of inputs
function setupSync(rangeId, numberId) {
    const rangeInput = document.getElementById(rangeId);
    const numberInput = document.getElementById(numberId);

    if (rangeInput && numberInput) {
        // 1. Sync Range Input (slider) to Number Input
        rangeInput.addEventListener('input', function() {
            numberInput.value = this.value;
            // Trigger the 'change' event on the number input so popup.js reacts
            numberInput.dispatchEvent(new Event('change'));
        });

        // 2. Sync Number Input to Range Input (if the user types a value)
        // This is less critical but good for completeness
        numberInput.addEventListener('change', function() {
            rangeInput.value = this.value;
        });

        // 3. Load initial values from the Number Input to the Range Input on script load
        rangeInput.value = numberInput.value;
    }
}

// Set up sync for all three pairs
setupSync('rangeFPS', 'weightFPS');
setupSync('rangePing', 'weightPing');
setupSync('rangePlayers', 'weightPlayers');