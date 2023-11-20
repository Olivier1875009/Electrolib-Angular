import { Component, EventEmitter, Output } from '@angular/core';
import { ElectrolibService } from '../electrolib.service';
import { User } from '../model/User';
import { Genre } from '../model/Genre';
import { Book } from '../model/Book';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Author } from '../model/Author';
import { Router } from '@angular/router';
import { getURLBookCover } from '../util';
import { Status } from '../model/Status';
import { Favorite } from '../model/Favorite';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  user: User = new User();
  loading: boolean = true;
  books: Book[] = new Array();
  displayedBooks: Book[] = new Array();
  genres: Genre[] = new Array();
  authors: Author[] = new Array();
  statuses: Status[] = new Array();
  favorites: Favorite[] = new Array();
  favoriteFilter: boolean = false;
  searchInp = '';
  sortOrder: string = 'ascending';
  sortProperty: string = 'date';
  inventoryDisplay: string = 'table';
  numberOfLike: number[] = new Array();
  numberOfBooksByGenres: number[] = new Array();
  numberOfBooksByAuthors: number[] = new Array();
  numberOfBooksByStatus: number[] = new Array();

  //---------------------------------
  // Function to build the component
  //---------------------------------
  constructor(private electrolibSrv: ElectrolibService, private modalService: NgbModal, private router: Router) { }

  //---------------------------------
  // Function to initialize the component
  //---------------------------------
  ngOnInit() {
    //Get all the genres
    this.retrieveGenres();

    //Get all the authors
    this.retrieveAuthors();

    //Get all the statuses
    this.retrieveStatus();

    //Get all the favorites
    this.retrieveFavorites();

    //Get all the books
    this.retrieveBooks(true);

    //Sort the inventory with is default values
    this.sortInventory();
  }

  //---------------------------------
  // Function to retrieve the genres from the database
  //---------------------------------
  retrieveGenres() {
    this.electrolibSrv.getGenres().subscribe(
      genres => {
        this.genres = genres;

        for (let index = 0; index < genres.length; index++) {
          this.electrolibSrv.getGenreNumber(genres[index].idGenre).subscribe(
            number => {
              this.numberOfBooksByGenres.push(number);
            }
          );
        }
      }
    );
  }

  //---------------------------------
  // Function to retrieve the authors from the database
  //---------------------------------
  retrieveAuthors() {
    this.electrolibSrv.getAuthors().subscribe(
      authors => {
        this.authors = authors;

        for (let index = 0; index < authors.length; index++) {
          this.electrolibSrv.getAuthorNumber(authors[index].idAuthor).subscribe(
            number => {
              this.numberOfBooksByAuthors.push(number);
            }
          );
        }
      }
    );
  }

  //---------------------------------
  // Function to retrieve the statuses from the database
  //---------------------------------
  retrieveStatus() {
    this.electrolibSrv.getAllStatus().subscribe(
      statuses => {
        this.statuses = statuses;

        for (let index = 0; index < statuses.length; index++) {
          this.electrolibSrv.getStatusNumber(statuses[index].idStatus).subscribe(
            number => {
              this.numberOfBooksByStatus.push(number);
            }
          );
        }
      }
    );
  }

  //---------------------------------
  // Function to retrieve the favorites from the database
  //---------------------------------
  retrieveFavorites() {
    this.electrolibSrv.getFavorites().subscribe(
      favorites => {
        this.favorites = favorites;
      }
    );
  }

  //---------------------------------
  // Function to retrieve the books from the database
  //---------------------------------
  retrieveBooks(loadingSVG?: boolean) {
    this.electrolibSrv.getBooks().subscribe(
      books => {
        if (loadingSVG) {
          setTimeout(() => {
            this.loading = false;
            this.books = books;
            this.displayedBooks = books;
          }, 1000);

          for (let index = 0; index < books.length; index++) {
            this.electrolibSrv.getFavoriteNbr(books[index].idBook).subscribe(
              number => {
                this.numberOfLike.push(number);
              }
            );
          }
        } else {
          this.books = books;
          this.displayedBooks = books;
        }
      }
    );
  }

  //---------------------------------
  // Function to sort the books
  //---------------------------------
  sortInventory() {
    switch (this.sortProperty) {
      case 'date':
        if (this.sortOrder === 'descending') {
          this.displayedBooks.sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1));
        } else {
          this.displayedBooks.sort((a, b) => (a.publishedDate > b.publishedDate ? 1 : -1));
        }
        break;

      case 'title':
        if (this.sortOrder === 'descending') {
          this.displayedBooks.sort((a, b) => (a.title.toLowerCase() < b.title.toLowerCase() ? 1 : -1));
        } else {
          this.displayedBooks.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
        }
        break;

      case 'author':
        if (this.sortOrder === 'descending') {
          this.displayedBooks.sort((a, b) => (a.author.lastName.toLowerCase() < b.author.lastName.toLowerCase() ? 1 : -1));
        } else {
          this.displayedBooks.sort((a, b) => (a.author.lastName.toLowerCase() > b.author.lastName.toLowerCase() ? 1 : -1));
        }
        break;
    }
  }

  //---------------------------------
  // Function to filter the books by a research
  //---------------------------------
  applySearch(search: string, reset: boolean) {
    if (reset) {
      this.displayedBooks = this.books;
    }

    this.displayedBooks = this.displayedBooks.filter((book) => book.title.toLowerCase().includes(search));
  }

  //---------------------------------
  // Function to add dynamic response to the search bar
  //---------------------------------
  onKeyup(event: KeyboardEvent) {
    if (event.keyCode == 8) {
      this.applySearch(this.searchInp, true);
    }
  }

  //---------------------------------
  // Function to filter the books by the criteria given
  //---------------------------------
  filterBooks(filter: string, id?: number, isFilter?: boolean) {
    switch (filter) {
      case 'genre':
        if (!isFilter) {
          if (this.genres.filter((genre) => genre.isFilter === true).length >= 1) {
            this.displayedBooks = this.displayedBooks.concat(this.books.filter((book) => book.genre.idGenre === id));
          } else {
            this.displayedBooks = this.books.filter((book) => book.genre.idGenre === id);
          }
        } else {
          this.displayedBooks = this.displayedBooks.filter((book) => !(book.genre.idGenre === id));
        }
        break;

      case 'author':
        if (!isFilter) {
          if (this.authors.filter((author) => author.isFilter === true).length >= 1) {
            this.displayedBooks = this.displayedBooks.concat(this.books.filter((book) => book.author.idAuthor === id));
          } else {
            this.displayedBooks = this.books.filter((book) => book.author.idAuthor === id);
          }
        } else {
          this.displayedBooks = this.displayedBooks.filter((book) => !(book.author.idAuthor === id));
        }
        break;

      case 'status':
        if (!isFilter) {
          if (this.statuses.filter((status) => status.isFilter === true).length >= 1) {
            this.displayedBooks = this.displayedBooks.concat(this.books.filter((book) => book.status.idStatus === id));
          } else {
            this.displayedBooks = this.books.filter((book) => book.status.idStatus === id);
          }
        } else {
          this.displayedBooks = this.displayedBooks.filter((book) => !(book.status.idStatus === id));
        }
        break;
    }

    if (this.displayedBooks.length == 0) {
      this.displayedBooks = this.books;
    }

    this.sortInventory();
  }

  //---------------------------------
  // Function to remove all the filters from the view
  //---------------------------------
  removeFilters() {
    for (let i = 0; i < this.genres.length; i++) {
      if (this.genres[i].isFilter) {
        this.genres[i].isFilter = false;
      }
    }

    for (let i = 0; i < this.authors.length; i++) {
      if (this.authors[i].isFilter) {
        this.authors[i].isFilter = false;
      }
    }

    for (let i = 0; i < this.statuses.length; i++) {
      if (this.statuses[i].isFilter) {
        this.statuses[i].isFilter = false;
      }
    }

    this.favoriteFilter = false;
    this.displayedBooks = this.books;
  }

  //---------------------------------
  // Open a modal with the given content
  //---------------------------------
  openModal(content: any, size: string) {
    this.modalService.open(content, {
      animation: true,
      centered: true,
      keyboard: true,
      size: size
    });
  }

  //---------------------------------
  // Function to change the way to display the books
  //---------------------------------
  updateDisplay(status: Status) {
    switch (status.status) {
      case 'Disponible':
        return 'table-primary';
        break;

      case 'Emprunté':
        return 'table-light';
        break;

      case 'Réservé':
        return 'table-warning';
        break;

      case 'Perdu':
        return 'opacity-25';
        break;

      case 'Supprimé':
        return 'table-danger';
        break;

      default:
        return '';
        break;
    }
  }

  //---------------------------------
  // Function to mark the book as favorite
  //---------------------------------
  isFavorite(idBook: number) {
    for (let index = 0; index < this.favorites.length; index++) {
      if (this.favorites[index].book.idBook === idBook) {
        return true;
      }
    }

    return false;
  }

  //---------------------------------
  // Function to retrieve the image of a book
  //---------------------------------
  getBookCover(idBook: number) {
    return getURLBookCover(idBook);
  }
}