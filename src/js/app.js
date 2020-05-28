import {
  Product
} from './components/Product.js';
import {
  Cart
} from './components/Cart.js';
import {
  select,
  settings,
  classNames
} from './settings.js';
import {
  Booking
} from './components/Booking.js';

const app = {
  initMenu: function () {
    //const testProduct = new Product();
    //console.log('testProduct:', testProduct);
    //const thisApp = this;
    //thisApp.data = dataSource;
    //console.log('thisApp.data:', thisApp.data);
    const thisApp = this;

    //console.log('thisApp.data:', this.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */

        thisApp.initMenu(); /* execute initMenu method */
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initData();
    thisApp.initBooking();
    //thisApp.initMenu();

  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    console.log(cartElem);
    thisApp.cart = new Cart(cartElem);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initPages: function() {
    const thisApp = this;
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];

    if (window.location.hash.length >2 ) {
      const idFromHash = window.location.hash.replace('#/', '');
      pagesMatchingHash = thisApp.pages.filter(function (page){
        return page.id == idFromHash;
      });
    }

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const href = clickedElement.getAttribute('href');
        const hrefModified = href.replace('#','');
        thisApp.activatePage(hrefModified);
      });
    }
    // if(pagesMatchingHash.length) {
    //   thisApp.activatePage(pagesMatchingHash[0].id);
    // } else {
    //   thisApp.activatePage(thisApp.pages[0].id);
    // }
    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
  },
  activatePage: function(pageId) {
    const thisApp = this;
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }
    window.location.hash = '#/' + pageId;
  },
  initBooking: function() {
    const thisApp = this;
    thisApp.siteReserverContainer = document.querySelector(select.containerOf.booking);
    console.log('KONSOL2', thisApp.bookingContainer);
    thisApp.booking = new Booking(thisApp.siteReserverContainer);


  }
};
app.init();
