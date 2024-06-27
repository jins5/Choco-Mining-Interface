document.addEventListener('DOMContentLoaded', function () {
    const fileUploadButton = document.querySelector('#file-upload-button');
    const fileInput = document.querySelector('#file-input');
    const fileInfo = document.querySelector('#file-info');
    const fileNameDisplay = document.querySelector('#file-name');
    const fileEditButton = document.querySelector('#file-edit-button');
    const constraintsInput = document.querySelector('#constraints');
    const autocompleteList = document.querySelector('#autocomplete-list');
    const dynamicFields = document.querySelector('#dynamic-fields');
    const addButton = document.querySelector('#add-button');
    const fieldsToEnable = document.querySelectorAll('.input-category');
    const rightCard = document.querySelector('#right-card');
    const javaOutputDisplay = document.querySelector('#java-output');
    const runButton = document.querySelector('#run-button');
    const exportJavaButton = document.querySelector('#export-java-button');
    const constraintsList = document.querySelector('#constraints-list');
    const variablesCard = document.querySelector('#variables-card');
    const constraintsCard = document.querySelector('#constraints-card');
    const resultsCard = document.querySelector('#results-card');
    const resultsList = document.querySelector('#results-list');
    const resultsTable = document.querySelector('#results-table');
    const resultsBody = document.querySelector('#results-body');
    const paginationControls = document.querySelector('#pagination-controls');
    const searchInput = document.querySelector('#search-input');
    const errorPopup = document.querySelector('#error-popup');
    const errorDetails = document.querySelector('#error-details');
    const closeErrorPopup = document.querySelector('#error-popup .close');
    const exportPopup = document.querySelector('#export-popup');
    const closeExportPopup = document.querySelector('#export-popup .close');
    const exportResultsButton = document.querySelector('#export-results-button');
    const exportConfirmButton = document.querySelector('#export-confirm-button');
    const advancedModeButton = document.querySelector('#advanced-mode-button');
    const constraintsWrapper = document.querySelector('#constraints-wrapper');
    const modelHeader = document.querySelector('#model-header');
    const modelDescription = document.querySelector('#model-description');
    const modelTypeDropdown = document.querySelector('#model-type');
    const chooseModelButton = document.querySelector('#choose-model-button');
    const databaseInfoCard = document.querySelector('#database-info-card');
    const databaseInfoDisplay = document.getElementById('database-info');
    const algorithmSpmf = document.getElementById('algorithm-dropdown-wrapper');
    const maxSolutionsSelect = document.querySelector('#max-solutions-select');
    const maxSolutionsInput = document.querySelector('#max-solutions-input');
    const itemEditInput = document.querySelector('#item-edit-input');
    const itemEditError = document.querySelector('#item-edit-error');
    let Nombredetrans = 0;
    let fileName = '';
    const timestamp = Date.now();
    let advancedModeEnabled = false;
    let functionDefs = [];
    let currentSignature = null;
    let submissions = {
        constraints: [],
        variables: [
            { name: 'database', type: 'TransactionalDatabase' },
            { name: 'freq', type: 'IntVar' },
            { name: 'length', type: 'IntVar' },
            { name: 'x', type: 'BoolVar[]' }
        ],
        algorithms: []
    };

    let currentSolutions = [];
    let initialSolutions = [];
    let currentSort = { column: null, direction: 'none' }; // 'asc' or 'desc'

    fileUploadButton.addEventListener('click', () => fileInput.click());

    function setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.classList.add('grayed-out');
        } else {
            element.classList.remove('loading');
            element.classList.remove('grayed-out');
        }
    }

    fileInput.addEventListener('change', async function () {
        if (fileInput.files.length > 0) {
            setLoading(rightCard, true);
            const originalFile = fileInput.files[0];

            const newFileName = `${timestamp}_${originalFile.name}`;

            fileName = newFileName;
            const newFile = new File([originalFile], newFileName, { type: originalFile.type });

            const formData = new FormData();
            formData.append('file', newFile);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const result = await response.json();
                    const fileName = newFile.name;
                    fieldsToEnable.forEach(field => field.removeAttribute('disabled'));
                    fieldsToEnable.forEach(field => field.classList.remove('bg-gray-200', 'text-gray-500'));
                    rightCard.classList.remove('bg-gray-200');
                    fileUploadButton.classList.add('hidden');
                    fileInfo.classList.remove('hidden');
                    fileNameDisplay.textContent = `File Uploaded: ${fileName}`;
                    variablesCard.style.display = 'block';
                    javaOutputDisplay.innerHTML = `
                                <div class="tooltip">freq: ${result.freq} <i class="fas fa-info-circle"></i><span class="tooltiptext">Frequency variable range</span></div><br>
                                <div class="tooltip">length: ${result.length} <i class="fas fa-info-circle"></i><span class="tooltiptext">Length variable range</span></div><br>
                                <div class="tooltip">BoolVar[] x = ${result.xValues}; <i class="fas fa-info-circle"></i><span class="tooltiptext">Boolean variables array</span></div>
                            `;
                    // Extraction of the number of transactions and items
                    let nbTransactions = result.freq.split('..').pop();
                    if (nbTransactions.includes(',')) {
                        // prend ce qui ya apres la virgule
                        nbTransactions = nbTransactions.split(',')[1];

                    }

                    Nombredetrans = nbTransactions;
                    const nbItems = result.length.split('..').pop();
                    databaseInfoDisplay.innerHTML = `
                                <div>Nb transactions: ${nbTransactions}</div>
                                <div>Nb items: ${nbItems}</div>
                            `;
                    databaseInfoCard.classList.remove('hidden');
                    javaOutputDisplay.classList.remove('hidden');
                    runButton.classList.remove('hidden');
                    exportJavaButton.classList.remove('hidden');
                    updateConstraintsList();
                    constraintsCard.style.display = 'block';
                    resultsCard.style.display = 'block';
                    modelTypeDropdown.removeAttribute('disabled'); // Enable model type dropdown
                    advancedModeButton.removeAttribute('disabled'); // Enable advanced mode button
                } else {
                    alert('Error uploading file');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error uploading file');
            } finally {
                setLoading(rightCard, false);
            }
        }
    });

    fileEditButton.addEventListener('click', () => {
        fileUploadButton.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        fileInput.click();
    });

    async function fetchAlgorithms() {
        try {
            const response = await fetch('/algospmf');
            if (!response.ok) {
                throw new Error('Failed to fetch algorithms');
            }
            const algorithms = await response.json();
            populateAlgorithmDropdown(algorithms);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function populateAlgorithmDropdown(algorithms) {
        algorithms.forEach(algorithm => {
            const option = document.createElement('option');

            option.textContent = algorithm.description;
            option.dataset.description = algorithm.description;
            option.dataset.params = algorithm.params;
            option.dataset.types = JSON.stringify(algorithm.types);
            option.dataset.desc_param = JSON.stringify(algorithm.decs_param);
            option.dataset.all_algo = JSON.stringify(algorithms);
            modelTypeDropdown.appendChild(option);
        });
    }

    modelTypeDropdown.addEventListener('change', function () {

        const selectedOption = modelTypeDropdown.options[modelTypeDropdown.selectedIndex];
        const paramsCount = selectedOption.dataset.params;
        const types = JSON.parse(selectedOption.dataset.types);

        const descriptions = JSON.parse(selectedOption.dataset.desc_param);
        const all_algo = JSON.parse(selectedOption.dataset.all_algo);
        generateDropdownChooseAlgo(all_algo, selectedOption.dataset.description);
        dynamicFields.innerHTML = ''; // Clear previous fields
        generateAlgorithmFields(paramsCount, types, descriptions);
        chooseModelButton.classList.remove('hidden');
    });

    function generateDropdownChooseAlgo(all_algo, description) {
        if (document.getElementById('algorithmSpmf') !== null) {
            document.getElementById('algorithmSpmf').remove();
            document.getElementById('label-algo').remove();
        }
        const select = document.createElement('select');
        select.id = 'algorithmSpmf';

        const label = document.createElement('label');
        label.classList.add('text-sm', 'font-medium', 'mt-4');
        label.textContent = 'Choose your algorithm:';
        label.id = 'label-algo';

        let isFirstOption = true; // Variable to track the first algorithm

        all_algo.forEach(algoObj => {
            if (algoObj.description === description) {
                algoObj.all_algo.forEach(algo => {
                    const option = document.createElement('option');
                    option.value = algo;
                    option.textContent = isFirstOption ? `${algo} (Default)` : algo;
                    isFirstOption = false; // After the first algorithm, set to false
                    select.appendChild(option);
                });
            }
        });

        select.classList.add('input-category', 'flex', 'h-10', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-gray-300', 'bg-white', 'px-3', 'py-2', 'text-sm', 'ring-offset-white', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'w-full', 'mb-2');

        algorithmSpmf.appendChild(label);
        algorithmSpmf.appendChild(select);
    }

    function generateAlgorithmFields(paramsCount, types, descriptions) {
        dynamicFields.innerHTML = '';
        for (let i = 0; i < paramsCount; i++) {
            const type = types[i];
            const desc = descriptions[i];
            const wrapper = document.createElement('div');
            wrapper.classList.add('relative', 'flex', 'flex-col', 'gap-2');

            const label = document.createElement('label');
            label.classList.add('text-sm', 'font-medium');
            label.textContent = `${desc} :`;

            const input = document.createElement('input');
            input.classList.add('input-category', 'flex', 'h-10', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-gray-300', 'bg-white', 'px-3', 'py-2', 'text-sm', 'ring-offset-white', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'w-full');
            input.placeholder = `Param ${i + 1} (${type})`;
            input.setAttribute('data-type', type);
            input.setAttribute('data-index', i);

            const errorMessage = document.createElement('div');
            errorMessage.classList.add('error-message', 'hidden');

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            wrapper.appendChild(errorMessage);
            dynamicFields.appendChild(wrapper);
        }
    }

    chooseModelButton.addEventListener('click', async function () {
        const selectedOption = modelTypeDropdown.options[modelTypeDropdown.selectedIndex];
        const algorithmName = document.getElementById('algorithmSpmf').value;
        let description = selectedOption.dataset.description;
        if (algorithmName.includes('(Default)')) {
            algorithmName = algorithmName.replace('(Default)', '');
        }

        const params = [];
        dynamicFields.querySelectorAll('input').forEach(input => {
            params.push({
                value: input.value,
                type: input.getAttribute('data-type'),
                desc: description
            });
        });
        if (submissions.algorithms.length > 0) {
            alert('Only one model can be selected at a time.');
            return;
        }
        try {
            const response = await fetch('/verifieParamsModele', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ algorithmName, params })
            });
            const result = await response.json();
            if (result.valid) {
                submissions.algorithms.push({
                    name: algorithmName,
                    values: params
                });
                updateConstraintsList();
                chooseModelButton.classList.add('hidden');
                modelTypeDropdown.selectedIndex = 0;
                dynamicFields.innerHTML = '';
                document.getElementById('algorithmSpmf').remove();
                document.getElementById('label-algo').remove();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error verifying model parameters');
        }
    });

    constraintsInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        showSuggestions(query);
    });

    constraintsInput.addEventListener('click', function () {
        const query = this.value.toLowerCase();
        showSuggestions(query);
    });

    function showSuggestions(query) {
        autocompleteList.innerHTML = '';

        if (!query) {
            query = '';
        }

        let matchedConstraints = functionDefs.filter(def => def.name.toLowerCase().startsWith(query));

        matchedConstraints.sort((a, b) => a.name.localeCompare(b.name));

        if (matchedConstraints.length === 0) {
            autocompleteList.innerHTML = '<div class="autocomplete-item">Unknown constraint</div>';
        } else {
            matchedConstraints.forEach(def => {
                def.signatures.forEach(signature => {
                    let item = document.createElement('div');
                    const paramsString = signature.types.join(', ');
                    item.innerHTML = `${def.name}(${paramsString})`;
                    item.classList.add('autocomplete-item');
                    item.addEventListener('click', function () {
                        constraintsInput.value = def.name;
                        currentSignature = signature;
                        generateDynamicFields(def, signature);
                        autocompleteList.innerHTML = '';
                    });
                    autocompleteList.appendChild(item);
                });
            });
        }
    }

    document.addEventListener('click', function (event) {
        if (!constraintsWrapper.contains(event.target)) {
            autocompleteList.innerHTML = '';
        }
    });

    async function fetchConstraints() {
        try {
            const response = await fetch('/constraints');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            functionDefs = await response.json();
        } catch (error) {
            console.error('Failed to fetch constraints:', error);
        }
    }

    function generateDynamicFields(def, signature) {
        dynamicFields.innerHTML = '';
        signature.types.forEach((type, index) => {
            let wrapper = document.createElement('div');
            wrapper.classList.add('relative');
            let input;
            if (type === 'operator') {
                input = document.createElement('select');
                input.classList.add('input-category', 'flex', 'h-10', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-gray-300', 'bg-white', 'px-3', 'py-2', 'text-sm', 'ring-offset-white', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'w-full', 'mb-2');
                ['<', '>', '!=', '>=', '<=', '='].forEach(op => {
                    const option = document.createElement('option');
                    option.value = op;
                    option.text = op;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.classList.add('input-category', 'flex', 'h-10', 'items-center', 'justify-between', 'rounded-md', 'border', 'border-gray-300', 'bg-white', 'px-3', 'py-2', 'text-sm', 'ring-offset-white', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'w-full', 'mb-2');

                input.placeholder = `Param ${index + 1} (${type})`;
                if (type === 'IntVar_Ou_Pourcentage') {
                    input.placeholder = `Param ${index + 1} (${type}) or Percentage <0-1>%`;
                }
                input.setAttribute('data-type', type);
                input.setAttribute('data-index', index);
                if (type === 'TransactionalDatabase') {
                    input.value = 'database';
                    input.setAttribute('disabled', true);
                } else {
                    input.addEventListener('focus', () => {
                        const matchingVars = submissions.variables.filter(variable => variable.type === type);
                        const suggestions = matchingVars.map(variable => variable.name);
                        let dataList = document.querySelector(`#suggestions-${index}`);
                        if (!dataList) {
                            dataList = document.createElement('div');
                            dataList.id = `suggestions-${index}`;
                            dataList.classList.add('autocomplete-items');
                            input.parentElement.appendChild(dataList);
                        }
                        dataList.innerHTML = '';
                        suggestions.forEach(suggestion => {
                            let option = document.createElement('div');
                            option.textContent = suggestion;
                            option.addEventListener('click', () => {
                                input.value = suggestion;
                                dataList.innerHTML = '';
                            });
                            dataList.appendChild(option);
                        });
                    });
                }
            }
            let errorMessage = document.createElement('div');
            errorMessage.classList.add('error-message', 'hidden');
            wrapper.appendChild(input);
            wrapper.appendChild(errorMessage);
            dynamicFields.appendChild(wrapper);
        });

        addButton.classList.remove('hidden');
        addButton.removeEventListener('click', validateAndSubmitConstraint);
        addButton.addEventListener('click', () => validateAndSubmitConstraint(def, currentSignature)); // Use the current signature
    }

    async function validateAndSubmitConstraint(def, signature) {
        let params = [];
        dynamicFields.querySelectorAll('.input-category').forEach(input => {
            if (!input.disabled) {
                params.push(input.value.trim());
            } else {
                params.push(input.value.trim());
            }
        });

        const constraintName = constraintsInput.value.trim();
        const paramsString = params.join(', ');
        const constraint = `${constraintName}(${paramsString})`;

        try {
            const response = await fetch('/verificationsConstraintes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ constraints: [{ text: constraint, signature }] })
            });

            const verifyResult = await response.json();

            if (verifyResult.valid) {
                // Avoid duplication
                if (!submissions.constraints.some(c => c.text === constraint)) {
                    submissions.constraints.push({ text: constraint, signature, enabled: true });
                    updateConstraintsList();
                }
                constraintsInput.value = '';
                dynamicFields.innerHTML = '';
                addButton.classList.add('hidden');
            } else {
                errorDetails.innerHTML = verifyResult.invalidConstraints.map(error =>
                    `<p>Constraint: ${error.constraint}<br>Message: ${error.message}</p>`
                ).join('');
                errorPopup.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error verifying constraint');
        }
    }

    function updateConstraintsList() {
        constraintsList.innerHTML = '';
        if (advancedModeEnabled) {
            if (submissions.constraints.length === 0) {
                constraintsList.textContent = "No constraints have been entered";
            } else {
                submissions.constraints.forEach((constraint, index) => {
                    let item = document.createElement('div');
                    item.classList.add('constraint-item', 'flex', 'justify-between', 'items-center', 'p-2', 'bg-gray-100', 'border', 'border-gray-300', 'rounded-md', 'mb-2');

                    if (!constraint.enabled) {
                        item.classList.add('disabled');
                    }

                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = constraint.enabled;
                    checkbox.classList.add('mr-2');
                    checkbox.addEventListener('change', function () {
                        constraint.enabled = checkbox.checked;
                        if (constraint.enabled) {
                            item.classList.remove('disabled');
                        } else {
                            item.classList.add('disabled');
                        }
                    });

                    let text = document.createElement('span');
                    text.textContent = constraint.text;
                    text.classList.add('mr-auto');

                    let upButton = document.createElement('button');
                    upButton.addEventListener('click', function () {
                        moveConstraintUp(index);
                    });

                    let downButton = document.createElement('button');
                    downButton.addEventListener('click', function () {
                        moveConstraintDown(index);
                    });

                    let editButton = document.createElement('button');
                    editButton.classList.add('edit-button', 'text-blue-500', 'hover:text-blue-700', 'mr-2');
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', function () {
                        editConstraint(index);
                    });

                    let deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-button', 'text-red-500', 'hover:text-red-700');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', function () {
                        deleteConstraint(index);
                    });

                    item.appendChild(checkbox);
                    item.appendChild(text);
                    item.appendChild(upButton);
                    item.appendChild(downButton);
                    item.appendChild(editButton);
                    item.appendChild(deleteButton);
                    constraintsList.appendChild(item);
                });
            }
        } else {
            constraintsCard.querySelector('h4').textContent = 'Selected Models';
            if (submissions.algorithms.length === 0) {
                constraintsList.textContent = "No model has been chosen";
            } else {
                submissions.algorithms.forEach((algorithm, index) => {
                    let item = document.createElement('div');
                    item.classList.add('constraint-item', 'flex', 'justify-between', 'items-center', 'p-2', 'bg-gray-100', 'border', 'border-gray-300', 'rounded-md', 'mb-2');

                    let text = document.createElement('span');
                    text.textContent = `${algorithm.name}: ${algorithm.values.map(v => v.value).join(', ')}`;
                    text.classList.add('mr-auto');

                    let editButton = document.createElement('button');
                    editButton.classList.add('edit-button', 'text-blue-500', 'hover:text-blue-700', 'mr-2');
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', function () {
                        editAlgorithm(index);
                    });

                    let deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-button', 'text-red-500', 'hover:text-red-700');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', function () {
                        deleteAlgorithm(index);
                    });

                    item.appendChild(text);
                    item.appendChild(editButton);
                    item.appendChild(deleteButton);
                    constraintsList.appendChild(item);
                });
            }
        }
    }

    function moveConstraintUp(index) {
        if (index > 0) {
            [submissions.constraints[index], submissions.constraints[index - 1]] = [submissions.constraints[index - 1], submissions.constraints[index]];
            updateConstraintsList();
        }
    }

    function moveConstraintDown(index) {
        if (index < submissions.constraints.length - 1) {
            [submissions.constraints[index], submissions.constraints[index + 1]] = [submissions.constraints[index + 1], submissions.constraints[index]];
            updateConstraintsList();
        }
    }

    window.editConstraint = function (index) {
        const constraint = submissions.constraints[index];
        const parts = constraint.text.match(/(\w+)\(([^)]+)\)/);
        if (parts && parts.length > 2) {
            const constraintName = parts[1];
            const params = parts[2].split(',').map(param => param.trim());
            constraintsInput.value = constraintName;
            const def = functionDefs.find(def => def.name === constraintName);
            if (def) {
                const signature = def.signatures.find(sig => sig.types.length === params.length);
                if (signature) {
                    currentSignature = signature;
                    generateDynamicFields(def, signature);
                    params.forEach((param, index) => {
                        const input = dynamicFields.querySelector(`[data-index="${index}"]`);
                        if (input) {
                            input.value = param;
                        }
                    });
                    submissions.constraints.splice(index, 1);
                    updateConstraintsList();
                }
            }
        }
    };

    window.editAlgorithm = function (index) {
        const algorithm = submissions.algorithms[index];
        modelTypeDropdown.value = algorithm.name;

        generateAlgorithmFields(algorithm.values.length, algorithm.values.map(v => v.type), algorithm.values.map(v => v.desc));
        algorithm.values.forEach((param, i) => {
            dynamicFields.querySelector(`[data-index="${i}"]`).value = param.value;
        });
        chooseModelButton.classList.remove('hidden');
        submissions.algorithms.splice(index, 1);
        updateConstraintsList();
    };

    window.deleteConstraint = function (index) {
        submissions.constraints.splice(index, 1);
        updateConstraintsList();
    };

    window.deleteAlgorithm = function (index) {
        submissions.algorithms.splice(index, 1);
        updateConstraintsList();
    };

    runButton.addEventListener('click', async function () {
        try {
            setLoading(runButton, true);
            setLoading(resultsCard, true);
            let maxSolutions;
            if (maxSolutionsSelect.value === 'infinite') {
                maxSolutions = 'infinite';
            } else {
                maxSolutions = maxSolutionsInput.value || 'infinite';
            }
            let payload;
            if (advancedModeEnabled) {
                payload = submissions.constraints.filter(constraint => constraint.enabled).map(constraint => ({ text: constraint.text, signature: constraint.signature, fileName: fileName }));
            } else {
                payload = submissions.algorithms.map(algorithm => ({
                    name: algorithm.name,
                    values: algorithm.values.map(v => v.value),
                    easyMode: true,
                    fileName: fileName
                }));
            }

            let pattern = itemEditInput.value;

            const response = await fetch('/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ constraints: payload, maxSolutions: maxSolutions, pattern })
            });
            if (response.ok) {
                const result = await response.json();
                displayResults(result);
                if (pattern) {
                    const firstSolution = result.solutions[0].solution[0];
                    if (!isNaN(firstSolution)) {
                        itemEditError.classList.remove('hidden');
                        itemEditInput.classList.add('border-red-500');
                    } else {
                        itemEditError.classList.add('hidden');
                        itemEditInput.classList.remove('border-red-500');
                    }
                }
            } else {
                const errorResponse = await response.text();
                alert(`Error running constraints: ${errorResponse}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error running constraints');
        } finally {
            setLoading(runButton, false);
            setLoading(resultsCard, false);
        }
    });

    exportJavaButton.addEventListener('click', function () {
        fetch('/exportJava', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName })
        })
            .then(response => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('Error exporting Java');
                }
            })
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${fileName}.java`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error exporting Java');
            });
    });

    closeErrorPopup.addEventListener('click', () => {
        errorPopup.style.display = 'none';
    });

    exportResultsButton.addEventListener('click', () => {
        if (currentSolutions.length > 0) {
            exportPopup.style.display = 'block';
        } else {
            alert('No results to export.');
        }
    });

    exportConfirmButton.addEventListener('click', () => {
        const withFilters = document.querySelector('input[name="export-filters"]:checked').value === 'with-filters';
        const format = document.querySelector('input[name="export-format"]:checked').value;
        exportResults(withFilters, format);
        exportPopup.style.display = 'none';
    });

    function displayResults(result) {
        currentSolutions = result.solutions;
        initialSolutions = [...result.solutions]; // Make a copy of the initial solutions
        updateTable();
        resultsCard.style.display = 'block';
        exportResultsButton.classList.remove('hidden');
    }

    function updateTable(page = 1) {
        resultsBody.innerHTML = '';

        let filteredSolutions = currentSolutions;

        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            const searchTerms = searchQuery.split(';').map(term => {
                const [termValue, column] = term.split(':').map(t => t.trim());
                return { termValue, column: column || null };
            });

            filteredSolutions = currentSolutions.filter(solution => {
                return searchTerms.every(({ termValue, column }) => {
                    const searchNumbers = termValue.replace(/\s+/g, '').split(',').map(Number);
                    if (column && solution[column] !== undefined) {
                        const solutionNumbers = solution[column].toString().replace(/\s+/g, '').split(',').map(Number);
                        return searchNumbers.every(num => solutionNumbers.includes(num));
                    }
                    return Object.values(solution).some(value => {
                        const solutionNumbers = value.toString().replace(/\s+/g, '').split(',').map(Number);
                        return searchNumbers.every(num => solutionNumbers.includes(num));
                    });
                });
            });
        }

        if (currentSort.column) {
            filteredSolutions.sort((a, b) => {
                if (currentSort.direction === 'asc') {
                    return a[currentSort.column] > b[currentSort.column] ? 1 : -1;
                } else if (currentSort.direction === 'desc') {
                    return a[currentSort.column] < b[currentSort.column] ? 1 : -1;
                } else {
                    return 0;
                }
            });
        }

        const pageSize = 25;
        const pageCount = Math.ceil(filteredSolutions.length / pageSize);
        const pageStart = (page - 1) * pageSize;
        const pageEnd = page * pageSize;

        filteredSolutions.slice(pageStart, pageEnd).forEach(solution => {
            const row = document.createElement('tr');
            let pourcentage = solution.freq / Nombredetrans * 100;
            // arrondie a la 3eme decimale
            pourcentage = Math.round(pourcentage * 1000) / 1000;
            row.innerHTML = `
                        
                        <td>${solution.solution}</td>
                        <td  class='text-center'>${solution.freq} (${pourcentage} %)</td>
                    `;
            resultsBody.appendChild(row);
        });

        paginationControls.innerHTML = '';
        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('mx-1', 'px-2', 'py-1', 'mb-1', 'rounded', 'bg-gray-200', 'hover:bg-gray-300');
            if (i === page) {
                pageButton.classList.add('bg-blue-500', 'text-white');
            }
            pageButton.addEventListener('click', () => {
                updateTable(i);
            });
            paginationControls.appendChild(pageButton);
        }
    }

    function toggleSort(column) {
        if (currentSort.column === column) {
            if (currentSort.direction === 'asc') {
                currentSort.direction = 'desc';
            } else if (currentSort.direction === 'desc') {
                currentSort.column = null;
                currentSort.direction = 'none';
                currentSolutions = [...initialSolutions]; // Reset to initial solutions
            } else {
                currentSort.direction = 'asc';
            }
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        updateTable();
    }

    function exportResults(withFilters, format) {
        let solutionsToExport = withFilters ? currentSolutions : initialSolutions;
        let data = 'Freq,Solution\n';
        solutionsToExport.forEach(solution => {
            data += `${solution.freq},"${solution.solution}"\n`;
        });

        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `results.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    async function sendSpmfToTraduction(algo) {
        try {
            console.log('Sending algo:', algo);
            console.log('With fileName:', fileName);

            const response = await fetch('/spmfToContraintes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ algo, fileName })
            });
            if (response.ok) {
                const result = await response.json();
                result.traductionEnContraintes.forEach(element => {
                    submissions.constraints.push({ text: element.text, signature: element.signature, enabled: true });
                });
                updateConstraintsList();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending algo to traduction');
        }
    }



    resultsTable.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
            toggleSort(th.dataset.column);
            th.style.color = currentSort.direction === 'asc' ? 'green' : (currentSort.direction === 'desc' ? 'red' : 'black');
        });
    });

    searchInput.addEventListener('input', () => updateTable());

    advancedModeButton.addEventListener('click', () => {
        constraintsWrapper.classList.toggle('hidden');
        modelTypeDropdown.parentElement.classList.toggle('hidden');
        if (dynamicFields.innerHTML !== '') {
            dynamicFields.innerHTML = '';
            chooseModelButton.classList.add('hidden');
        }

        if (!constraintsWrapper.classList.contains('hidden')) {
            chooseModelButton.classList.add('hidden');
            submissions.constraints = [];

            updateConstraintsList();
            constraintsList.innerHTML = '';
        }

        if (!advancedModeEnabled) {
            if (submissions.algorithms.length > 0) {
                sendSpmfToTraduction(submissions.algorithms[0]);
                submissions.algorithms = [];
            }
        }

        advancedModeEnabled = !advancedModeEnabled;

        if (constraintsWrapper.classList.contains('hidden')) {
            modelHeader.textContent = 'Choose Your Model';
            modelDescription.textContent = 'Define the parameters and constraints of your scientific model.';
            constraintsCard.querySelector('h4').textContent = 'Selected Models';

            addButton.classList.add('hidden');
        } else {
            modelHeader.textContent = 'Customize Your Model';
            modelDescription.textContent = 'Define the parameters and constraints for your scientific model.';
            constraintsCard.querySelector('h4').textContent = 'Constraints';
        }
        updateConstraintsList();
    });

    maxSolutionsSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            maxSolutionsInput.classList.remove('hidden');
        } else {
            maxSolutionsInput.classList.add('hidden');
            maxSolutionsInput.value = '';
        }
    });

    function exportResults(withFilters, format) {
        let solutionsToExport = withFilters ? currentSolutions : initialSolutions;
        let data = 'Freq,Solution\n';
        solutionsToExport.forEach(solution => {
            data += `${solution.freq},"${solution.solution}"\n`;
        });

        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `results.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    fetchAlgorithms();
    fetchConstraints();
});
