import { getDistance } from "geolib";
import { errorModal, restaurantModal, restaurantItem } from "./components";
import { fetchData } from "./functions";
import { Menu, MenuWeekly } from "./interfaces/Menu";
import { Restaurant } from "./interfaces/Restaurant";
import { apiUrl, positionOptions } from "./variables";


const modal = document.querySelector('dialog') as HTMLDialogElement | null;
if (!modal) {
  throw new Error('Modal not found');
}
// modal.addEventListener('click', () => {
//   modal.close();
// });


const createRestaurants = (restaurants: Restaurant[], crd: GeolocationCoordinates) => {
  const wrapper = document.querySelector('.restaurant-list-wrapper') as HTMLElement | null;
  if (wrapper !== null) {
    wrapper.innerHTML = '';
    restaurants.forEach((restaurant) => {
      const a = {latitude: crd.latitude, longitude: crd.longitude};
      const b = {latitude: restaurant.location.coordinates[1], longitude: restaurant.location.coordinates[0]}
      const distance =  getDistance(a, b, 1); // distance in meters from geolib
      const div: HTMLDivElement = restaurantItem(restaurant, distance);
      wrapper.appendChild(div);
      const h2 = div.querySelector('h2') as HTMLHeadingElement | null;
      if (h2 !== null) {
        h2.addEventListener('click', async () => {
          try {
            // remove all highlights
            const allHighs = document.querySelectorAll('.highlight');
            allHighs.forEach((high) => {
              high.classList.remove('highlight');
            });
            // add highlight
            h2.classList.add('highlight');
            // add restaurant data to modal
            modal.innerHTML = '';

            // fetch menu
            const menuDaily: Menu = await fetchData(
              apiUrl + `/restaurants/daily/${restaurant._id}/fi`
            );
            console.log(menuDaily);

            //fetch weekly menu
            const menuWeekly: MenuWeekly = await fetchData(apiUrl + `/restaurants/weekly/${restaurant._id}/fi`);
            console.log(menuWeekly);


            const menuDailyHtml = restaurantModal(restaurant, menuDaily, menuWeekly);
            modal.insertAdjacentHTML('beforeend', menuDailyHtml);

            const menuDailyBtn = document.querySelector('#menu-daily') as HTMLButtonElement | null;
            const menuWeeklyBtn = document.querySelector('#menu-weekly') as HTMLButtonElement | null;
            const menuDailyE = document.querySelector('.menu-daily') as HTMLElement | null;
            const menuWeeklyE = document.querySelector('.menu-weekly') as HTMLElement | null;
            if (!menuDailyBtn || !menuWeeklyBtn) {
              throw new Error('Button not found');
            }
            if (!menuDailyE || !menuWeeklyE) {
              throw new Error('Menu element not found');
            }
            menuWeeklyE.classList.add('hidden');
            menuWeeklyBtn.addEventListener('click', () => {
              menuDailyE.classList.add('hidden');
              menuWeeklyE.classList.remove('hidden');
            });
            menuDailyBtn.addEventListener('click', () => {
              menuDailyE.classList.remove('hidden');
              menuWeeklyE.classList.add('hidden');
            });

            modal.showModal();
          } catch (error) {
            modal.innerHTML = errorModal((error as Error).message);
            modal.showModal();
          }
        });
      }
    });
  }

}

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
    console.log(restaurants);

    // cities array for filtering restaurants
    const cities: string[] = [];
    restaurants.forEach((restaurant) => {
      const cityName = restaurant.city.toLowerCase();
      if (!cities.includes(cityName)) {
        cities.push(cityName);
      }
    });
    const citiesSorted = cities.sort();
    restaurants.sort((a: Restaurant, b: Restaurant) => {
      const hereCrd = {latitude: crd.latitude, longitude: crd.longitude};
      const aCrd = {latitude: a.location.coordinates[1],
        longitude: a.location.coordinates[0]};
      const bCrd = {latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0]};

      const distanceA: number = getDistance(hereCrd, aCrd, 1);
      const distanceB: number = getDistance(hereCrd, bCrd, 1);
      return distanceA - distanceB;
    });
    createRestaurants(restaurants, crd);
    // buttons for filtering
    const nearby = document.querySelector('#nearby') as HTMLButtonElement | null;
    const companyOptions = document.querySelector('select#company1') as HTMLSelectElement | null;
    const cityOptions = document.querySelector('#city') as HTMLSelectElement | null;

    if ( !nearby || !cityOptions
      || !companyOptions) {
      throw new Error('Button not found');
    }

    // create option elements for filtering by city
    citiesSorted.forEach((city) => {
      const cityOptionElement = document.createElement('option');
      cityOptionElement.setAttribute('value', city);
      cityOptionElement.innerText = city;
      cityOptions.appendChild(cityOptionElement);
    });

    // show restaurants according to the selected service provider
    companyOptions.addEventListener('change', () => {
      // console.log(companyOptions.value);
      if (companyOptions.value === 'sodexo') {
        const sodexoRestaurants = restaurants.filter(
          (restaurant) => restaurant.company === 'Sodexo'
        );
        console.log(sodexoRestaurants);
        createRestaurants(sodexoRestaurants, crd);
        cityOptions.value = 'kaupunki';
      } else if (companyOptions.value === 'compass') {
        const compassRestaurants = restaurants.filter(
          (restaurant) => restaurant.company === 'Compass Group'
        );
        console.log(compassRestaurants);
        createRestaurants(compassRestaurants, crd);
        cityOptions.value = 'kaupunki';
      } else if (companyOptions.value === 'palveluntarjoaja') {
        createRestaurants(restaurants, crd);
        cityOptions.value = 'kaupunki';
      }
    });

    // show restaurants according to the selected city
    cityOptions.addEventListener('change', () => {
      if (cityOptions.value === 'kaupunki') {
        createRestaurants(restaurants, crd);
        companyOptions.value = 'palveluntarjoaja';
      } else {
        console.log(cityOptions.value);
        const cityRestaurants = restaurants.filter(
          (restaurant) => restaurant.city.toLowerCase() === cityOptions.value
        );
        console.log(cityRestaurants);
        createRestaurants(cityRestaurants, crd);
        companyOptions.value = 'palveluntarjoaja';
      }

    });

    nearby.addEventListener('click', () => {
      createRestaurants(restaurants, crd);
      cityOptions.value = 'kaupunki';
      companyOptions.value = 'palveluntarjoaja';
    });


  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);




