'use strict'


const gTrans = {
    logo: {
        en: 'KaBook',
        he: 'קבוק'
    },
    'page-title': {
        en: 'Books',
        he: `ספרים`
    },
    'page-subtitle': {
        en: 'Stock Management:',
        he: `ניהול מלאי:`
    },
    filters: {
        en: 'Filters',
        he: 'פילטרים',
    },
    'filters-max-price': {
        en: 'Max Price:',
        he: 'מחיר מקסימלי:',
    },
    'filters-min-rate': {
        en: 'Min Rate:',
        he: 'דירוג מינימלי:',
    },
    'filters-search': {
        en: 'Search by title',
        he: 'חיפוש לפי שם ספר'
    },
    'add-book': {
        en: 'Add Book',
        he: 'ספר חדש'
    },
    'grid': {
        en: 'Grid',
        he: 'גריד'
    },
    'list': {
        en: 'List',
        he: 'רשימה'
    },
    id: {
        en: 'ID',
        he: `מק"ט`
    },
    img: {
        en: 'Image',
        he: 'תמונה'
    },
    title: {
        en: 'Title',
        he: 'שם הספר'
    },
    price: {
        en: 'Price',
        he: 'מחיר'
    },
    actions: {
        en: 'Actions',
        he: 'פעולות'
    },
    read: {
        en: 'Read',
        he: 'קריאה'
    },
    update: {
        en: 'Update',
        he: 'עידכון'
    },
    delete: {
        en: 'Delete',
        he: 'מחיקה'
    }
}

var gCurrLang = 'en'

function getTrans(transKey) {
    //  if key is unknown return 'UNKNOWN'
    const key = gTrans[transKey]
    if (!key) return 'UNKNOWN'

    //  get from gTrans
    var translation = key[gCurrLang]

    //  If translation not found - use english
    if (!translation) translation = key.en

    return translation
}

function doTrans() {

    var els = document.querySelectorAll('[data-trans]')
    els.forEach(el => {
        const transKey = el.dataset.trans
        const translation = getTrans(transKey)

        el.innerText = translation

        //  support placeholder    
        if (el.placeholder) el.placeholder = translation
    })

}

function setLang(lang) {
    if (lang === gCurrLang) return
    gCurrLang = lang
}