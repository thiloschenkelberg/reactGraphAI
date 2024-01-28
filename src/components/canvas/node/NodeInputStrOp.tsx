import { Select } from "@mantine/core"
import { RefObject, useEffect, useRef, useState } from "react"
import { Operator } from "../types/canvas.types"

interface NodeInputStrOpProps {
  handleOpChange: (id: string, operator: string | null) => void
  handleValChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleBlur: () => void
  id: string
  opReference: RefObject<HTMLInputElement>
  valReference: RefObject<HTMLInputElement>
  defaultOp: Operator | undefined
  defaultVal: string | undefined
  autoFocus: boolean
  zIndex: number
}

export default function NodeInputStrOp(props: NodeInputStrOpProps) {
  const {
    handleOpChange,
    handleValChange,
    handleKeyUp,
    handleBlur,
    id,
    opReference,
    valReference,
    defaultOp,
    defaultVal,
    autoFocus,
    zIndex
  } = props
  const [selectOpen, setSelectOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const placeholder = id.charAt(0).toUpperCase() + id.slice(1)

  const toggleSelectOpen = () => {
    if (selectOpen) {
      setTimeout(() => {
        // setSelectOpen(false)
      }, 100)
    } else {
      setSelectOpen(true)
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log("tessst")
    }

    console.log("tessst")

    const dropdown = dropdownRef.current
    if (!dropdown) return

    dropdown.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      dropdown.removeEventListener("wheel", handleWheel)
    }
  }, [dropdownRef])

  return (
    <>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginTop: 8,
      }}
    >
      <Select
        ref={opReference}
        onChange={(e) => handleOpChange(id, e)}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        placeholder="---"
        defaultValue={defaultOp}
        data={SELECT_DATA}
        allowDeselect
        onDropdownOpen={toggleSelectOpen}
        onDropdownClose={toggleSelectOpen}
        maxDropdownHeight={Infinity}
        style={{
          width: "25%",
          borderRight: "none",
          zIndex: zIndex,
          filter: "drop-shadow(1px 1px 1px #111",
        }}
      />
      {selectOpen && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#ff0000",
            width: 200,
            height: 266,
            display: "block",
            position: "absolute",
          }}
        />
      )}
      <input
        ref={valReference}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultVal}
        onChange={(e) => handleValChange(id, e)}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        style={{
          width: "calc(75% - 8px)",
          marginLeft: 8,
          zIndex: zIndex,
        }}
      />
    </div>
    </>
  )
}

const SELECT_DATA: { value: string; label: string }[] = [
  { value: "<", label: "<" },
  { value: "<=", label: "\u2264" },
  { value: "=", label: "=" },
  { value: "!=", label: "\u2260" },
  { value: ">=", label: "\u2265" },
  { value: ">", label: ">" },
]