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

const theHobbit = new Book('The Hobbit', 'J.R.R. Tolkien', 295);
console.log(theHobbit.info());
