import { AuthErrorCodes } from 'firebase/auth';

export const txtEmail = document.querySelector('#txtEmail')
export const txtPassword = document.querySelector('#txtPassword')

export const btnLogin = document.querySelector('#btnLogin')
export const btnSignup = document.querySelector('#btnSignup')

export const btnLogout = document.querySelector('#btnLogout')

export const divAuthState = document.querySelector('#divAuthState')
export const lblAuthState = document.querySelector('#lblAuthState')

export const divLoginError = document.querySelector('#divLoginError')
export const lblLoginErrorMessage = document.querySelector('#lblLoginErrorMessage')

const app = document.getElementById('app')

export const showLoginForm = () => {
  login.style.display = 'block'
  app.style.display = 'none'  
}

export const showApp = () => {
  login.style.display = 'none'
  app.style.display = 'block'
}

export const hideLoginError = () => {
  divLoginError.style.display = 'none'
  lblLoginErrorMessage.innerHTML = ''
}


export const showLoginError = (error) => {
  divLoginError.style.display = 'block'
  if (error.code == AuthErrorCodes.INVALID_PASSWORD) {
    lblLoginErrorMessage.innerHTML = `Wrong password. Try again.`
  }
  else {
    lblLoginErrorMessage.innerHTML = `Error: ${error.message}`      
  }
}

export const showLoginState = (user) => {
  const authstate = `You're logged in as ${user.userName} (uid: ${user.uid}, email: ${user.email}) `
  console.log(authstate)
}

export function detectAndRedirectMobile() {
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && window.location.href.indexOf("mobile.html") == -1) {
    console.log("Mobile");
    window.location.href = "/mobile.html";
  }
}

hideLoginError()
