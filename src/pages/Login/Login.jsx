import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase'

const Login = () => {

  const [currState, setCurrState] = useState("Sign Up")
  const [username, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = (event) => {
    event.preventDefault();
    console.log(event.target[0].value)
    console.log(currState)
    if (currState === "Sign Up") {
      console.log(" I m calling signup function")
      signup(username, email, password)
    } else {
      login(email, password)
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currState}</h2>
        {currState === "Sign Up" ? <input onChange={(e) => setUserName(e.target.value)} value={username} type="text" placeholder='username' className='form-input' required /> : null}
        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className='form-input' required />
        <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' className='form-input' required />

        {/**----------------SUBMIT------------ */}
        <button type='submit'>{currState === "Sign Up" ? "Create Account" : "Login Now"}</button>


        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the term of use & privacyy policy</p>
        </div>
        <div className="login-forgot">
          {
            currState === "Sign Up"
              ? <p className='login-toggle'>Already have an account <span onClick={() => setCurrState("Login")}>Login Here</span></p>
              : <p className='login-toggle'>Create an account <span onClick={() => setCurrState("Sign Up")}>Click Here</span></p>
          }

          {currState==="Login"?<p className='login-toggle'>Forgot Password?<span onClick={() => resetPass(email)}>Reset here</span></p>:null
          }
        </div>
      </form>
    </div>
  )
}

export default Login