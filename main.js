let myLibrary = [];

function Book(title, author, pages, read = false) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

Book.prototype.info = function() {
  const infoStr = this.title + ' by ' + this.author + ', ' + this.pages + ', ';
  return infoStr + (this.read ? 'read' : 'not read yet');
};

// INIT
getLibraryFromLocal();
render();

// ELEMENT SELECTORS
const containerElement = document.querySelector('.container');
const modalElement = document.querySelector('.modal');
const addBtn = document.querySelector('[data-type="add"]');
const cancelBtn = document.querySelector('[data-type="cancel"]');
const formElement = document.querySelector('form');
const titleField = document.querySelector('input[name="title"]');
const authorField = document.querySelector('input[name="author"]');
const pagesField = document.querySelector('input[name="pages"]');
const readOptions = document.querySelectorAll('input[name="read"]');

// EVENT LISTENERS
addBtn.addEventListener('click', handleAddClick);
cancelBtn.addEventListener('click', handleCancelClick);
formElement.addEventListener('submit', handleFormSubmit);
document.body.addEventListener('click', handleModalHide);

// EVENT HANDLERS
function handleModalHide (e) {
  if ([...e.target.classList].includes('modal')) {
    hideModal();
  }
}

function handleRemove(e) {
  const book = e.target.parentElement.parentElement;
  const bookId = Number(book.dataset.id);
  removeBook(bookId);
  render();
}

function handleToggle(e) {
  const book = e.target.parentElement.parentElement;
  const bookId = Number(book.dataset.id);
  const newStatus = changeReadStatus(bookId);
  if (newStatus) {
    book.classList.add('read');
    book.classList.remove('unread');
  } else {
    book.classList.add('unread');
    book.classList.remove('read');
  }
  render();
}

function handleAddClick() {
  modalElement.style.display = 'block'
  titleField.focus();
}

function handleCancelClick(e) {
  e.preventDefault();
  hideModal();
}

function handleFormSubmit(e) {
  e.preventDefault();
  const read = ([...readOptions].reduce(optionReducer)) === true;
  const error = checkForError(titleField, authorField, pagesField);
  if (!error) {
    addBookToLibrary
    (
      titleField.value,
      authorField.value,
      Number(pagesField.value),
      read
    );
    clearFields(titleField, authorField, pagesField);
    modalElement.style.display = 'none';
  }

  render();
}

// HELPER FUNCTIONS
function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

function hideModal() {
  modalElement.style.display = 'none';
  document.body.focus();
  clearFields(titleField, authorField, pagesField);
}

function removeBook(id) {
  for (let i = 0, len = myLibrary.length; i < len; i++) {
    if (i === id) {
      myLibrary.splice(i, 1);
      break;
    }
  }
}

function changeReadStatus(id) {
  for (let i = 0, len = myLibrary.length; i < len; i++) {
    if (i === id) {
      myLibrary[i].read = !myLibrary[i].read;
      return myLibrary[i].read;
    }
  }
}

function optionReducer(a, b) {
  if (a.checked) {
    return true;
  }

  return false;
}

function checkForError(...inputFields) {
  let error = false;

  inputFields.forEach((field) => {
    if (field.value === '') {
      error = true;
      field.nextElementSibling.style.opacity = '1';
    } else {
      field.nextElementSibling.style.opacity = '0';
    }
  });

  return error;
}

function clearFields(...args) {
  args.forEach((field) => {
    field.value = '';
    field.nextElementSibling.style.opacity = '0';
  });
}

function saveLibraryToLocal() {
  if (storageAvailable('localStorage')) {
    localStorage.setItem('library', JSON.stringify(myLibrary));
  }
}

function getLibraryFromLocal() {
  if (
    storageAvailable('localStorage')
    && localStorage.length !== 0
    && localStorage.library
  ) {
    myLibrary = JSON.parse(localStorage.getItem('library'));
  }
}

function addBookToLibrary(title, author, pages, read = false) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  if (storageAvailable('localStorage')) {
    saveLibraryToLocal();
  }
}

function render() {
  const containerElement = document.querySelector('.flex-container');

  [...containerElement.children].forEach((book) => {
    containerElement.removeChild(book);
  });

  myLibrary.forEach((book, index) => {
    const bookElement = document.createElement('div');

    const titleElement = document.createElement('p');
    titleElement.classList.add('book-title');
    titleElement.innerHTML = '<span class="label">Title:</span> ';
    titleElement.innerHTML += book.title;

    const authorElement = document.createElement('p');
    authorElement.classList.add('book-author');
    authorElement.innerHTML = '<span class="label">Author:</span> ';
    authorElement.innerHTML += book.author;

    const pagesElement = document.createElement('p');
    pagesElement.classList.add('book-pages');
    pagesElement.innerHTML = '<span class="label">Pages:</span> '
    pagesElement.innerHTML += book.pages;

    const readElement = document.createElement('p');
    readElement.classList.add('book-read-status');
    readElement.innerHTML = '<span class="label">Read Status:</span> ';
    if (book.read) {
      readElement.innerHTML += 'yes';
      bookElement.classList.add('read');
    } else {
      readElement.innerHTML += 'not yet';
      bookElement.classList.add('unread');
    }

    const toggleReadBtn = document.createElement('button');
    toggleReadBtn.addEventListener('click', handleToggle);
    toggleReadBtn.classList.add('toggle');
    toggleReadBtn.textContent = 'Change read status'

    const removeBtn = document.createElement('button');
    removeBtn.addEventListener('click', handleRemove);
    removeBtn.classList.add('remove');
    removeBtn.textContent = 'Remove';

    const btnGroup = document.createElement('div');
    btnGroup.classList.add('justify-space-between');
    btnGroup.classList.add('flex-container');
    btnGroup.appendChild(toggleReadBtn);
    btnGroup.appendChild(removeBtn);

    bookElement.classList.add('book');
    bookElement.appendChild(titleElement);
    bookElement.appendChild(authorElement);
    bookElement.appendChild(pagesElement);
    bookElement.appendChild(readElement);
    bookElement.appendChild(btnGroup);
    bookElement.dataset.id = index;
    containerElement.appendChild(bookElement);
  });
}
