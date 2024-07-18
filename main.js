'use strict'

import { loadThemeFromLocalStorage, toggleTheme } from "./darkMode.js";

const host = 'api.frankfurter.app';
// const url = `https://${host}/latest`;
const url = `https://${host}/`;

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

const DEBOUNCE_TIME = 400;

getCurrenciesFromAPI();

SELECT_CURRENCY_LEFT.addEventListener('change', ($event) => {
    // console.log($event.target.value);
    // console.log(SELECT_CURRENCY_LEFT.value);
    currencyLeft = SELECT_CURRENCY_LEFT.value;
    whoAmI = 'currencyLeft';
    valueLeft = INPUT_CURRENCY_LEFT.value;
    updateSelectState();
    urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
});

SELECT_CURRENCY_RIGHT.addEventListener('change', ($event) => {
    // console.log($event.target.id);
    currencyRight = SELECT_CURRENCY_RIGHT.value;
    whoAmI = 'currencyRight';
    valueRight = INPUT_CURRENCY_RIGHT.value;
    updateSelectState();
    urlParamValidator(whoAmI, currencyLeft, currencyRight, valueLeft, valueRight);
});

INPUT_CURRENCY_LEFT.addEventListener('input', ($event) => {
    // console.log($event.target.value);
    // console.log(INPUT_CURRENCY_LEFT.value);
    if (inputValidator(INPUT_CURRENCY_LEFT.value)) {
        console.log(`Input left valid`);
        valueLeft = INPUT_CURRENCY_LEFT.value;
        console.log(valueLeft);
        whoAmI = 'valueLeft';
        debounceInputs();
    } else {
        INPUT_CURRENCY_LEFT.value = '';
        INPUT_CURRENCY_RIGHT.value = '';
        valueLeft = INPUT_CURRENCY_LEFT.value;
        valueRight = INPUT_CURRENCY_RIGHT.value;
        return;
    };

});

INPUT_CURRENCY_RIGHT.addEventListener('input', ($event) => {
    // console.log($event.target.id);
    // console.log(INPUT_CURRENCY_RIGHT.value);
    if (inputValidator(INPUT_CURRENCY_RIGHT.value)) {
        console.log(`Input right valid`);
        valueRight = INPUT_CURRENCY_RIGHT.value;
        whoAmI = 'valueRight';
        debounceInputs();
    } else {
        INPUT_CURRENCY_LEFT.value = '';
        INPUT_CURRENCY_RIGHT.value = '';
        valueLeft = INPUT_CURRENCY_LEFT.value;
        valueRight = INPUT_CURRENCY_RIGHT.value;
        return;
    };
});

function inputValidator(input) {

    if (input <= 0 || isNaN(input) || input === undefined) {

        return false;
    }
    else {

        return true;
    };
}

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
let lastFrom;
let lastTo;

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

    urlBuilder = `${url}latest?amount=${amount}&from=${from}&to=${to}`;

    console.log(urlBuilder);

    clearTimeout(timeoutId);

    // debounce calls to API
    timeoutId = setTimeout(() => {
        console.log(lastFrom, lastTo);
        if (lastFrom === from && lastTo === to) {
            console.log('Only callAPI()');
            callAPI(urlBuilder);
        }
        else {
            console.log('All APIs called');
            lastFrom = from;
            lastTo = to;
            callAPI(urlBuilder);
            getLast5DaysCurrencyRates(from, to);
            popularConversions(from, to);
        }

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

async function getLast5DaysCurrencyRates(from, to) {
    const today = new Date();
    today.setDate(today.getDate() - 5);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    // console.log(formattedDate);
    console.log(`${url}${formattedDate}..?&from=${from}&to=${to}`); // Outputs: yyyy-mm-dd

    const queryDate = `${url}${formattedDate}..?&from=${from}&to=${to}`;

    try {
        const data = await fetch(queryDate);
        const dateObj = await data.json();
        chartStager(dateObj);
    } catch (error) {
        console.log(error);
    }
}

function chartStager(datesObj) {
    // console.log(datesObj);
    const ratesObj = datesObj.rates;
    let newObj = {};

    for (let dateKey in ratesObj) {
        // console.log(dateKey);
        // console.log(ratesObj[dateKey]);

        const currencyObj = ratesObj[dateKey];

        for (let currency in currencyObj) {
            // console.log(currencyObj[currency]);
            newObj[dateKey] = currencyObj[currency];
        }
    }

    // console.log(newObj);
    charter(newObj);
    chartTablePopulator(newObj);
}

function charter(newObj) {
    const ctx = document.getElementById('myChart').getContext('2d');

    const dateLabelArray = [];
    const rateDataArray = [];

    for (const [date, rate] of Object.entries(newObj)) {
        dateLabelArray.push(date);
        rateDataArray.push(rate);
    }

    let chartStatus = Chart.getChart("myChart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }



    // console.log(dateLabelArray);
    // console.log(rateDataArray);

    const isDarkTheme = document.body.classList.contains('dark');
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    const tickColor = isDarkTheme ? 'rgba(255, 255, 255, 1)' : 'rgba(70, 70, 70, 1)';
    const pointBackgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    const borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabelArray,
            datasets: [{
                label: '',
                data: rateDataArray,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                pointBackgroundColor: pointBackgroundColor,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false // Hide the legend
                },
                title: {
                    display: false // Hide the title
                },
            },
            scales: {
                x: {

                    ticks: {
                        color: tickColor
                    },
                    grid: {
                        color: gridColor
                    },
                    display: false
                },
                y: {

                    ticks: {
                        color: tickColor,
                        font: {
                            size: 14 // Font size for x-axis labels
                        }
                    },
                    grid: {
                        color: gridColor
                    },
                    beginAtZero: false
                }
            },

            animation: {
                duration: 1000, // Duration of the animation
                easing: 'easeOutElastic', // Linear easing for smooth transition
            },
        }
    });


}

