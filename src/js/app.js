import {
  Product
} from './components/Product.js';
import {
  Cart
} from './components/Cart.js';
import {
  select,
  settings
} from './settings.js';

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
    thisApp.initData();
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

};
app.init();