// login, update, upload
/* import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';

// PWA code

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector(
  '#username'
) as HTMLInputElement | null;
const passwordInput = document.querySelector(
  '#password'
) as HTMLInputElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement | null;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement | null;

const avatarInput = document.querySelector(
  '#avatar'
) as HTMLInputElement | null;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target');

// TODO: function to login
const login = async (user: {
  username: string,
  password: string
}): Promise<LoginUser> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user),
  }
  return await fetchData<LoginUser>(apiUrl + '/auth/login', options);
};

// TODO: function to upload avatar
const uploadAvatar = async (
  image: File,
  token: string
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('avatar', image);

  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token
    },
    body: formData,
  };
  return await fetchData(apiUrl + '/users/avatar', options);
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {

  const options: RequestInit = {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user),
  };
  return await fetchData<UpdateResult>(apiUrl + '/users', options);
};

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (!usernameTarget || !emailTarget || !avatarTarget || !profileEmailInput || !profileUsernameInput) {
    return;
  }
  usernameTarget.innerHTML = user.username;
  emailTarget.innerHTML = user.email;
  (avatarTarget as HTMLImageElement).src = uploadUrl + user.avatar;

  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const userData = await getUserData(token);
  addUserDataToDom(userData);
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data
loginForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!usernameInput || !passwordInput) {
    return;
  }
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
  };
  const loginData = await login(user);
  console.log(loginData);
  //alert(loginData.message);
  localStorage.setItem('token', loginData.token);
  addUserDataToDom(loginData.data);
});

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
profileForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();

  if (!profileUsernameInput || !profileEmailInput) {
    return;
  }
  const user = {
    username: profileUsernameInput.value,
    email: profileEmailInput.value,
  }
  const token = localStorage.getItem('token');
  if(!token) {
    return;
  }
  const updatedUserData = await updateUserData(user, token);
  console.log(updatedUserData);
  checkToken();
});

// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
avatarForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!avatarInput?.files) {
    return;
  }
  const image = avatarInput.files[0];
  console.log('avatarinput: ' + avatarInput.files[0]);

  const token = localStorage.getItem('token');
  if (!token) {
    return;
  };

  const avatarData = await uploadAvatar(image, token);
  console.log(avatarData);
  checkToken();

});
 */
