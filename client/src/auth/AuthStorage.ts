export function saveLogin(){

  localStorage.setItem(
    "inventory_login",
    "true"
  )

}


export function isLogin(){

  return (
    localStorage.getItem(
      "inventory_login"
    ) === "true"
  )

}


export function logout(){

  localStorage.removeItem(
    "inventory_login"
  )

}
