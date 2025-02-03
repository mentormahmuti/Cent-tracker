'use strict';

const expenseForm = document.getElementById('expense-form');
const expenseInput = document.getElementById('expense-input');
const costInput = document.getElementById('cost-input');
const tableBody = document.getElementById('table-body');
const totalAmountSpent = document.getElementById('total-amount');
const modal = document.querySelector('.modal_section');
const modal2 = document.querySelector('.modal2_section');

function displayItems() {
  const itemsFromStorage = getItemsFromStorage();

  const readyForUseItemsFromStorage = itemsFromStorage
    .map((obj) => Object.values(obj))
    .map((array) =>
      array.map((element, index) => {
        return index === 1 ? `$${element}` : element;
      })
    );

  readyForUseItemsFromStorage.forEach((item) => createExpenseRows(item));
  calculateTotalDynamically();
}

function addNewExpense(e) {
  e.preventDefault();

  const newItem = expenseInput.value;
  const costOfNewItem = `$${costInput.value}`;
  const currentTime = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!inputValidator(newItem, costInput)) {
    return;
  }
  const values = [newItem, costOfNewItem, currentTime];

  createExpenseRows(values);
  calculateTotalDynamically();
  addItemsToLocalStorage();
  resetInputValuesAfterUserSubmits();
}

function inputValidator(name, cost) {
  if (name === '' || name.length > 25) {
    alert('Your item must contain 1 to 25 characters!');
    return false;
  } else if (Number(cost.value < 0)) {
    alert('You can only add positive integers.');
    return false;
  } else if (Number(cost.value > 100000)) {
    alert('So you rich?');
    return false;
  }
  return true;
}

let dataFromNewRow; //I will use it to collect data for every row created!
function createExpenseRows(values) {
  const newRow = document.createElement('tr');
  newRow.classList.add('table-item');

  values.forEach((value, index) => {
    const newTD = document.createElement('td');
    newTD.textContent = value;

    if (index === 1) {
      newTD.classList.add('cost-data');
    }

    newRow.append(newTD);

    dataFromNewRow = newRow;
  });

  const editDelete = document.createElement('td');
  editDelete.append(createEditDeleteButtons());
  newRow.appendChild(editDelete);

  tableBody.appendChild(newRow);
}

function calculateTotalDynamically() {
  //Updated DOM to show TOTAL
  const costData = document.querySelectorAll('.cost-data');

  if (costData.length === 0) {
    totalAmountSpent.innerText = ` $0`;
    return;
  }

  function cleanData() {
    const cleanedCostData = Array.from(costData)
      .map((item) => {
        return item.innerText;
      })
      .map((item) => {
        return item.replace(/[^0-9.]/g, '');
      })
      .map((item) => {
        return Number(item);
      })
      .reduce((acc, price) => {
        return acc + price;
      });

    return cleanedCostData;
  }

  totalAmountSpent.innerText = ` $${String(cleanData())}`;
}

function createEditDeleteButtons() {
  //Create icons for edit and delete
  function createIcon(classes) {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
  }

  //Create edit button
  function createEditBtn(classes) {
    const btn = document.createElement('button');
    btn.classList.add(...classes.split(' '));
    btn.appendChild(document.createTextNode('Edit '));
    btn.appendChild(createIcon('fa-solid fa-pen'));
    return btn;
  }

  //Create delete button
  function createDeleteBtn(classes) {
    const btn = document.createElement('button');
    btn.classList.add(...classes.split(' '));
    btn.appendChild(document.createTextNode('Delete '));
    btn.appendChild(createIcon('fa-solid fa-trash'));

    return btn;
  }

  const newEditButton = createEditBtn('btn edit-btn');
  const newDeleteButton = createDeleteBtn('btn delete-btn');

  const newEditDeleteDiv = document.createElement('div');
  newEditDeleteDiv.classList.add('edit-delete-buttons');

  newEditDeleteDiv.append(newEditButton, newDeleteButton);

  return newEditDeleteDiv;
}

// Add data to local storage
function addItemsToLocalStorage() {
  function parseItemsForStorage() {
    const cells = dataFromNewRow.querySelectorAll('td');

    const expenseObject = {
      name: cells[0].textContent,
      cost: cells[1].textContent.replace(/\$/g, ''),
      date: cells[2].textContent,
    };
    return expenseObject;
  }
  // Add data to local storage
  function addNewItemsToLocalStorage() {
    const itemsFromStorage = getItemsFromStorage();

    const itemReadyForStorage = parseItemsForStorage();

    itemsFromStorage.push(itemReadyForStorage);

    localStorage.setItem('expenses', JSON.stringify(itemsFromStorage));
  }
  addNewItemsToLocalStorage();
}

