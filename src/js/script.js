/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
      bookingWidget: '#'
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); // generate HTML based on template
      //console.log('GENERATEHTML:', generatedHTML);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // create element using utils.createElementFromHTML
      const menuContainer = document.querySelector(select.containerOf.menu); // find menu container
      menuContainer.appendChild(thisProduct.element); // add element to menu
    }
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('thisProduct.accordionTrigger:', thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log('thisProduct.formInputs:', thisProduct.formInputs);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log('thisProduct.formInputs:', thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log('thisProduct.cartButton:', thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log('thisProduct.priceElem:', thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log('thisProduct.imageWrapper:', thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log(thisProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;
      const buttonClicked = thisProduct.element.querySelector(select.menuProduct.clickable); // find the clicable trigger (the element that shoudl react to clicking )
      buttonClicked.addEventListener('click', function (event) { // START: click event listener to trigger
        event.preventDefault(); // prevent default action for event
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); // toggle active class on element of thisProduct
        const allActiveProducts = document.querySelectorAll(select.all.menuProducts); // find all active products
        for (let activeProduct of allActiveProducts) { // START LOOP: for each active product
          if (activeProduct != thisProduct.element) { //START: if the active product isn't the element of thisProduct
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive); // remove class active for the active product
          } // END: if the active product isn't the elemnt of thisProduct
        } // END LOOP: for each active product
      }); // END: click event listener to trigger
    }
    initOrderForm() {
      const thisProduct = this;
      //console.log('Tu metoda initOrderForm');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // read all data from the form (using utils.serializeFormToObject) and save it to const formData
      thisProduct.params = {};
      let price = thisProduct.data.price;// set variable price to equal thisProduct.data.price
      for (let paramId in thisProduct.data.params) {// START LOOP: for each paramId in thisProduct.data.params
        const param = thisProduct.data.params[paramId];// save the element in thisProduct.data.params with keyparamId as const param
        for (let optionID in param.options) {// START LOOP: for each optionID  in param.options

          const option = param.options[optionID];// save the element in param.options with key optionId as const option
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionID) > -1;
          if(optionSelected && !option.default) {// START IF: if option is selected and option is not default
            price += option.price;// add price of option to variable price
            //console.log('----', option.price);
          } else if (!optionSelected && option.default) {// END IF: if option is selected and option is not default // START ELSE IF: if option is not selected and option is default
            price -= option.price;// deduct price of option from price
            //console.log('PRICE:', price);
          }
          const activeImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionID);
          //console.log('activeImage:', activeImages);
          if(optionSelected) {
            if(!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionID] = option.label;
            for(let activeImage of activeImages) {
              activeImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for (let activeImage of activeImages) {
              activeImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }// END LOOP: for each optionId in param.options
      }// END LOOP: for each paramId in thisProduct.data.params
      //console.log('THISPRICE:', price);
      //thisProduct.priceElem.innerHTML = thisProduct.price;
      thisProduct.priceSingle = price; //price *= thisProduct.amountWidget.value; // multiply price by amount
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = thisProduct.price; // set content of thisProduct.priceElem to be the value of variable price
      console.log(thisProduct.params);

    }
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct);
    }
  }

  class amountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);

    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      let newValue = parseInt(value);
      /* TODO: Add validation */
      if(newValue >= 10) {
        newValue = 10;
      } else if(newValue <= 1) {
        newValue = 1;
      }
      if((thisWidget.value != newValue) && (newValue >= settings.amountWidget.defaultMin) && (newValue <= settings.amountWidget.defaultMax)) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        console.log('VALUE:', thisWidget.value);
        thisWidget.setValue((thisWidget.value) - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        console.log(thisWidget.value);
        thisWidget.setValue((thisWidget.value) + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = document.querySelector(select.cart.phone);
      thisCart.dom.address = document.querySelector(select.cart.address);

      for (let key of thisCart.renderTotalsKeys) {
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function () {
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        totalPrice: thisCart.totalPrice,
        telephone: thisCart.dom.phone,
        address: thisCart.dom.address,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: thisCart.deliveryFee,
        products: []

      };

      for (var product in thisCart.products) {
        payload.products = product.getData();
      }


      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }
    update() {
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      console.log('thisCart.deliveryFee!!!', thisCart.deliveryFee);

      for (let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      if(thisCart.subtotalPrice > 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }

      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);
      console.log('thisCart.totalPrice', thisCart.totalPrice);


    }
    remove(cartProduct) {
      const thisCart = this;
      console.log(thisCart.products);
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      this.update();
    }
    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      console.log('GENERATEDDOM', generatedDOM);
      console.log('THISCARTPRODUCTLIST', thisCart.dom.productList);
      const cartContainer = thisCart.dom.productList;

      cartContainer.appendChild(generatedDOM);
      console.log('adding product', menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      thisCart.update();
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      console.log('new CartProduct', thisCartProduct);
      console.log('productData', menuProduct);
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        console.log(thisCartProduct);
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log(event);
    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event){
        event.preventDefault();
        thisCartProduct.remove();

      });
    }
    getData(){
      const thisCartProduct = this;

      const productData = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params
      };

      return productData;
    }
  }

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
    initData: function (){
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
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initCart();
      thisApp.initData();
      //thisApp.initMenu();

    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      console.log(cartElem);
      thisApp.cart = new Cart(cartElem);
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    },

  };
  app.init();
}
