import { Menu } from "./interfaces/Menu";
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

const restaurantModal = (restaurant: Restaurant, menu: Menu): string => {
  const {name, address, city, postalCode, phone, company} = restaurant;
  let html = `<h3>${name}</h3>
    <p>${company}</p>
    <p>${address} ${postalCode} ${city}</p>
    <p>${phone}</p>
    <table>
      <tr>
        <th>Course</th>
        <th>Diet</th>
        <th>Price</th>
      </tr>
    `;
  menu.courses.forEach((course) => {
    const {name, diets, price} = course;
    html += `
          <tr>
            <td>${name}</td>
            <td>${diets ?? ' - '}</td>
            <td>${price ?? ' - '}</td>
          </tr>
          `;
  });
  html += '</table>';
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
