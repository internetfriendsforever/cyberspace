import React from 'react'

export default function Login ({ error }) {
  return (
    <form action='/login' method='post'>
      {error && <p>{error.message}</p>}
      <input type='text' name='username' placeholder='username' />
      <input type='password' name='password' placeholder='password' />
      <input type='hidden' name='redirectTo' value='/profile' />
      <input type='submit' />
    </form>
  )
}
