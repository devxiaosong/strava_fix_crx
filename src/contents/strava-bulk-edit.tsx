import { useState, useEffect } from "react"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from "plasmo"
import { ConfigProvider } from "antd"
import { BulkEditModal } from "~components/bulk-edit/BulkEditModal"
import { SELECTORS } from "~/config/selectors"
import { initApiListener, debugCache } from "~/core/apiListener"

// Import Ant Design styles
import antdStyles from "data-text:antd/dist/reset.css"

const customStyles = `
@keyframes gradientRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.bulk-edit-button-wrapper {
  position: relative;
  display: inline-flex;
  width: 140px;
  height: 40px;
  margin: 16px 0;
  padding: 0;
  overflow: hidden;
  border-radius: 20px;
  cursor: pointer;
  box-sizing: border-box;
}

.bulk-edit-button-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: conic-gradient(
    from 180deg,
    rgb(101, 63, 244) -64deg,
    rgb(26, 235, 147) 40deg,
    rgb(178, 255, 205) 120deg,
    rgb(24, 172, 255) 165deg,
    rgb(255, 239, 91) 200deg,
    rgb(253, 50, 184) 265deg,
    rgb(255, 181, 230) 315deg,
    rgb(101, 63, 244) 376deg
  );
  animation: gradientRotate 9s linear infinite;
  opacity: 1;
}

.bulk-edit-button-wrapper:hover .bulk-edit-button-bg {
  opacity: 0;
}

.bulk-edit-button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  margin: 2px;
  padding: 0 12px;
  border-radius: 18px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  box-sizing: border-box;
  white-space: nowrap;
}

.bulk-edit-button-wrapper:hover .bulk-edit-button-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bulk-edit-button-icon {
  margin-right: 6px;
  font-size: 16px;
}

.bulk-edit-button-wrapper:hover .bulk-edit-button-icon {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}
`

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = antdStyles + customStyles
  return style
}

// Configure Content Script
export const config: PlasmoCSConfig = {
  matches: ["https://www.strava.com/athlete/training*"],
  run_at: "document_end",
  world: "MAIN"  // Removed world: "MAIN" to use isolated extension environment, avoiding importScripts error
}

// Define mount position - after search panel
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  // Wait for page to load
  await new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // 使用集中管理的 XPath 选择器
      const result = document.evaluate(
        SELECTORS.PAGE.FILTER_PANEL,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      )
      const filterPanel = result.singleNodeValue
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

  // 使用集中管理的 XPath 选择器
  const result = document.evaluate(
    SELECTORS.PAGE.FILTER_PANEL,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )
  return result.singleNodeValue as Element
}

// Configure Shadow DOM ID
export const getShadowHostId = () => "strava-bulk-edit-extension"

// Main component
const StravaBulkEditContent = () => {
  const [bulkEditOpen, setBulkEditOpen] = useState(false)

  // 在组件挂载时初始化 API 监听器
  useEffect(() => {
    console.log('[StravaBulkEdit] 初始化 API 监听器...')
    
    // 立即安装监听器，开始拦截所有 API 请求
    initApiListener()
    
    console.log('[StravaBulkEdit] API 监听器已启动，将自动缓存所有 API 响应')
    
    // 5秒后打印缓存调试信息
    const debugTimer = setTimeout(() => {
      debugCache()
    }, 5000)

    // 清理函数（可选，因为监听器设计为持续运行）
    return () => {
      clearTimeout(debugTimer)
      console.log('[StravaBulkEdit] 组件卸载（监听器继续运行）')
    }
  }, [])

  return (
    <ConfigProvider>
      {!bulkEditOpen && (
        <div 
          className="bulk-edit-button-wrapper"
          onClick={() => setBulkEditOpen(true)}
        >
          <div className="bulk-edit-button-bg" />
          <div className="bulk-edit-button-content">
            <span className="bulk-edit-button-icon">⚡</span>
            <span>Bulk Edit</span>
          </div>
        </div>
      )}
      
      <BulkEditModal 
        open={bulkEditOpen} 
        onClose={() => setBulkEditOpen(false)} 
      />
    </ConfigProvider>
  )
}

export default StravaBulkEditContent

