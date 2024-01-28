import { RefObject, useEffect } from "react"

interface NodeInputStrProps {
  handleChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void 
  handleKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleBlur: () => void
  id: string
  reference: RefObject<HTMLInputElement>
  defaultValue: string | undefined
  autoFocus: boolean
  add: boolean
  zIndex: number
}

export default function NodeInputStr(props: NodeInputStrProps) {
  const {
    handleChange,
    handleKeyUp,
    handleBlur,
    id,
    reference,
    defaultValue,
    autoFocus,
    add,
    zIndex
  } = props

  const handleBlur2 = () => {

  }

  const placeholder = id.charAt(0).toUpperCase() + id.slice(1)

  return (
    <input
      ref={reference}
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(e) => handleChange(id, e)} // write nodeName state
      onKeyUp={handleKeyUp} // confirm name with enter
      onBlur={handleBlur}
      autoFocus={autoFocus}
      style={{
        marginTop: add ? 8 : 0,
        zIndex: zIndex,
      }}
    />
  )
}