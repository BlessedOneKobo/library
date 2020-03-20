class Book {
  constructor(title, author, pages, read = false) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
  }

  info() {
    const infoStr = `${this.title} by ${this.author}, ${this.pages},`;
    return `${infoStr} ${(this.read ? 'read' : 'not read yet')}`;
  }
}


class Library {
  constructor() {
    this.bookList = [];
    if (Library.storageAvailable('localStorage')) {
      this.bookList = Library.getFromLocal() || this.bookList;
    }
  }

  addBook(title, author, pages, read = false) {
    const book = new Book(title, author, pages, read);
    this.bookList.push(book);
    if (Library.storageAvailable('localStorage')) {
      Library.saveToLocal(this.bookList);
    }
  }

  removeBook(id) {
    this.bookList.splice(id, 1);
    Library.saveToLocal();
  }

  changeReadStatus(id) {
    this.bookList[id].read = !this.bookList[id].read;
    Library.saveToLocal(this.bookList);
    return this.bookList[id].read;
  }

  static storageAvailable(type) {
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
        // acknowledge QuotaExceededError iff. there's something already stored
        (storage && storage.length !== 0);
    }
  }

  static saveToLocal(list) {
    if (Library.storageAvailable('localStorage')) {
      localStorage.setItem('bookList', JSON.stringify(list));
    }
  }

  static getFromLocal() {
    if (
      Library.storageAvailable('localStorage')
      && localStorage.length !== 0
      && localStorage.bookList !== 'undefined'
    ) {
      return JSON.parse(localStorage.getItem('bookList'));
    }
  }
}


const displayModule = (function() {
  const containerElement = document.querySelector('.container');
  const modalElement = document.querySelector('.modal');
  const modalBtn = document.querySelector('[data-type="show-modal"]');
  const cancelBtn = document.querySelector('[data-type="cancel"]');
  const formElement = document.querySelector('form');
  const titleField = document.querySelector('[name="title"]');
  const authorField = document.querySelector('[name="author"]');
  const pagesField = document.querySelector('[name="pages"]');
  const readOptions = document.querySelectorAll('[name="read"]');

  // EVENT LISTENERS
  modalBtn.addEventListener('click', _handleModalShow);
  cancelBtn.addEventListener('click', _handleCancelClick);
  formElement.addEventListener('submit', _handleFormSubmit);
  document.body.addEventListener('click', _handleModalHide);

  // EVENT HANDLERS
  function _handleModalHide (e) {
    if ([...e.target.classList].includes('modal')) {
      _hideModal();
    }
  }

  function _handleRemove(e) {
    const book = e.target.parentElement.parentElement;
    const bookId = Number(book.dataset.idx);
    myLibrary.removeBook(bookId);
    render();
  }

  function _handleToggle(e) {
    const book = e.target.parentElement.parentElement;
    const bookId = Number(book.dataset.idx);
    const newStatus = myLibrary.changeReadStatus(bookId);
    if (newStatus) {
      book.classList.add('read');
      book.classList.remove('unread');
    } else {
      book.classList.add('unread');
      book.classList.remove('read');
    }

    render();
  }

  function _handleModalShow() {
    modalElement.style.display = 'block'
    _clearFields(titleField, authorField, pagesField);
    titleField.focus();
  }

  function _handleCancelClick(e) {
    e.preventDefault();
    _hideModal();
  }

  function _handleFormSubmit(e) {
    e.preventDefault();
    const readStatus = ([...readOptions].reduce(_optionReducer)) === true;
    const error = _checkForError(titleField, authorField, pagesField);
    const [title, author, pages, status] = [
      titleField.value,
      authorField.value,
      Number(pagesField.value),
      readStatus
    ];

    if (!error) {
      myLibrary.addBook(title, author, pages, status);
      _clearFields(titleField, authorField, pagesField);
      modalElement.style.display = 'none';
    }

    render();
  }

  function _hideModal() {
    modalElement.style.display = 'none';
    document.body.focus();
    _clearFields(titleField, authorField, pagesField);
  }

  function _optionReducer(a, b) {
    if (a.checked) {
      return true;
    }

    return false;
  }

  function _checkForError(...inputFields) {
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

  function _clearFields(...args) {
    args.forEach((field) => {
      field.value = '';
      field.nextElementSibling.style.opacity = '0';
    });
  }

  function _createElement(tag, attribs, markup, text, events, ...children) {
    const el = document.createElement(tag);
    if (text)     el.textContent = text;
    if (markup)   el.innerHTML = markup;
    if (children) children.forEach((child) => el.appendChild(child));

    if (attribs) {
      if (attribs.id)        el.id = attribs.id;
      if (attribs.classList) el.classList = attribs.classList.join(' ');
      if (attribs.dataset)   Object.assign(el.dataset, attribs.dataset);
    }

    if (events) {
      Object.keys(events).forEach((ev) => el.addEventListener(ev, events[ev]));
    }

    return el;
  }

  function render() {
    const containerElement = document.querySelector('.flex-container');

    [...containerElement.children].forEach((book) => {
      containerElement.removeChild(book);
    });

    myLibrary.bookList.forEach((book, idx) => {
      const titleElement = _createElement(
        'p',
        {classList: ['book-title']},
        `<span class="label">Title:</span> ${book.title}`
      );

      const authorElement = _createElement(
        'p',
        {classList: ['book-author']},
        `<span class="label">Author:</span> ${book.title}`
      );

      const pagesElement = _createElement(
        'p',
        {classList: ['book-pages']},
        `<span class="label">Pages:</span> ${book.pages}`
      );

      const readElement = _createElement(
        'p',
        {classList: ['book-read-status', (book.read ? 'read' : 'unread')]},
        `<span class="label">Read Status:</span> ${book.read ? 'yes' : 'no yet'}`
      );

      const toggleReadBtn = _createElement(
        'button',
        {classList: ['toggle']},
        null, 'Change read status',
        {'click': _handleToggle}
      );

      const removeBtn = _createElement(
        'button',
        {classList: ['remove']},
        null, 'Remove',
        {'click': _handleRemove}
      );

      const btnGroup = _createElement(
        'div',
        {classList: ['justify-space-between', 'flex-container']},
        null, null, null,
        toggleReadBtn, removeBtn
      );

      const bookElement = _createElement(
        'div',
        {classList: ['book', (book.read ? 'read' : 'unread')], dataset: {idx}},
        null, null, null,
        titleElement, authorElement, pagesElement, readElement, btnGroup
      );

      containerElement.appendChild(bookElement);
    });
  }

  return {render};
})();

// INIT
const myLibrary = new Library();
displayModule.render();
