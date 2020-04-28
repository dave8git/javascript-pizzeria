/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      console.log('thisProduct.priceElem:', thisProduct.priceElem);
      console.log('!!!!!!!!!!!thisProduct.formInputs:', thisProduct.formInputs);
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
      console.log('Tu metoda initOrderForm'); 
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
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // read all data from the form (using utils.serializeFormToObject) and save it to const formData
      let price = thisProduct.data.price;// set variable price to equal thisProduct.data.price
      for (let paramId in thisProduct.data.params) {// START LOOP: for each paramId in thisProduct.data.params 
        const param = thisProduct.data.params[paramId];// save the element in thisProduct.data.params with keyparamId as const param 
        for (let optionID in param.options) {// START LOOP: for each optionID  in param.options 
          const option = param.options[optionID];// save the element in param.options with key optionId as const option
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionID) > -1;
          if(optionSelected && !option.default) {// START IF: if option is selected and option is not default
            price += option.price;// add price of option to variable price 
          } else if (!optionSelected && !option.default) {// END IF: if option is selected and option is not default // START ELSE IF: if option is not selected and option is default 
            price -= option.price;// deduct price of option from price
            console.log('PRICE:', price);
          }
        }// END LOOP: for each optionId in param.options
      }// END LOOP: for each paramId in thisProduct.data.params
      console.log('THISPRICE:', price);
      thisProduct.priceElem.innerHTML = thisProduct.price;// set content of thisProduct.priceElem to be the value of variable price 
      thisProduct.priceElem.innerHTML = price;
      

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

      console.log('thisApp.data:', this.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init();
}
