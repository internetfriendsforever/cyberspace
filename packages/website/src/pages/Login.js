import React, { Component } from 'react'

export default class Login extends Component {
  static defaultProps = {
    redirectTo: '/profile'
  }

  state = {
    error: null
  }

  onSubmit = e => {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)
    const keys = Array.from(data.keys())
    const pairs = keys.map(key => [key, data.get(key)])

    window.fetch(form.action, {
      method: form.method,
      body: new URLSearchParams(pairs)
    }).then(res => {
      this.props.navigate(res.url)
    }).catch(error => {
      this.setState({ error })
    })
  }

  render () {
    const error = this.props.error || this.state.error

    return (
      <form action='/login' method='post' onSubmit={this.onSubmit}>
        {error && <p>{error.message}</p>}
        <input type='text' name='username' placeholder='username' />
        <input type='password' name='password' placeholder='password' />
        <input type='hidden' name='redirectTo' value={this.props.redirectTo} />
        <input type='submit' />
      </form>
    )
  }
}
