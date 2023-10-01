import {errorModal, restaurantModal, restaurantRow} from './components';
import {fetchData} from './functions';
import { Menu } from './interfaces/Menu';
import { Restaurant } from './interfaces/Restaurant';
import {apiUrl, positionOptions} from './variables';

const modal = document.querySelector('dialog') as HTMLDialogElement | null;
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number=>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants: Restaurant[]) => {
  const table = document.querySelector<HTMLTableElement>('table');
  if (table !== null) {
    table.innerHTML = '';
    restaurants.forEach((restaurant) => {
      const tr: HTMLTableRowElement = restaurantRow(restaurant);
      table.appendChild(tr);
      tr.addEventListener('click', async () => {
        try {
          // remove all highlights
          const allHighs = document.querySelectorAll('.highlight');
          allHighs.forEach((high) => {
            high.classList.remove('highlight');
          });
          // add highlight
          tr.classList.add('highlight');
          // add restaurant data to modal
          modal.innerHTML = '';

          // fetch menu
          const menu: Menu = await fetchData(
            apiUrl + `/restaurants/daily/${restaurant._id}/fi`
          );
          console.log(menu);

          const menuHtml = restaurantModal(restaurant, menu);
          modal.insertAdjacentHTML('beforeend', menuHtml);

          modal.showModal();
        } catch (error) {
          modal.innerHTML = errorModal((error as Error).message);
          modal.showModal();
        }
      });
    });
  }

};

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
    console.log(restaurants);
    restaurants.sort((a: Restaurant, b: Restaurant) => {
      const x1: number = crd.latitude;
      const y1: number = crd.longitude;
      const x2a: number = a.location.coordinates[1];
      const y2a: number = a.location.coordinates[0];
      const distanceA: number = calculateDistance(x1, y1, x2a, y2a);
      const x2b: number = b.location.coordinates[1];
      const y2b: number = b.location.coordinates[0];
      const distanceB: number = calculateDistance(x1, y1, x2b, y2b);
      return distanceA - distanceB;
    });
    createTable(restaurants);
    // buttons for filtering
    const sodexoBtn = document.querySelector('#sodexo') as HTMLButtonElement | null;
    const compassBtn = document.querySelector('#compass') as HTMLButtonElement | null;
    const resetBtn = document.querySelector('#reset') as HTMLButtonElement | null;


    if (!sodexoBtn || !compassBtn || !resetBtn) {
      throw new Error('Button not found');
    }
    sodexoBtn.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants);
    });

    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants);
    });

    resetBtn.addEventListener('click', () => {
      createTable(restaurants);
    });
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);
