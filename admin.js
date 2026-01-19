let choiceCount = 0;
const MAX_CHOICES = 15;
let registeredFlags = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('choicesContainer');
    const addBtn = document.getElementById('addChoiceBtn');
    const addAllBtn = document.getElementById('addAllBtn');
    const form = document.getElementById('adminForm');
    const loadBtn = document.getElementById('loadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    // Auto-register all 15 flags on page load
    initializeAllFlags();

    // Load saved configuration on page load
    loadConfiguration().catch(err => {
        console.error('Error loading configuration:', err);
    });

    addBtn.addEventListener('click', () => {
        if (choiceCount < MAX_CHOICES) {
            addChoiceField();
        } else {
            showMessage('Maximum of 15 choices allowed', 'error');
        }
    });

    addAllBtn.addEventListener('click', () => {
        addAllCountries();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveConfiguration();
    });

    loadBtn.addEventListener('click', () => {
        loadConfiguration();
    });

    exportBtn.addEventListener('click', () => {
        exportConfiguration();
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importConfiguration(file);
        }
    });
});

function initializeAllFlags() {
    // All 15 flags are always available
    const allFlags = [
        { code: 'AUS', country: 'Australia' },
        { code: 'BHR', country: 'Bahrain' },
        { code: 'CHN', country: 'China' },
        { code: 'HKG', country: 'Hong Kong - China' },
        { code: 'IND', country: 'India' },
        { code: 'IRA', country: 'Iraq' },
        { code: 'IRN', country: 'Iran' },
        { code: 'JOR', country: 'Jordan' },
        { code: 'JPN', country: 'Japan' },
        { code: 'KOR', country: 'Korea' },
        { code: 'KSA', country: 'Saudi Arabia' },
        { code: 'KUW', country: 'Kuwait' },
        { code: 'OMA', country: 'Oman' },
        { code: 'QAT', country: 'Qatar' },
        { code: 'UAE', country: 'United Arab Emirates' }
    ];
    
    // Register all flags automatically
    registeredFlags = allFlags.map(flag => ({
        country: flag.country,
        path: `flags/${flag.code}.png`
    }));
    
    saveRegisteredFlags();
    console.log('All 15 flags initialized');
}

function addAllCountries() {
    try {
        const allFlags = [
            { code: 'AUS', country: 'Australia' },
            { code: 'BHR', country: 'Bahrain' },
            { code: 'CHN', country: 'China' },
            { code: 'HKG', country: 'Hong Kong - China' },
            { code: 'IND', country: 'India' },
            { code: 'IRA', country: 'Iraq' },
            { code: 'IRN', country: 'Iran' },
            { code: 'JOR', country: 'Jordan' },
            { code: 'JPN', country: 'Japan' },
            { code: 'KOR', country: 'Korea' },
            { code: 'KSA', country: 'Saudi Arabia' },
            { code: 'KUW', country: 'Kuwait' },
            { code: 'OMA', country: 'Oman' },
            { code: 'QAT', country: 'Qatar' },
            { code: 'UAE', country: 'United Arab Emirates' }
        ];
        
        // Clear existing choices
        const container = document.getElementById('choicesContainer');
        if (!container) {
            showMessage('Error: Container not found', 'error');
            return;
        }
        
        container.innerHTML = '';
        choiceCount = 0;
        
        // Add all countries
        const countriesToAdd = allFlags.length;
        for (let i = 0; i < countriesToAdd; i++) {
            const flag = allFlags[i];
        const choice = {
            country: flag.country,
            flagPath: `flags/${flag.code}.png`,
            revealNumber: i + 1 // Default reveal number 1-15 (ranking auto-calculated)
        };
            addChoiceField(choice);
        }
        
        // Update all dropdowns after adding
        updateAllCountryDropdowns();
        
        showMessage(`Added ${countriesToAdd} countries! Update rankings and reveal numbers as needed.`, 'success');
        console.log(`Added ${countriesToAdd} countries`);
    } catch (error) {
        console.error('Error adding all countries:', error);
        showMessage('Error adding countries: ' + error.message, 'error');
    }
}




