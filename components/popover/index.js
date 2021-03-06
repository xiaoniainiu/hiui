import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import Popper from '../popper'
import './style/index'

export default class Popover extends Component {
  unbindHover = true

  static defaultProps = {
    trigger: 'click',
    placement: 'top',
    width: 'auto'
  }

  static propTypes = {
    placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    trigger: PropTypes.oneOf(['click', 'focus', 'hover']),
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    content: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    width: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      showPopper: false
    }
    this.eventTarget = null
  }

  showPopper () {
    this.setState({
      showPopper: true
    })
  }
  hidePopper () {
    this.setState({
      showPopper: false
    })
  }
  delayHidePopper (e) {
    setTimeout(() => {
      if (this.eventTarget !== e.target && this.isInPopover()) return
      this.hidePopper()
    }, 200)
  }

  isInPopover () {
    const popper = this.refs.popper
    const bool = !this.element || this.element.contains(this.eventTarget) ||
            !this.reference || this.reference.contains(this.eventTarget) ||
            !popper || popper.contains(this.eventTarget)
    this.eventTarget = null
    return bool
  }

  componentDidMount () {
    const { trigger } = this.props

    this.element = ReactDOM.findDOMNode(this)
    this.reference = ReactDOM.findDOMNode(this.refs.reference)

    if (this.reference === null) return

    if (trigger === 'click') {
      this.reference.addEventListener('click', () => {
        if (this.state.showPopper) {
          this.hidePopper()
        } else {
          this.showPopper()
        }
      })

      document.addEventListener('click', (e) => {
        this.eventTarget = e.target
        if (this.isInPopover()) return

        this.hidePopper()
      })
    } else if (trigger === 'hover') {
      this.reference.addEventListener('mouseenter', e => {
        this.eventTarget = e.target
        this.showPopper()
      })
      this.reference.addEventListener('mouseleave', e => {
        this.delayHidePopper(e)
      })
    } else {
      this.reference.addEventListener('focus', this.showPopper.bind(this))
      this.reference.addEventListener('blur', this.hidePopper.bind(this))
    }
  }

  componentDidUpdate () {
    const { trigger } = this.props
    const popper = this.refs.popper

    if (popper && trigger === 'hover' && this.unbindHover) {
      this.unbindHover = false
      popper.addEventListener('mouseenter', e => {
        this.eventTarget = e.target
        // this.showPopper()
      })
      popper.addEventListener('mouseleave', e => {
        this.delayHidePopper(e)
      })
    }
  }

  render () {
    const { style, className, title, content, placement, width } = this.props
    const {
      showPopper
    } = this.state

    return (
      <div className={classNames(className, 'hi-popover')} style={style} ref={node => { this.popoverContainer = node }}>
        { React.cloneElement(React.Children.only(this.props.children), { ref: 'reference', tabIndex: '0' }) }

        <Popper
          className='hi-popover__popper'
          show={showPopper}
          attachEle={this.popoverContainer}
          placement={placement}
          zIndex={1040}
          width={width}
        >
          <div ref='popper' className={classNames('hi-popover-base', `hi-popover-${placement}`)}>
            { title && <div className='hi-popover__title'>{title}</div> }
            <div className='hi-popover__content'>
              { content }
            </div>
          </div>
        </Popper>
      </div>
    )
  }
}
