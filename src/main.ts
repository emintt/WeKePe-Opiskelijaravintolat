import { errorModal, restaurantModal, restaurantRow, restaurantItem } from "./components";
import { fetchData } from "./functions";
import { Menu } from "./interfaces/Menu";
import { Restaurant } from "./interfaces/Restaurant";
import { apiUrl, positionOptions } from "./variables";

const modal = document.querySelector('dialog') as HTMLDialogElement | null;
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number=>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createRestaurants = (restaurants: Restaurant[]) => {
  const wrapper = document.querySelector('.restaurant-list-wrapper') as HTMLElement | null;
  console.log(wrapper);
  if (wrapper !== null) {
    wrapper.innerHTML = '';
    restaurants.forEach((restaurant) => {
      const div: HTMLDivElement = restaurantItem(restaurant, 0);
      wrapper.appendChild(div);
    });
  }

}

const createTable = (restaurants: Restaurant[]) => {
  const table = document.querySelector<HTMLTableElement>('table') as HTMLTableElement | null;
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
    console.log(crd);
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
    // createTable(restaurants);
    createRestaurants(restaurants);
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