function saveRegisteredFlags() {
    localStorage.setItem('registeredFlags', JSON.stringify(registeredFlags));
}

function loadRegisteredFlags() {
    const saved = localStorage.getItem('registeredFlags');
    if (saved) {
        try {
            registeredFlags = JSON.parse(saved);
        } catch (e) {
            registeredFlags = [];
        }
    }
}

function updateAllCountryDropdowns() {
    const dropdowns = document.querySelectorAll('.country-select');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        updateCountryDropdown(dropdown);
        // Restore selection and update flag path
        if (currentValue) {
            dropdown.value = currentValue;
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            if (selectedOption && selectedOption.dataset.path) {
                const flagInput = dropdown.closest('.choice-item').querySelector('.flag-path-readonly');
                if (flagInput) flagInput.value = selectedOption.dataset.path;
            }
        }
    });
}

function updateCountryDropdown(dropdown) {
    const currentValue = dropdown.value;
    dropdown.innerHTML = '<option value="">Select Country</option>';
    
    registeredFlags.forEach(flag => {
        const option = document.createElement('option');
        option.value = flag.country;
        option.textContent = flag.country;
        option.dataset.path = flag.path;
        if (currentValue === flag.country) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
}

function addChoiceField(choice = null) {
    if (choiceCount >= MAX_CHOICES) return;

    const container = document.getElementById('choicesContainer');
    const choiceDiv = document.createElement('div');
    choiceDiv.className = 'choice-item';
    choiceDiv.dataset.index = choiceCount;

    // Country dropdown
    const countryLabel = document.createElement('label');
    countryLabel.textContent = 'Country:';
    countryLabel.className = 'field-label';
    
    const countrySelect = document.createElement('select');
    countrySelect.className = 'country-select';
    countrySelect.required = true;
    updateCountryDropdown(countrySelect);
    
    // Flag image path input (read-only, auto-filled) - create before setting up event handlers
    const flagLabel = document.createElement('label');
    flagLabel.textContent = 'Flag Image:';
    flagLabel.className = 'field-label';
    
    const flagInput = document.createElement('input');
    flagInput.type = 'text';
    flagInput.placeholder = 'flags/flag.png';
    flagInput.required = true;
    flagInput.readOnly = true;
    flagInput.className = 'flag-path-readonly';
    
    // Auto-fill flag path when country is selected
    countrySelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.path) {
            flagInput.value = selectedOption.dataset.path;
        } else {
            flagInput.value = '';
        }
    });
    
    // Set initial values if choice is provided
    if (choice) {
        countrySelect.value = choice.country || '';
        // Set flag path directly if choice exists
        if (choice.flagPath) {
            flagInput.value = choice.flagPath;
        } else if (choice.country) {
            // Try to find flag path from registered flags
            const flag = registeredFlags.find(f => f.country === choice.country);
            if (flag) {
                flagInput.value = flag.path;
            }
        }
        // Trigger change event to ensure flag path is set
        if (choice.country) {
            countrySelect.dispatchEvent(new Event('change'));
        }
    }

    // Reveal number input (ranking is auto-calculated from this)
    const revealLabel = document.createElement('label');
    revealLabel.textContent = 'Reveal Number:';
    revealLabel.className = 'field-label';
    
    const revealInput = document.createElement('input');
    revealInput.type = 'number';
    revealInput.placeholder = 'Reveal number';
    revealInput.required = true;
    revealInput.min = '1';
    if (choice) revealInput.value = choice.revealNumber || '';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
        choiceDiv.remove();
        choiceCount--;
        updateIndices();
    });

    // Create input groups
    const countryGroup = document.createElement('div');
    countryGroup.className = 'input-group';
    countryGroup.appendChild(countryLabel);
    countryGroup.appendChild(countrySelect);

    const flagGroup = document.createElement('div');
    flagGroup.className = 'input-group';
    flagGroup.appendChild(flagLabel);
    flagGroup.appendChild(flagInput);

    const revealGroup = document.createElement('div');
    revealGroup.className = 'input-group';
    revealGroup.appendChild(revealLabel);
    revealGroup.appendChild(revealInput);

    choiceDiv.appendChild(countryGroup);
    choiceDiv.appendChild(flagGroup);
    choiceDiv.appendChild(revealGroup);
    choiceDiv.appendChild(removeBtn);

    container.appendChild(choiceDiv);
    choiceCount++;
}

