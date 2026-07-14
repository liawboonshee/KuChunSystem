import {useState} from "react"
import Login from "./auth/Login"
import {isLogin, saveLogin} from "./auth/AuthStorage"
import AppShell from './shell/AppShell'

export default function App() {
const [login,setLogin]=useState(
  isLogin()
)


if(!login){

  return (

    <Login

      onSuccess={()=>{
        saveLogin()
        setLogin(true)
      }}

    />

  )

}  return <AppShell />
}
