'use strict'


function onInit() {
    renderMaxPriceFilter()
    renderFilterByQueryStringParams()
    renderBooks()
    const currQueryParams = getCurrQueryParams()
    console.log('currQueryParams.onRead:', currQueryParams.onRead)
    console.log('currQueryParams.id:', currQueryParams.id)
    if (currQueryParams.onRead) onReadBook(currQueryParams.id)
}

function renderBooks() {
    var books = getBooksToDisplay()
    const strHTMLs = books.map(book =>
        `<tr>
            <td class="book-id">${book.id}</td>
            <td class="book-img-td">
                <img src="imgs/${book.imgUrl}" class="book-img" alt="">
            </td>
            <td class="book-title">${book.name}</td>
            <td class="book-price">$${book.price}</td>
            <td class="book-actions">
                <button onclick="onReadBook('${book.id}')" class="read-btn btn">Read</button>
                <button onclick="onUpdateBook('${book.id}')" class="update-btn btn">Update</button>
                <button onclick="onRemoveBook('${book.id}')" class="delete-btn btn">Delete</button>
            </td>
        </tr>`
    )
    const elTableBody = document.querySelector('tbody')
    elTableBody.innerHTML = strHTMLs.join('')
}

function renderMaxPriceFilter() {
    var minMaxPrices = getMinMaxPrice()
    var maxPrice = minMaxPrices.max
    var minPrice = minMaxPrices.min
    const elMaxPriceFilter = document.querySelector('input[name="maxprice"]')
    elMaxPriceFilter.setAttribute('max', maxPrice)
    elMaxPriceFilter.setAttribute('min', minPrice)
    elMaxPriceFilter.setAttribute('value', maxPrice)
    elMaxPriceFilter.setAttribute('data-content', `$${maxPrice}`)
}

function renderFilters(filterBy) {
    if (filterBy.maxPrice !== undefined) {
        var elInputRange = document.querySelector('input[name="maxprice"]')
        elInputRange.setAttribute('value', +filterBy.maxPrice)
        elInputRange.setAttribute('data-content', `$${+filterBy.maxPrice}`)
    }
    if (filterBy.minRate !== undefined) {
        var elInputRange = document.querySelector('input[name="minrate"]')
        elInputRange.setAttribute('data-content', `${+filterBy.minRate} - 10`)
        elInputRange.setAttribute('value', +filterBy.minRate)
    }
    if (filterBy.title !== undefined) {
        var elInputText = document.querySelector('input[name="title"]')
        elInputText.value = filterBy.title
    }
}

function renderFilterByQueryStringParams() {
    const filterBy = getCurrQueryParams()
    if (!filterBy.maxPrice && !filterBy.minRate && !filterBy.title) return
    renderFilters(filterBy)
    setBooksFilter(filterBy)
}

function onSetSortBy(sortBy, elTheadTd) {
    var order = elTheadTd.dataset.order
    const sortObj = {}
    sortObj[sortBy] = +order
    sortBooks(sortObj)
    if (+order === 1) elTheadTd.setAttribute('data-order', -1)
    else if (+order === -1) elTheadTd.setAttribute('data-order', 1)
    renderBooks()

}

function onFilterChange(filterBy) {
    renderFilters(filterBy)
    filterBy = setBooksFilter(filterBy)
    renderBooks()
    const queryStringParams = getQueryParamsStr('filters')
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({
        path: newUrl
    }, '', newUrl)
}

function onAddBook() {
    addBook(prompt('Book Name'), +prompt('Book Price'))
    renderBooks()
    renderMaxPriceFilter()
}

function onRemoveBook(bookId) {
    removeBook(bookId)
    renderBooks()
    renderMaxPriceFilter()
}

function onUpdateBook(bookId) {
    updateBook(bookId, +prompt('New price'))
    renderBooks()
    renderMaxPriceFilter()
}

function getCurrQueryParams() {
    const queryStringParams = new URLSearchParams(window.location.search)
    return {
        title: queryStringParams.get('title') || '',
        maxPrice: +queryStringParams.get('maxprice') || 0,
        minRate: +queryStringParams.get('minrate') || 0,
        onRead: queryStringParams.get('toOpen') || false,
        id: queryStringParams.get('id') || ''
    }
}

function onChangePage(nextPageIdx) {
    if (nextPageIdx === 'next') {
        var currIdx = nextPage()
        activatePage(currIdx)
        renderBooks()
    } else if (nextPageIdx === 'prev') {
        var currIdx = prevPage()
        activatePage(currIdx)
        renderBooks()
    } else {
        navToPage(nextPageIdx)
        activatePage(nextPageIdx)
        renderBooks()
    }
}

function activatePage(pageToActivate) {
    const currActive = document.querySelector('.page-idx-btn.active')
    currActive.classList.remove('active')
    const toActive = document.querySelector(`.page-idx-btn[data-page="${pageToActivate}"]`)
    toActive.classList.add('active')
}

function onReadBook(bookId) {
    console.log('lolooll:')
    const book = readBook(bookId)
    updateModal({
        toOpen: true,
        id: bookId
    })
    renderModal(book)
    document.querySelector('.modal-wrapper').classList.add('open')
    const queryStringParams = getQueryParamsStr('modal')
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({
        path: newUrl
    }, '', newUrl)

}

function onCloseModal() {
    updateModal()
    console.log('gModalInfo:', gModalInfo)
    document.querySelector('.modal-wrapper').classList.remove('open')
    const filterQueryParamsStr = getQueryParamsStr('filters')
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + filterQueryParamsStr
    window.history.pushState({
        path: newUrl
    }, '', newUrl)
}

function onUpdateRate(el, bookId) {
    const elRateInput = document.querySelector('.modal input[name="rate"]')
    var bookRate = +elRateInput.value
    if (el.dataset.rate === 'plus' && bookRate < 10) bookRate++
    else if (el.dataset.rate === 'minus' && bookRate > 0) bookRate--
    elRateInput.innerText = bookRate
    updateRate(bookId, bookRate)
    const book = readBook(bookId)
    renderModal(book)
}

function renderModal(book) {
    const elModalContainer = document.querySelector('.modal')
    elModalContainer.innerHTML = `
    <h1 class="modal-title">${book.name}</h1>
    <img class="modal-img" src="imgs/${book.imgUrl}" alt="book">
    <span  class="modal-id">ID: ${book.id}</span>
    <span  class="modal-price">PRICE: $${book.price}</span>
    <button class="close-modal-btn" onclick="onCloseModal()">Close</button>
    <label for="rate">RATE:
    <button data-rate="minus" onclick="onUpdateRate(this,'${book.id}')" class="plus-minus">-</button>
    <input onchange="onUpdateRate(this,'${book.id}')" name="rate" type="number" min="0" max="10" value="${book.rate}">
    <button data-rate="plus" onclick="onUpdateRate(this,'${book.id}')" class="plus-minus">+</button>
    </label>
    `
}