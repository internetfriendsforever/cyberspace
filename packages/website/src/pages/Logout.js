import { Component } from 'react'

export default class Logout extends Component {
  state = {
    error: null
  }

  componentDidMount () {
    if (this.props.user) {
      window.fetch('/logout').then(res => {
        this.props.navigate('/logout')
      }).catch(error => {
        this.setState({ error })
      })
    }
  }

  render () {
    const { error } = this.state
    const { user } = this.props

    if (error) {
      return `There was a problem logging you out: ${error.message}`
    }

    if (user) {
      return 'Logging out…'
    }

    return 'You are logged out'
  }
}
