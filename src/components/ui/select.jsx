import React, { useState } from 'react'

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false)
  const handleSelect = (val) => {
    onValueChange && onValueChange(val)
    setOpen(false)
  }
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { open, onSelect: handleSelect, value })
        }
        return child
      })}
    </div>
  )
}

export const SelectTrigger = ({ children, className = '', onClick }) => (
  <button type="button" onClick={onClick} className={`w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-left bg-white ${className}`}>
    {children}
  </button>
)

export const SelectValue = ({ placeholder, value }) => (
  <span className="text-sm text-gray-700">{value || placeholder}</span>
)

export const SelectContent = ({ children, open }) => {
  if (!open) return null
  return (
    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow">
      <div className="max-h-60 overflow-auto py-1">{children}</div>
    </div>
  )
}

export const SelectItem = ({ children, value, onClick }) => (
  <div
    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    onClick={() => onClick && onClick(value)}
    role="option"
  >
    {({ onSelect }) => (
      <div onClick={() => onSelect && onSelect(value)}>{children}</div>
    )}
  </div>
)

export default Select