function updateIndices() {
    const items = document.querySelectorAll('.choice-item');
    items.forEach((item, index) => {
        item.dataset.index = index;
    });
}

async function saveConfiguration() {
    const question = document.getElementById('questionInput').value.trim();
    const choices = [];
    const choiceItems = document.querySelectorAll('.choice-item');

    choiceItems.forEach(item => {
        const countrySelect = item.querySelector('.country-select');
        const flagInput = item.querySelector('.flag-path-readonly');
        const inputs = item.querySelectorAll('input[type="number"]');
        const country = countrySelect ? countrySelect.value.trim() : '';
        const flagPath = flagInput ? flagInput.value.trim() : '';
        const revealNumber = parseInt(inputs[0].value);
        // Ranking is automatically calculated from reveal number (lower number = higher rank)
        const ranking = revealNumber;
        
        if (country && flagPath && !isNaN(revealNumber)) {
            choices.push({
                country: country,
                flagPath: flagPath,
                name: flagPath, // Keep for backward compatibility with game.js
                ranking: revealNumber, // Ranking equals reveal number (lower = higher rank)
                revealNumber: revealNumber
            });
        }
    });

    if (choices.length === 0) {
        showMessage('Please add at least one country with all fields filled', 'error');
        return;
    }

    // Sort by ranking for easier management
    choices.sort((a, b) => a.ranking - b.ranking);

    // Save to server
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question || 'Which is higher or lower?',
                choices: choices
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Also save to localStorage as backup
            localStorage.setItem('higherLowerChoices', JSON.stringify(choices));
            localStorage.setItem('higherLowerQuestion', question || 'Which is higher or lower?');
            showMessage('Configuration saved successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to save');
        }
    } catch (error) {
        console.error('Error saving to server:', error);
        // Fallback to localStorage if server fails
        localStorage.setItem('higherLowerChoices', JSON.stringify(choices));
        localStorage.setItem('higherLowerQuestion', question || 'Which is higher or lower?');
        
        // Check if it's a network error or server error
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showMessage('Server unavailable. Saved locally. Make sure the server is running and accessible.', 'error');
        } else {
            showMessage('Error saving to server: ' + error.message + '. Saved locally as backup.', 'error');
        }
    }
}

