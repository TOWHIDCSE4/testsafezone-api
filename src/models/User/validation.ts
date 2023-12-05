import {
  checkIfUserDoesntExistWithUsername,
  checkIfUserDoesntExistWithEmail,
} from '@/modules/core';

const regexUsername: RegExp = /^[A-Za-z0-9_]+$/;
// const regexEmail: RegExp = /^[A-Z0-9_]+@[A-Z0-9]+\.[A-Z]{2,}$/i;

export const validation = async (username, email, password) => {
  if (!username || !email || !password) {
    return 'Username or email or password is not provided';
  }

  const validUsername: boolean = regexUsername.test(username);
  // const validEmail: boolean = regexEmail.test(email);

  if (!validUsername) {
    return 'Vui lòng nhập đúng định dạng tên đăng nhập';
  }

  // if (!validEmail)
  //   return error({
  //     message: 'Vui lòng nhập đúng định dạng email',
  //   });

  if (!(await checkIfUserDoesntExistWithUsername(username, password))) {
    return 'Tên đăng nhập đã tồn tại';
  }

  if (!(await checkIfUserDoesntExistWithEmail(email, password))) {
    return 'Email đã tồn tại';
  }

  return '';
};
