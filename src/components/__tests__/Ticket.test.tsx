import { render, screen } from '@testing-library/react'
import { Ticket } from '../ticket'
import { describe, it, expect } from 'vitest'

describe('Ticket Component', () => {
  const mockBooking = {
    id: 'TICKET-123',
    startTime: new Date('2025-12-25T10:00:00'),
    endTime: new Date('2025-12-25T11:00:00'),
    seatNumber: null,
    pickupStop: null,
    dropoffStop: null,
    guestCount: null,
    specialRequests: null,
    facility: {
      name: 'Test Hall',
      type: 'PHYSICAL',
      startLocation: null,
      endLocation: null
    },
    user: {
      name: 'John Doe',
      email: 'john@test.edu',
      studentId: 'STU-001'
    }
  }

  const mockProps = {
    booking: mockBooking,
    universityName: 'Test University',
    universityLogo: null,
    primaryColor: '#000000'
  }

  it('renders ticket details correctly', () => {
    render(<Ticket {...mockProps} />)
    expect(screen.getByText('Test Hall')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('TICKET-1')).toBeInTheDocument() // Component substrings ID
    expect(screen.getByText('Test University')).toBeInTheDocument()
  })

  it('renders QR code', () => {
    render(<Ticket {...mockProps} />)
    expect(screen.getByAltText('QR Code')).toBeInTheDocument()
  })

  it('renders transport details correctly', () => {
    const transportBooking = {
        ...mockBooking,
        facility: {
            name: 'Shuttle Bus',
            type: 'TRANSPORT',
            startLocation: 'North Campus',
            endLocation: 'South Campus'
        },
        pickupStop: 'Stop A',
        dropoffStop: 'Stop B'
    }
    
    render(<Ticket {...mockProps} booking={transportBooking} />)
    const stoElements = screen.getAllByText('STO')
    expect(stoElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Stop A')).toBeInTheDocument()
    expect(screen.getByText('Stop B')).toBeInTheDocument()
  })
})