async function loadConfiguration() {
    try {
        // Try to load from server first
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (response.ok) {
            // Check if we have data from server
            if (data.choices && data.choices.length > 0) {
                // Load from server
                const container = document.getElementById('choicesContainer');
                container.innerHTML = '';
                choiceCount = 0;

                if (data.question) {
                    document.getElementById('questionInput').value = data.question;
                }

                data.choices.forEach(choice => {
                    // Handle old format (with just "name") by converting to new format
                    if (choice.name && !choice.flagPath) {
                        choice.flagPath = choice.name;
                        if (!choice.country) {
                            choice.country = choice.name.split('/').pop().split('.')[0] || '';
                        }
                    }
                    // If ranking exists but no revealNumber, use ranking as revealNumber
                    if (choice.ranking && !choice.revealNumber) {
                        choice.revealNumber = choice.ranking;
                    }
                    // If country exists but not in registered flags, add it temporarily
                    if (choice.country && !registeredFlags.find(f => f.country === choice.country)) {
                        registeredFlags.push({ country: choice.country, path: choice.flagPath || choice.name });
                        saveRegisteredFlags();
                    }
                    addChoiceField(choice);
                });

                // Also save to localStorage as backup
                localStorage.setItem('higherLowerChoices', JSON.stringify(data.choices));
                localStorage.setItem('higherLowerQuestion', data.question || '');
                
                showMessage('Configuration loaded from server!', 'success');
                return;
            } else {
                // Server connected but no data - this is normal for first time setup
                console.log('Server connected but no configuration found. Using localStorage or starting fresh.');
            }
        }
    } catch (error) {
        console.error('Error loading from server:', error);
    }
    
    // Fallback to localStorage if server fails or no data
    const saved = localStorage.getItem('higherLowerChoices');
    const savedQuestion = localStorage.getItem('higherLowerQuestion');
    
    // Load question
    if (savedQuestion) {
        document.getElementById('questionInput').value = savedQuestion;
    }
    
    if (saved) {
        try {
            const choices = JSON.parse(saved);
            const container = document.getElementById('choicesContainer');
            container.innerHTML = '';
            choiceCount = 0;

            choices.forEach(choice => {
                // Handle old format (with just "name") by converting to new format
                if (choice.name && !choice.flagPath) {
                    choice.flagPath = choice.name;
                    if (!choice.country) {
                        choice.country = choice.name.split('/').pop().split('.')[0] || '';
                    }
                }
                // If ranking exists but no revealNumber, use ranking as revealNumber
                if (choice.ranking && !choice.revealNumber) {
                    choice.revealNumber = choice.ranking;
                }
                // If country exists but not in registered flags, add it temporarily
                if (choice.country && !registeredFlags.find(f => f.country === choice.country)) {
                    registeredFlags.push({ country: choice.country, path: choice.flagPath || choice.name });
                    saveRegisteredFlags();
                }
                addChoiceField(choice);
            });

            showMessage('Configuration loaded from local storage!', 'success');
        } catch (e) {
            showMessage('Error loading configuration', 'error');
        }
    } else {
        // Add one empty choice field by default
        addChoiceField();
    }
}

function exportConfiguration() {
    try {
        const question = document.getElementById('questionInput').value.trim();
        const choices = [];
        const choiceItems = document.querySelectorAll('.choice-item');

        choiceItems.forEach(item => {
            const countrySelect = item.querySelector('.country-select');
            const flagInput = item.querySelector('.flag-path-readonly');
            const inputs = item.querySelectorAll('input[type="number"]');
            const country = countrySelect ? countrySelect.value.trim() : '';
            const flagPath = flagInput ? flagInput.value.trim() : '';
            const revealNumber = parseInt(inputs[0].value);
            
            if (country && flagPath && !isNaN(revealNumber)) {
                choices.push({
                    country: country,
                    flagPath: flagPath,
                    ranking: revealNumber, // Ranking equals reveal number
                    revealNumber: revealNumber
                });
            }
        });

        if (choices.length === 0) {
            showMessage('No choices to export. Please add countries first.', 'error');
            return;
        }

        const config = {
            question: question || 'Which is higher or lower?',
            choices: choices,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `higher-lower-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage('Configuration exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting configuration:', error);
        showMessage('Error exporting configuration: ' + error.message, 'error');
    }
}

function importConfiguration(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            
            // Validate config structure
            if (!config.choices || !Array.isArray(config.choices)) {
                showMessage('Invalid configuration file format', 'error');
                return;
            }

            // Clear existing choices
            const container = document.getElementById('choicesContainer');
            container.innerHTML = '';
            choiceCount = 0;

            // Set question
            if (config.question) {
                document.getElementById('questionInput').value = config.question;
            }

            // Add imported choices
            config.choices.forEach(choice => {
                // Ensure ranking is set from revealNumber if missing
                if (!choice.ranking && choice.revealNumber) {
                    choice.ranking = choice.revealNumber;
                }
                addChoiceField(choice);
            });

            // Update dropdowns
            updateAllCountryDropdowns();

            showMessage(`Imported ${config.choices.length} countries successfully!`, 'success');
            
            // Clear file input
            importFile.value = '';
        } catch (error) {
            console.error('Error importing configuration:', error);
            showMessage('Error importing configuration: ' + error.message, 'error');
            importFile.value = '';
        }
    };
    
    reader.onerror = function() {
        showMessage('Error reading file', 'error');
        importFile.value = '';
    };
    
    reader.readAsText(file);
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 3000);
}
