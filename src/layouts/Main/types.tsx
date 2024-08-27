import React from 'react'

export type LayoutProps = {
  component: React.ComponentType<any>
  pageTitle?: string
  background?: string
  backgroundPosition?: 'bottom' | 'center' | 'left' | 'right'
}
