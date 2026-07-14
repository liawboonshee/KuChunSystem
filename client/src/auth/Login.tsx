import {useState} from "react"
import {
getPassword,
setPassword,
checkPassword
}
from "./AuthStorage"

import {
validatePassword
}
from "./Password"



export default function Login(
{
onSuccess
}
:
{
onSuccess:()=>void
}
){


const first =
!getPassword()



const [pwd,setPwd]=useState("")

const [confirm,setConfirm]=useState("")

const [error,setError]=useState("")





function submit(){


if(!validatePassword(pwd)){

setError(
"请输入4位数字密码"
)

return

}



if(first){


if(pwd!==confirm){

setError(
"两次密码不一样"
)

return

}


setPassword(pwd)

onSuccess()

return

}



if(checkPassword(pwd)){


onSuccess()


}else{


setError(
"密码错误"
)

}


}




return (

<div>

<h2>
库存系统
</h2>


<h3>
{
first
?
"设置4位密码"
:
"请输入密码"
}
</h3>



<input

type="password"

maxLength={4}

value={pwd}

onChange={
e=>setPwd(e.target.value)
}

placeholder="4位数字"

/>



{
first &&
<input

type="password"

maxLength={4}

value={confirm}

onChange={
e=>setConfirm(e.target.value)
}

placeholder="确认密码"

/>

}



<button
onClick={submit}
>
进入
</button>


<p>
{error}
</p>


</div>

)

}
