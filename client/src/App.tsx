import {useState} from "react"
import Login from "./auth/Login"
import {isLogin} from "./auth/AuthStorage"
import AppShell from './shell/AppShell'

export default function App() {
const [login,setLogin]=useState(
  isLogin()
)


if(!login){

  return (

    <Login

      onLogin={()=>{
        setLogin(true)
      }}

    />

  )

}  return <AppShell />
}
