'use strict'

import { loadThemeFromLocalStorage, toggleTheme } from "./darkMode.js";

const host = 'api.frankfurter.app';
const url = `https://${host}/latest`;

const SELECT_CURRENCY_LEFT = document.getElementById('select_currency_left');
const SELECT_CURRENCY_RIGHT = document.getElementById('select_currency_right');
const INPUT_CURRENCY_LEFT = document.getElementById('input_currency_left');
const INPUT_CURRENCY_RIGHT = document.getElementById('input_currency_right');

let currencyLeft = SELECT_CURRENCY_LEFT.value;
let currencyRight = SELECT_CURRENCY_RIGHT.value;
let valueLeft = INPUT_CURRENCY_LEFT.value || 1;
let valueRight = INPUT_CURRENCY_RIGHT.value || 1;

let currencyRecieved = '';
let whoAmI = 'valueLeft';
let selectTimeoutId;

const DEBOUNCE_TIME = 500;

getCurrenciesFromAPI();

SELECT_CURRENCY_LEFT.addEventListener('change', ($event) => {
    // console.log($event.target.value);
    // console.log(SELECT_CURRENCY_LEFT.value);
    currencyLeft = SELECT_CURRENCY_LEFT.value;
    whoAmI = 'currencyLeft';
    valueLeft = INPUT_CURRENCY_LEFT.value;
    updateSelectState();
    // buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);

});

SELECT_CURRENCY_RIGHT.addEventListener('change', ($event) => {
    // console.log($event.target.id);
    currencyRight = SELECT_CURRENCY_RIGHT.value;
    whoAmI = 'currencyRight';
    valueRight = INPUT_CURRENCY_RIGHT.value;
    updateSelectState();
    // buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
});

INPUT_CURRENCY_LEFT.addEventListener('input', ($event) => {
    // console.log($event.target.value);
    // console.log(INPUT_CURRENCY_LEFT.value);
    valueLeft = INPUT_CURRENCY_LEFT.value;
    console.log(valueLeft);
    whoAmI = 'valueLeft';
    // buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    debounceInputs();
});

INPUT_CURRENCY_RIGHT.addEventListener('input', ($event) => {
    // console.log($event.target.id);
    // console.log(INPUT_CURRENCY_RIGHT.value);
    valueRight = INPUT_CURRENCY_RIGHT.value;
    whoAmI = 'valueRight';
    // buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    debounceInputs();
});

function getCurrenciesFromAPI() {
    const urlCurrencies = `https://${host}/currencies`;

    fetch(urlCurrencies)
        .then((data) => data.json())
        .then((currencies) => populateSelectDropdownOptions(currencies))
        .catch((error) => console.error(error));
}

function populateSelectDropdownOptions(currencies) {
    // Create fragments to avoid constant DOM repaints
    let leftOptionsFragment = document.createDocumentFragment();
    let rightOptionsFragment = document.createDocumentFragment();

    // Loop through every currency recieved
    for (const currency in currencies) {
        //create option element for both left and right selects
        let optionElementLeft = document.createElement('option');
        let optionElementRight = document.createElement('option');

        // Set the option value and text then append it to respective fragments
        optionElementLeft.value = currency;
        optionElementLeft.textContent = currencies[currency];
        leftOptionsFragment.appendChild(optionElementLeft);

        optionElementRight.value = currency;
        optionElementRight.textContent = currencies[currency];
        rightOptionsFragment.appendChild(optionElementRight);
    }

    // Clear any option elements if exist inside select tags
    SELECT_CURRENCY_LEFT.innerHTML = '';
    SELECT_CURRENCY_RIGHT.innerHTML = '';

    // Append the fragments under respective selects
    SELECT_CURRENCY_LEFT.appendChild(leftOptionsFragment);
    SELECT_CURRENCY_RIGHT.appendChild(rightOptionsFragment);

    updateSelectState();
}

function updateSelectState() {

    // Array of all options in left select
    let optionLeftArray = Array.from(SELECT_CURRENCY_LEFT.querySelectorAll(`option[value]`));

    // Handle the case where both selects have the same value initially
    if (SELECT_CURRENCY_LEFT.value === SELECT_CURRENCY_RIGHT.value) {
        // Find the next available option in the left select
        const nextOptionLeft = optionLeftArray.find(option => option.value !== SELECT_CURRENCY_LEFT.value);
        if (nextOptionLeft) {
            nextOptionLeft.selected = true;
            SELECT_CURRENCY_LEFT.value = nextOptionLeft.value;
        }
    }

    // Loop through all options in left select
    optionLeftArray.forEach(option => {
        option.disabled = false;
        option.selected = option.value === SELECT_CURRENCY_LEFT.value;
        if (option.value === SELECT_CURRENCY_RIGHT.value) {
            option.disabled = true;
        }
    });

    // Array of all options in right select
    let optionRightArray = Array.from(SELECT_CURRENCY_RIGHT.querySelectorAll(`option[value]`));

    // Loop through all options in right select
    optionRightArray.forEach(option => {
        option.disabled = false;
        option.selected = option.value === SELECT_CURRENCY_RIGHT.value;
        if (option.value === SELECT_CURRENCY_LEFT.value) {
            option.disabled = true;
        }
    });

    //Initial app load, convert default value in left select
    if (currencyLeft === '' || currencyRight === '') {
        currencyLeft = SELECT_CURRENCY_LEFT.value;
        currencyRight = SELECT_CURRENCY_RIGHT.value;
        buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    }


}

