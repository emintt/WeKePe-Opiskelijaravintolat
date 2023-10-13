import { Course, Menu, MenuWeekly } from "./interfaces/Menu";
import { Restaurant } from "./interfaces/Restaurant";

const restaurantRow = (restaurant: Restaurant): HTMLTableRowElement => {
  const {name, address, company} = restaurant;
  const tr = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.innerText = name;
  const addressCell = document.createElement('td');
  addressCell.innerText = address;
  const companyCell = document.createElement('td');
  companyCell.innerText = company;
  tr.appendChild(nameCell);
  tr.appendChild(addressCell);
  tr.appendChild(companyCell);
  return tr;
};

const restaurantItem = (restaurant: Restaurant, distance: number): HTMLDivElement => {
  const {name, address, postalCode, city, company} = restaurant;
  const div = document.createElement('div');
  div.classList.add('restaurant-list-item');
  const h2 = document.createElement('h2');
  h2.innerText = name;
  const p1 = document.createElement('p');
  p1.innerText = distance < 1000 ? `${distance} m matka` : `${(distance/1000).toFixed(2)} km matka`;
  const p2 = document.createElement('p');
  p2.innerText = `${address}, ${postalCode}, ${city}`;
  const p3 = document.createElement('p');
  p3.innerText = `${company}`;
  div.appendChild(h2);
  div.appendChild(p1);
  div.appendChild(p2);
  div.appendChild(p3);
  return div;
}

const menuListHtml = (courses: Course[]): string => {
  let html = `<div class="menu-daily">
                <ul>`;
  courses.forEach((course: Course) => {
    const {name, diets, price} = course;
    html += `
          <li class="menu-item">
            <div class="menu-item-name">
              <p>${name}</p>
              <p>${diets ?? ' - '}</p></div>
            <div class="menu-item-price"><p>${price ?? ' - '}</p></div>
          </li>
    `;
  });
  html += `</ul></div>`;
  return html;
}

const restaurantModal = (restaurant: Restaurant, menu: Menu, menuWeekly: MenuWeekly): string => {
  const {name, address, city, postalCode, phone, company} = restaurant;
  let html = `<div><h3>${name}</h3>
    <div class="restaurant-info"><p><span>Yritys: </span>${company}</p>
    <p><span>Osoite: </span>${address} ${postalCode} ${city}</p>
    <p><span>Puhelinnumero: </span>${phone}</p></div></div>
    <div class="filter-button">
      <button id="menu-daily">Päivittäinen menu</button>
      <button id="menu-weekly">Viikon menu</button></div>
    `;
  html += menuListHtml(menu.courses);

  html += `<div class="menu-weekly">
  `;
  menuWeekly.days.forEach((dayMenu) => {
    const {date, courses} = dayMenu;
    html += `<h3>${date}</h3>`;
    html += menuListHtml(courses);
  });
  html += `</div>`;
  return html;
};

const errorModal = (message: string) => {
  const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
  return html;
};

export {restaurantRow, restaurantModal, errorModal, restaurantItem};