function chartTablePopulator(newObj) {
    document.getElementById('side_container_2').innerHTML = '';
    const tableFragment = document.createDocumentFragment();
    let table = document.createElement('table');
    let th = document.createElement('th');
    th.textContent = 'Date';
    let th2 = document.createElement('th');
    th2.textContent = `1 ${currencyLeft} to ${currencyRight}`;

    for (const [date, rate] of Object.entries(newObj)) {
        // console.log(date);
        // console.log(rate);
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td');
        const tdRate = document.createElement('td');
        tdDate.textContent = date;
        tdRate.textContent = rate;
        tr.appendChild(tdDate);
        tr.appendChild(tdRate);
        tableFragment.appendChild(tr);
    }

    table.appendChild(th);
    table.appendChild(th2);
    table.appendChild(tableFragment);

    document.getElementById('side_container_2').appendChild(table);

}

async function popularConversions(from, to) {
    const popConvArr = [5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
    console.log(popConvArr.length);

    let popConversionsObjRight = {};
    let popConversionsObjLeft = {};

    let fetchRightConversions = [];
    let fetchLeftConversions = [];

    for (const amount of popConvArr) {
        fetchRightConversions.push(fetch(`${url}latest?amount=${amount}&from=${from}&to=${to}`));
        fetchLeftConversions.push(fetch(`${url}latest?amount=${amount}&from=${to}&to=${from}`));
    }

    const rightResponses = await Promise.all(fetchRightConversions);
    const leftResponses = await Promise.all(fetchLeftConversions);

    for (const response of rightResponses) {
        const dataObj = await response.json();
        popConversionsObjRight[dataObj.amount] = dataObj.rates[to];
    }

    // console.log('Right:', popConversionsObjRight);
    popularTablePopulator(popConversionsObjRight, 'Right')

    for (const response of leftResponses) {
        const dataObj = await response.json();
        popConversionsObjLeft[dataObj.amount] = dataObj.rates[from];
    }

    // console.log('Left:', popConversionsObjLeft);
    popularTablePopulator(popConversionsObjLeft, 'Left');
}

function popularTablePopulator(popularConversionsObj, caller) {
    if (caller === 'Left') {
        document.getElementById('pop_tables_left').innerHTML = '';
        const tableFragment = document.createDocumentFragment();
        let label = document.createElement('div');
        label.className = 'table-label';
        label.textContent = `Popular ${currencyRight} to ${currencyLeft} conversions`;
        let table = document.createElement('table');
        let th = document.createElement('th');
        th.textContent = `${currencyRight}`;
        let th2 = document.createElement('th');
        th2.textContent = `${currencyLeft}`;

        for (const [staticAmount, gottenAmount] of Object.entries(popularConversionsObj)) {
            // console.log(staticAmount);
            // console.log(gottenAmount);
            const tr = document.createElement('tr');
            const tdStaticAmount = document.createElement('td');
            const tdGottenAmount = document.createElement('td');
            tdStaticAmount.textContent = staticAmount;
            tdGottenAmount.textContent = gottenAmount;
            tr.appendChild(tdStaticAmount);
            tr.appendChild(tdGottenAmount);
            tableFragment.appendChild(tr);
        }

        table.appendChild(th);
        table.appendChild(th2);
        table.appendChild(tableFragment);

        document.getElementById('pop_tables_left').appendChild(table);
        document.getElementById('pop_tables_left').insertAdjacentElement("afterbegin", label);
    }

    if (caller === 'Right') {
        document.getElementById('pop_tables_right').innerHTML = '';
        const tableFragment = document.createDocumentFragment();
        let label = document.createElement('div');
        label.className = 'table-label';
        label.textContent = `Popular ${currencyLeft} to ${currencyRight} conversions`;
        let table = document.createElement('table');
        let th = document.createElement('th');
        th.textContent = `${currencyLeft}`;
        let th2 = document.createElement('th');
        th2.textContent = `${currencyRight}`;

        for (const [staticAmount, gottenAmount] of Object.entries(popularConversionsObj)) {
            // console.log(staticAmount);
            // console.log(gottenAmount);
            const tr = document.createElement('tr');
            const tdStaticAmount = document.createElement('td');
            const tdGottenAmount = document.createElement('td');
            tdStaticAmount.textContent = staticAmount;
            tdGottenAmount.textContent = gottenAmount;
            tr.appendChild(tdStaticAmount);
            tr.appendChild(tdGottenAmount);
            tableFragment.appendChild(tr);
        }

        table.appendChild(th);
        table.appendChild(th2);
        table.appendChild(tableFragment);

        document.getElementById('pop_tables_right').appendChild(table);
        document.getElementById('pop_tables_right').insertAdjacentElement("afterbegin", label);
    }

    const tableLabel = [...document.getElementsByClassName('table-label')];
    tableLabel.forEach(element => {
        element.style.textAlign = 'center';
        element.style.fontSize = '1.125rem';
        element.style.fontWeight = 'bold';
        element.style.marginBottom = '10px';
    });

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
        location.replace(location.href);
    });
}