const swapBtn = document.getElementById('swap-btn');
swapBtn.addEventListener('click', currencySwap);

function currencySwap() {
    whoAmI = 'valueLeft';
    currencyRight = SELECT_CURRENCY_LEFT.value;
    currencyLeft = SELECT_CURRENCY_RIGHT.value;

    console.log(`currencyRight is ${currencyRight}`);
    console.log(`currencyLeft is ${currencyLeft}`);
    console.log(`valueLeft is ${valueLeft}`);

    SELECT_CURRENCY_LEFT.value = currencyLeft;
    SELECT_CURRENCY_RIGHT.value = currencyRight

    updateSelectState();

    urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);

}

function debounceInputs() {
    clearTimeout(selectTimeoutId);

    selectTimeoutId = setTimeout(() => {
        urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    }, DEBOUNCE_TIME)
}

let isInputDirty = false;
function urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight) {
    console.log(`isInputDirty : ${isInputDirty}`);
    const isValueLeftInvalid = valueLeft === '' || isNaN(valueLeft) || Number(valueLeft) <= 0;
    const isValueRightInvalid = valueRight === '' || isNaN(valueRight) || Number(valueRight) <= 0;

    console.log(`isValueLeftInvalid is ${isValueLeftInvalid}`);
    console.log(`isValueRightInvalid is ${isValueRightInvalid}`);

    if (isValueLeftInvalid) {
        console.log('Skipping API call for valueLeft');
        isInputDirty = true;
        if (whoAmI === 'valueLeft') {
            INPUT_CURRENCY_RIGHT.value = '';
            return;
        }


    }
    if (isValueRightInvalid) {
        console.log('Skipping API call for valueRight');
        isInputDirty = true;
        if (whoAmI === 'valueRight') {
            INPUT_CURRENCY_LEFT.value = '';
            return;
        }
    }
    if (isValueLeftInvalid && isValueRightInvalid) {
        console.log('Both values are invalid, skipping API call');
        return;
    }

    // When left value is invalid and right value is valid
    if (isValueLeftInvalid && !isValueRightInvalid) {
        console.log('valueLeft empty; valueRight populated');
        buildUrl('valueRight', currencyLeft, currencyRight, valueLeft, valueRight);
        return;
    }

    // When right value is invalid and left value is valid
    if (!isValueLeftInvalid && isValueRightInvalid) {
        console.log('valueRight empty; valueLeft populated');
        buildUrl('valueLeft', currencyLeft, currencyRight, valueLeft, valueRight);
        return;
    }

    // When both values are valid
    if (!isValueLeftInvalid && !isValueRightInvalid) {
        console.log('Both values are valid');
        buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
    }

}

let timeoutId;

function buildUrl(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight) {
    let urlBuilder;
    let amount, from, to;

    if (whoAmI === 'valueLeft' || whoAmI === 'currencyLeft') {
        console.log(`1`);
        amount = valueLeft;
        from = currencyLeft;
        to = currencyRight;
        currencyRecieved = currencyRight;
    } else if (whoAmI === 'currencyRight') {
        console.log(`2`);
        amount = valueLeft;
        from = currencyLeft;
        to = currencyRight;
        currencyRecieved = currencyRight;

    } else if (whoAmI === 'valueRight') {
        console.log(`3`);
        amount = valueRight;
        from = currencyRight;
        to = currencyLeft;
        currencyRecieved = currencyLeft;

    }
    else {
        console.error('Something went wrong!');
        return;
    }

    urlBuilder = `${url}?amount=${amount}&from=${from}&to=${to}`;
    console.log(urlBuilder);

    clearTimeout(timeoutId);

    // debounce calls to API
    timeoutId = setTimeout(() => {
        callAPI(urlBuilder);
    }, DEBOUNCE_TIME);
}

function callAPI(urlBuilder) {
    fetch(`${urlBuilder}`)
        .then(data => data.json())
        .then(parsedData => dataParserAPI(parsedData))
        .catch(error => console.error(`Error catching data: ${error}`));
}

function dataParserAPI(dataFromAPI) {
    const ratesObj = dataFromAPI.rates;
    const currentRate = ratesObj[currencyRecieved];
    console.log(`currency converted to ${currencyRecieved}: ${currentRate}`);

    render(currentRate, currencyRecieved);
}

function render(currentRate, currencyRecieved) {
    if (currencyRecieved === currencyLeft) {
        INPUT_CURRENCY_LEFT.value = currentRate;
    }
    else if (currencyRecieved === currencyRight) {
        INPUT_CURRENCY_RIGHT.value = currentRate;
    }
    else console.error(`Something went wrong!`);
}

//Enable dark mode
loadThemeFromLocalStorage();
const body = document.body;
const themeToggleCheckbox = document.getElementById('themeToggle');
if (body.classList.contains('dark')) {
    themeToggleCheckbox.checked = true;
}
const themeToggleButton = document.getElementById('themeToggle');
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        toggleTheme();
    });
}