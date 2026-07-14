import {useState} from "react"
import {validatePassword} from "./Password"
import {saveLogin} from "./AuthStorage"


export default function Login(
{
onLogin
}:{
onLogin:()=>void
}){


const [password,setPassword]=useState("")



function login(){


if(validatePassword(password)){


saveLogin()

onLogin()


}else{


alert("密码错误")

}


}



return (

<div
style={{
height:"100vh",
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
gap:"20px"
}}
>

<h2>
库存宝
</h2>


<input

type="password"

maxLength={4}

placeholder="4位密码"

value={password}

onChange={
e=>setPassword(e.target.value)
}

/>


<button onClick={login}>
登录
</button>


</div>

)

}
