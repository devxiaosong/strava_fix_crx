import { useState } from "react"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from "plasmo"
import { ConfigProvider, Button } from "antd"
import { BulkEditModal } from "~components/bulk-edit/BulkEditModal"

// Import Ant Design styles
import antdStyles from "data-text:antd/dist/reset.css"

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdStyles
  return style
}

// Configure Content Script
export const config: PlasmoCSConfig = {
  matches: ["https://www.strava.com/athlete/training*"],
  run_at: "document_end"
  // Removed world: "MAIN" to use isolated extension environment, avoiding importScripts error
}

// Define mount position - after search panel
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  // Wait for page to load
  await new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const filterPanel = document.querySelector(".search .panel")
      if (filterPanel) {
        clearInterval(checkInterval)
        resolve(filterPanel)
      }
    }, 100)

    // Timeout protection
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve(null)
    }, 5000)
  })

  return document.querySelector(".search .panel")
}

// Configure Shadow DOM ID
export const getShadowHostId = () => "strava-bulk-edit-extension"

// Main component
const StravaBulkEditContent = () => {
  const [bulkEditOpen, setBulkEditOpen] = useState(false)

  return (
    <ConfigProvider>
      <div style={{ margin: '16px 0' }}>
        <Button 
          type="primary"
          block
          size="large"
          onClick={() => setBulkEditOpen(true)}
        >
          ⚡ Bulk Edit
        </Button>
      </div>
      
      <BulkEditModal 
        open={bulkEditOpen} 
        onClose={() => setBulkEditOpen(false)} 
      />
    </ConfigProvider>
  )
}

export default StravaBulkEditContent

