import { templates, select } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './amountWidget.js';

export class Booking {
  constructor(bookingElement) {
    const thisBooking = this;
    console.log(bookingElement);
    thisBooking.render(bookingElement);
    thisBooking.initWidgets();

  }
  render(bElement) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bElement;
    console.log('KONSOL:', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }
  getElements() {

  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }


}


