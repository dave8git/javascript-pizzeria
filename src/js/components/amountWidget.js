import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    
    thisWidget.getElements(); 
    thisWidget.initActions();

  }
  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
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
  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
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
}
