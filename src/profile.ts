import { fetchData } from "./functions";
import { UpdateResult } from "./interfaces/UpdateResult";
import { UpdateUser, User } from "./interfaces/User";
import { apiUrl } from "./variables";


// select form from the DOM
const profileForm = document.querySelector('#profile-form');
// select inputs from the DOM
// const profileUsernameInput = document.querySelector(
//     '#profile-username'
// ) as HTMLInputElement | null;
// const profileEmailInput = document.querySelector(
//     '#profile-email'
// ) as HTMLInputElement | null;
const profilePasswordInput = document.querySelector(
    '#profile-password'
) as HTMLInputElement | null;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');


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

// TODO: function to add userdata (email, username) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
    if (!usernameTarget || !emailTarget) {
      return;
    }
    usernameTarget.innerHTML = user.username;
    emailTarget.innerHTML = user.email;
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

// function to check local storage for token and if it exists fetch
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

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
profileForm?.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    if (!profilePasswordInput) {
      return;
    }
    const user = {
      password: profilePasswordInput.value
    }
    const token = localStorage.getItem('token');
    if(!token) {
      return;
    }
    const updatedUserData = await updateUserData(user, token);
    console.log(updatedUserData);
    checkToken();
});

