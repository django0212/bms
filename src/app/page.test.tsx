import { render, screen } from '@testing-library/react'
import LandingPage from './page'
import { describe, it, expect, vi } from 'vitest'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // Filter out boolean props that shouldn't be passed to img
    const { fill, priority, ...rest } = props
    return <img {...rest} />
  }
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: (props: any) => <a {...props}>{props.children}</a>
}))

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    expect(screen.getByText(/Campus Facility Management/i)).toBeInTheDocument()
    expect(screen.getByText(/Reimagined/i)).toBeInTheDocument()
  })

  it('renders the Get Started button', () => {
    render(<LandingPage />)
    // There are multiple "Get Started" buttons, so we check for at least one
    const buttons = screen.getAllByText(/Get Started/i)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders the Features section', () => {
    render(<LandingPage />)
    expect(screen.getByText(/Powerful Features/i)).toBeInTheDocument()
    expect(screen.getByText(/Smart Scheduling/i)).toBeInTheDocument()
  })
})
