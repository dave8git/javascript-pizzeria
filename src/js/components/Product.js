import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './amountWidget.js';


export class Product {
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
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