function getItemsFromStorage() {
  let itemsFromStorage;

  if (localStorage.getItem('expenses') === null) {
    itemsFromStorage = [];
  } else {
    itemsFromStorage = JSON.parse(localStorage.getItem('expenses'));
  }

  return itemsFromStorage;
}

function resetInputValuesAfterUserSubmits() {
  expenseInput.value = '';
  costInput.value = '';
  expenseInput.placeholder = 'What did you spend on?';
  costInput.placeholder = 'Amount spent?';
}

//Handle deleting certain items
let itemToDelete = null;
function handleItemDeletion(e) {
  if (
    e.target.classList.contains('delete-btn') ||
    e.target.classList.contains('fa-trash')
  ) {
    itemToDelete = e.target.closest('tr');
    modal.style.display = 'block';
    modal.style.opacity = '1';
  }
  if (e.target.classList.contains('no_btn')) {
    fadeOutModal(modal);
  }
  if (e.target.classList.contains('yes_btn') && itemToDelete) {
    itemToDelete.remove();
    fadeOutModal(modal);
    calculateTotalDynamically();

    //  Step 2: Remove from local storage
    const itemsFromStorage = getItemsFromStorage();

    // Step 3: Find the index of the item to delete in localStorage
    const itemName = itemToDelete.querySelector('td:nth-child(1)').textContent;
    const itemCost = itemToDelete
      .querySelector('td:nth-child(2)')
      .textContent.replace('$', '');
    const itemDate = itemToDelete.querySelector('td:nth-child(3)').textContent;

    const indexOfItemToBeDeleted = itemsFromStorage.findIndex(
      (item) =>
        item.name === itemName &&
        item.cost === itemCost &&
        item.date === itemDate
    );

    if (indexOfItemToBeDeleted !== -1) {
      // Step 4: Remove the item from the array
      itemsFromStorage.splice(indexOfItemToBeDeleted, 1);

      // Step 5: Update the local storage
      localStorage.setItem('expenses', JSON.stringify(itemsFromStorage));
    }
  }
}

function fadeOutModal(element) {
  let opacity = 1;

  function fade() {
    opacity -= 0.05;
    element.style.opacity = opacity;

    if (opacity > 0) {
      requestAnimationFrame(fade);
    } else {
      element.style.display = 'none';
    }
  }
  fade();
}

//Handle item editing
let itemToEdit = null;
function handleEditClick(e) {
  if (
    e.target.classList.contains('edit-btn') ||
    e.target.classList.contains('fa-pen')
  ) {
    itemToEdit = e.target.closest('tr');
    const currentName = itemToEdit.cells[0].textContent;
    const currentCost = itemToEdit.cells[1].textContent.replace(/[^\d.-]/g, ''); // Remove non-numeric characters like '$'
    const currentDate = itemToEdit.cells[2].textContent;

    // Move data to input fields
    expenseInput.value = currentName;
    costInput.value = Number(currentCost);

    // Remove the item from the table
    itemToEdit.remove();
    calculateTotalDynamically();

    // Remove the item from local storage (treat edit as deletion)
    const itemsFromStorage = getItemsFromStorage();
    const indexOfItemToDelete = itemsFromStorage.findIndex(
      (item) =>
        item.name === currentName &&
        item.cost === currentCost &&
        item.date === currentDate
    );

    // If the item is found, remove it
    if (indexOfItemToDelete !== -1) {
      itemsFromStorage.splice(indexOfItemToDelete, 1); // Remove the item
      localStorage.setItem('expenses', JSON.stringify(itemsFromStorage)); // Save the updated array to localStorage
    }

    // Add animation for visual feedback
    expenseInput.classList.add('highlight');
    costInput.classList.add('highlight');

    setTimeout(() => {
      expenseInput.classList.remove('highlight');
      costInput.classList.remove('highlight');
    }, 500);
  }
}

function handleDeleteAllItems(e) {
  const table = document.querySelector('table');
  const tbody = table.querySelector('tbody');

  if (tbody.innerHTML.trim() === '') {
    return;
  }
  if (e.target.classList.contains('no_delete_nothing')) {
    fadeOutModal(modal2);
  }

  if (
    e.target.classList.contains('clear-all-btn') ||
    e.target.classList.contains('fa-trash-can')
  ) {
    modal2.style.display = 'block';
    modal2.style.opacity = '1';
  }
  if (e.target.classList.contains('yes_delete_all')) {
    tbody.innerHTML = '';
    fadeOutModal(modal2);
    localStorage.clear();
    calculateTotalDynamically();
  }
}

expenseForm.addEventListener('submit', addNewExpense);
document.body.addEventListener('click', handleEditClick);
document.body.addEventListener('click', handleItemDeletion);
document.body.addEventListener('click', handleDeleteAllItems);

document.addEventListener('DOMContentLoaded', displayItems);
