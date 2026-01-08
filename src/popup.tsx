
import { useState } from "react"

import "./style.css"

function IndexPopup() {
  const [count, setCount] = useState(0)

  return (
    <div className="popup-container">s
      <div className="content">
        <p>欢迎使用 Plasmo + Antd 构建的 Chrome 插件！</p>
      </div>
    </div>
  )
}

export default IndexPopup

