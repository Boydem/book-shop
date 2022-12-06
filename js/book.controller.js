'use strict'


function onInit() {
    setLangToQueryParams()
    renderMaxPriceFilter()
    renderFilterByQueryStringParams()
    renderBooks()
    renderPagesBtns()
    doTrans()
    const currQueryParams = getCurrQueryParams()
    if (currQueryParams.onRead) onReadBook(currQueryParams.id)
}

function onSetLang(elLang) {
    const lang = elLang.dataset.lang
    setLang(lang)
    doTrans()
    if (lang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
}

function setViewMode(viewMode) {
    if (viewMode === 'list') setBooksViewMode('list')
    else if (viewMode === 'grid') setBooksViewMode('grid')
    renderBooks()
}

function getStrHTML(viewMode = 'list', book) {
    if (viewMode === 'list') {
        return `<tr>
        <td class="book-id">${book.id}</td>
        <td class="book-img-td">
            <img src="imgs/${book.imgUrl}" class="book-img" alt="">
        </td>
        <td class="book-title">${book.name}</td>
        <td class="book-price">$${book.price}</td>
        <td class="book-actions">
        <button onclick="onReadBook('${book.id}')" class="read-btn btn"><span data-trans="read"></span> <i class="fa-solid fa-book-open"></i></button>
        <button onclick="onUpdateBook('${book.id}')" class="update-btn btn"><span data-trans="update"></span> <i class="fa-solid fa-pen-to-square"></i></button>
        <button onclick="onRemoveBook('${book.id}')" class="delete-btn btn"><span data-trans="delete"></span> <i class="fa-solid fa-trash-can"></i></button>
    </td>
    </tr>`
    } else {
        return `<div class="grid-item">
        <div class="book-grid-content">
        <div class="book-img-td">
            <img src="imgs/${book.imgUrl}" class="book-img" alt="">
        </div>
        <p>ID: ${book.id}</p>
        <h3>Title: ${book.name}</h3>
        <p>Price: $${book.price}</p>
        <div class="actions-btns-grid">
            <button onclick="onReadBook('${book.id}')" class="read-btn btn"><span data-trans="read"></span> <i class="fa-solid fa-book-open"></i></button>
            <button onclick="onUpdateBook('${book.id}')" class="update-btn btn"><span data-trans="update"></span> <i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="onRemoveBook('${book.id}')" class="delete-btn btn"><span data-trans="delete"></span> <i class="fa-solid fa-trash-can"></i></button>
        </div>
        </div>
    </div>`
    }
}

function renderBooks() {
    var books = getBooksToDisplay()
    var viewMode = getBooksViewMode()
    const strHTMLs = books.map(book =>
        getStrHTML(viewMode, book)
    )
    if (viewMode === 'list') {
        var elBooksContainer = document.querySelector('tbody')
        toggleTableGrid('list')
    } else if (viewMode === 'grid') {
        var elBooksContainer = document.querySelector('.books-grid')
        toggleTableGrid('grid')
    }
    elBooksContainer.innerHTML = strHTMLs.join('')
    doTrans()
}

function toggleTableGrid(viewMode) {
    if (viewMode === 'list') {
        document.querySelector('table').style.display = 'table'
        document.querySelector('.books-grid').style.display = 'none'
        document.querySelector('.view-mode-btn-l').classList.add('active')
        document.querySelector('.view-mode-btn-g').classList.remove('active')

    } else if (viewMode === 'grid') {
        document.querySelector('table').style.display = 'none'
        document.querySelector('.books-grid').style.display = 'flex'
        document.querySelector('.view-mode-btn-g').classList.add('active')
        document.querySelector('.view-mode-btn-l').classList.remove('active')

    }
}

function renderPagesBtns() {
    var strHTMLs = ``
    const pagesLength = getPagesLength()
    const currPage = getCurrPage()
    for (let i = 0; i < pagesLength; i++) {
        const pageBtn = `<button data-page="${i}" class="page-idx-btn ${i===currPage?'active':''}" onclick="onChangePage(this.innerText - 1)" >${i+1}</button>`
        strHTMLs += pageBtn
    }
    const elPagesIdxButtonsWrapper = document.querySelector('.idx-btns')
    elPagesIdxButtonsWrapper.innerHTML = strHTMLs
}

function renderNewPageBtn(idx) {
    const elPagesIdxButtonsWrapper = document.querySelector('.idx-btns')
    const currStrHTML = elPagesIdxButtonsWrapper.innerHTML
    const newStrHTML = currStrHTML + `<button data-page="${idx}" class="page-idx-btn ${idx===0?'active':''}" onclick="onChangePage(this.innerText - 1)" >${idx+1}</button>`
    elPagesIdxButtonsWrapper.innerHTML = newStrHTML
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

function setLangToQueryParams() {
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + getQueryParamsStr('lang')
    window.history.pushState({
        path: newUrl
    }, '', newUrl)
}

function renderFilterByQueryStringParams() {
    const filterBy = getCurrQueryParams()
    if (!filterBy.maxPrice && !filterBy.minRate && !filterBy.title) return
    setBooksFilter(filterBy)
    renderFilters(filterBy)
}

function onSetSortBy(sortBy, elTheadTd) {
    var order = elTheadTd.dataset.order
    const sortObj = {}
    sortObj[sortBy] = +order
    sortBooks(sortObj)
    if (+order === 1) elTheadTd.setAttribute('data-order', -1)
    else if (+order === -1) elTheadTd.setAttribute('data-order', 1)
    renderBooks()
    renderPagesBtns()

}

function onFilterChange(filterBy) {
    renderFilters(filterBy)
    filterBy = setBooksFilter(filterBy)
    renderBooks()
    renderPagesBtns()
    const queryStringParams = getQueryParamsStr('filters')
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryStringParams
    window.history.pushState({
        path: newUrl
    }, '', newUrl)
}

function onAddBook() {
    addBook(prompt('Book Name'), +prompt('Book Price'))
    renderBooks()
    renderPagesBtns()
    renderMaxPriceFilter()
}

function onRemoveBook(bookId) {
    removeBook(bookId)
    renderBooks()
    renderPagesBtns()
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
        id: queryStringParams.get('id') || '',
        lang: queryStringParams.get('lang') || 'en'
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