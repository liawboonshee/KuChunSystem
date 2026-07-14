export function validatePassword(
  password:string
){

  return /^\d{4}$/.test(password)

}
