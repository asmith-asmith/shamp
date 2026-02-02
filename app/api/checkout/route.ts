import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CheckoutRequest {
  items: CartItem[]
  customerName: string
  customerEmail: string
  shippingAddress: string
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json()
    const { items, customerName, customerEmail, shippingAddress } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing customer information' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingCost = subtotal >= 5000 ? 0 : 500
    const total = subtotal + shippingCost

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            images: [],
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const stripe = getStripe()

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        customerName,
        shippingAddress,
        items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price }))),
      },
    })

    // Create order in database with PENDING status
    await prisma.order.create({
      data: {
        customerEmail,
        customerName,
        shippingAddress,
        total,
        stripeSessionId: session.id,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
