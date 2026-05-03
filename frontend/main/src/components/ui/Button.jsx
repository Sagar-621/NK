import { forwardRef } from 'react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 cursor-pointer select-none'
  
  const variants = {
    primary: 'bg-primary text-white btn-3d hover:bg-primary-dark',
    ghost: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10 hover:translate-y-[-1px]',
    dark: 'bg-navy text-white hover:translate-y-[-2px] shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
