/**
 * Focus Trap — traps focus within modal for accessibility (WCAG 2.1)
 * Supports Tab, Shift+Tab, Escape key handling
 * @module FocusTrap
 */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]'
].join(', ')

export class FocusTrap {
  constructor(options = {}) {
    this.active = false
    this.element = null
    this.previousFocus = null
    this.onEscape = options.onEscape || null
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  /**
   * Activate focus trap on an element
   * @param {HTMLElement} element - Container element to trap focus within
   */
  activate(element) {
    if (!element || typeof document === 'undefined') return

    this.element = element
    this.previousFocus = document.activeElement
    this.active = true

    // Set aria attributes
    element.setAttribute('role', 'dialog')
    element.setAttribute('aria-modal', 'true')

    // Add keyboard listener
    document.addEventListener('keydown', this._handleKeyDown)

    // Focus first focusable element
    requestAnimationFrame(() => {
      const first = this._getFirstFocusable()
      if (first) {
        first.focus()
      } else {
        element.setAttribute('tabindex', '-1')
        element.focus()
      }
    })
  }

  /**
   * Deactivate focus trap and restore previous focus
   */
  deactivate() {
    if (!this.active) return

    this.active = false
    document.removeEventListener('keydown', this._handleKeyDown)

    // Restore previous focus
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus()
    }

    this.element = null
    this.previousFocus = null
  }

  _handleKeyDown(event) {
    if (!this.active || !this.element) return

    // Escape key
    if (event.key === 'Escape') {
      event.preventDefault()
      if (this.onEscape) {
        this.onEscape()
      }
      return
    }

    // Tab key — trap focus
    if (event.key === 'Tab') {
      const focusables = this._getFocusableElements()
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey) {
        // Shift+Tab — go to last element if on first
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        // Tab — go to first element if on last
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
  }

  _getFocusableElements() {
    if (!this.element) return []
    return Array.from(this.element.querySelectorAll(FOCUSABLE_SELECTORS))
      .filter(el => {
        return !el.hasAttribute('disabled') &&
               !el.getAttribute('aria-hidden') &&
               el.offsetParent !== null // visible check
      })
  }

  _getFirstFocusable() {
    const elements = this._getFocusableElements()
    return elements[0] || null
  }

  destroy() {
    this.deactivate()
  }
}
