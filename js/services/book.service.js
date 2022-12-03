'use strict'

const STORAGE_KEY = 'booksDB'
const PAGE_SIZE = 3

var gPageIdx = 0
var gBooks
var gFilterBy = {
    maxPrice: 0,
    minPrice: 0,
    minRate: 0,
    title: '',
}
var gModalInfo = {
    isOpen: false,
    id: '',
}
var gViewMode = !loadFromStorage('viewMode') ? 'list' : loadFromStorage('viewMode')
var gFilteredResults = null
_createBooks()
console.log('gBooks:', gBooks)

function setBooksViewMode(viewMode) {
    gViewMode = viewMode
    saveToStorage('viewMode', viewMode)
}

function getBooksViewMode() {
    console.log('gViewMode:', gViewMode)
    return gViewMode
}

function getBooksToDisplay() {
    var books = gBooks.filter(book => {
        return book.price <= gFilterBy.maxPrice && book.rate >= gFilterBy.minRate && book.name.toLowerCase().includes(gFilterBy.title.toLowerCase())
    })
    gFilteredResults = books.length
    var startIdx = gPageIdx * PAGE_SIZE
    return books.slice(startIdx, startIdx + PAGE_SIZE)
}

function setBooksFilter(filterBy = {}) {
    gPageIdx = 0
    if (filterBy.maxPrice !== undefined) gFilterBy.maxPrice = filterBy.maxPrice
    if (filterBy.minRate !== undefined) gFilterBy.minRate = filterBy.minRate
    if (filterBy.title !== undefined) gFilterBy.title = filterBy.title
    if (filterBy.viewMode !== undefined) gViewMode = filterBy.viewMode
    return gFilterBy
}

function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => bookId === book.id)
    gBooks.splice(bookIdx, 1)
    _saveBooksToStorage()
}

function updateBook(bookId, bookPrice) {
    if (!bookPrice) return
    const bookIdx = gBooks.findIndex(book => bookId === book.id)
    gBooks[bookIdx].price = bookPrice
    _saveBooksToStorage()
}

function readBook(bookId) {
    const bookIdx = gBooks.findIndex(book => bookId === book.id)
    return gBooks[bookIdx]
}

function addBook(name, price) {
    if (!name || !price) return
    gBooks.push(_createBook(name, price))
    _saveBooksToStorage()
}


function getBookById(bookId) {
    const book = gBooks.find(book => bookId === book.id)
    return book
}

function updateRate(bookId, newRate) {
    const book = gBooks.find(book => bookId === book.id)
    book.rate = newRate
    _saveBooksToStorage()
}

function sortBooks(sortBy = {}) {
    gPageIdx = 0
    if (sortBy.title !== undefined) gBooks.sort((book1, book2) => {
        return book1.name.localeCompare(book2.name) * sortBy.title
    })
    else if (sortBy.price !== undefined) gBooks.sort((book1, book2) => {
        return ((book1.price - book2.price) * sortBy.price)
    })

}

function updateModal(modalInfo = {}) {
    gModalInfo.id = !modalInfo.id ? '' : modalInfo.id
    gModalInfo.isOpen = !modalInfo.toOpen ? false : true
}

function getQueryParamsStr(caller) {
    const currUrlSearch = location.search
    if (caller === 'filters' && currUrlSearch === '' || caller === 'filters' && !gModalInfo.isOpen) return `?title=${gFilterBy.title}&maxprice=${gFilterBy.maxPrice}&minrate=${gFilterBy.minRate}`
    else if (caller === 'filters' && gModalInfo.isOpen) return `?toOpen=${gModalInfo.isOpen}&id=${gModalInfo.id}&title=${gFilterBy.title}&maxprice=${gFilterBy.maxPrice}&minrate=${gFilterBy.minRate}`
    else if (caller === 'modal' && currUrlSearch.toLowerCase().includes('maxprice')) return `?title=${gFilterBy.title}&maxprice=${gFilterBy.maxPrice}&minrate=${gFilterBy.minRate}&toOpen=${gModalInfo.isOpen}&id=${gModalInfo.id}`
    else if (caller === 'modal') return `?toOpen=${gModalInfo.isOpen}&id=${gModalInfo.id}`
}

function updateFiltersPrices(books) {
    gFilterBy.maxPrice = books[0].price
    gFilterBy.minPrice = books[books.length - 1].price
}

function getMinMaxPrice() {
    const booksCopy = gBooks.slice()
        .sort((a, b) => b.price - a.price)
    updateFiltersPrices(booksCopy)
    return {
        max: booksCopy[0].price,
        min: booksCopy[booksCopy.length - 1].price
    }
}

function navToPage(idx) {
    gPageIdx = idx
    return gPageIdx
}

function nextPage() {
    gPageIdx++
    if (gPageIdx * PAGE_SIZE >= gBooks.length) {
        gPageIdx = 0
    }
    return gPageIdx
}

function getPagesLength() {
    return Math.ceil(gFilteredResults / PAGE_SIZE)
}

function prevPage() {
    gPageIdx--
    if (gPageIdx * PAGE_SIZE < 0) {
        gPageIdx = Math.floor(gBooks.length / PAGE_SIZE) - 1
    }
    return gPageIdx
}

function _createBook(name, price, imgUrl = `new.png`, rate = 0) {
    return {
        id: makeId(),
        name,
        price,
        imgUrl,
        rate
    }
}

function _createBooks() {
    var books = loadFromStorage(STORAGE_KEY)
    // Nothing in storage - generate demo data
    if (!books || !books.length) {
        books = [
            _createBook('All my friends are dead.', 59, `allmyfriends.jpg`, 5),
            _createBook('The cat in the hat', 109, `catinhat.jpg`, 1),
            _createBook('Mr.Bump', 19, `mrbump.jpg`),
            _createBook('Peek A Who', 79, `peekawho.jpg`),
            _createBook('Noise', 129, `noise.jpg`),
            _createBook('Lost N Found', 68, `lostnfound.jpg`, 10)
        ]
    }
    gBooks = books
    _saveBooksToStorage()
}

function _saveBooksToStorage() {
    saveToStorage(STORAGE_KEY, gBooks)
}