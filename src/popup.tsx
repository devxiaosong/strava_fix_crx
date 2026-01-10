
import { useState } from "react"

import "./style.css"

function IndexPopup() {
  const [count, setCount] = useState(0)

  return (
    <div className="popup-container">
      <div className="content">
        <p>Welcome to Strava Bulk Edit Extension!</p>
      </div>
    </div>
  )
}

export default IndexPopup

