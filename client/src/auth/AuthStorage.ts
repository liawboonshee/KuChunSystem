const KEY = "inventory_password"


export function getPassword(){

  return localStorage.getItem(KEY)

}



export function setPassword(password:string){

  localStorage.setItem(
    KEY,
    password
  )

}



export function hasPassword(){

  return !!getPassword()

}



export function checkPassword(password:string){

  return getPassword() === password

}
