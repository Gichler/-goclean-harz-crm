import React from 'react'

export const DialogContext = React.createContext({ open: false, setOpen: () => {} })

export const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export const DialogTrigger = ({ asChild, children }) => {
  const { setOpen } = React.useContext(DialogContext)
  const child = React.Children.only(children)
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      onClick: (e) => {
        child.props.onClick && child.props.onClick(e)
        setOpen && setOpen(true)
      },
    })
  }
  return (
    <button onClick={() => setOpen && setOpen(true)}>{children}</button>
  )
}

export const DialogContent = ({ className = '', children }) => {
  const { open, setOpen } = React.useContext(DialogContext)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => setOpen && setOpen(false)} />
      <div className={`relative z-10 bg-white rounded-lg border shadow-lg p-6 w-full max-w-lg ${className}`}>
        {children}
      </div>
    </div>
  )
}

export const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
)

export const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
)

export const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
)

export default Dialog

