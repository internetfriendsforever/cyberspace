import { Component } from 'react'

export default class Logout extends Component {
  state = {
    error: null
  }

  componentDidMount () {
    if (this.props.authentication) {
      window.fetch('/logout').then(res => {
        this.props.navigate('/logout')
      }).catch(error => {
        this.setState({ error })
      })
    }
  }

  render () {
    const { error } = this.state
    const { authentication } = this.props

    if (error) {
      return `There was a problem logging you out: ${error.message}`
    }

    if (authentication) {
      return 'Logging out…'
    }

    return 'You are logged out'
  }
}
