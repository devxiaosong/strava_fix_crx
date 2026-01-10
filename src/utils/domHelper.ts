/**
 * DOM 操作辅助工具
 * 封装常用的 DOM 操作，提供统一的接口和错误处理
 */

import { querySelector, querySelectorAll, SELECTORS } from '~/config/selectors'
import { CURRENT_DELAYS, delay } from '~/config/delays'

/**
 * 点击元素
 * 
 * @param selector - CSS选择器或元素本身
 * @param options - 点击选项
 * @returns 是否成功点击
 * 
 * @example
 * await clickElement(SELECTORS.BUTTON.NEXT_PAGE)
 */
export const clickElement = async (
  selector: string | Element,
  options?: {
    /** 点击后的延迟时间 */
    delay?: number
    /** 是否模拟人工点击（添加鼠标事件） */
    humanLike?: boolean
  }
): Promise<boolean> => {
  try {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector
    
    if (!element) {
      console.warn(`[DOM] 元素不存在: ${selector}`)
      return false
    }

    if (!(element instanceof HTMLElement)) {
      console.warn(`[DOM] 不是HTMLElement: ${selector}`)
      return false
    }

    // 模拟人工点击
    if (options?.humanLike) {
      const mouseEvents = ['mousedown', 'mouseup', 'click']
      for (const eventType of mouseEvents) {
        element.dispatchEvent(new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window
        }))
      }
    } else {
      element.click()
    }

    console.log(`[DOM] 点击成功: ${selector}`)

    // 点击后延迟
    if (options?.delay) {
      await delay(options.delay)
    }

    return true
  } catch (error) {
    console.error(`[DOM] 点击失败: ${selector}`, error)
    return false
  }
}

/**
 * 批量点击元素
 * 
 * @param selector - CSS选择器
 * @param options - 点击选项
 * @returns 成功点击的数量
 */
export const clickAll = async (
  selector: string,
  options?: {
    /** 每次点击间的延迟 */
    intervalDelay?: number
    /** 点击后的延迟 */
    delay?: number
  }
): Promise<number> => {
  try {
    const elements = document.querySelectorAll<HTMLElement>(selector)
    
    if (elements.length === 0) {
      console.warn(`[DOM] 没有找到元素: ${selector}`)
      return 0
    }

    console.log(`[DOM] 批量点击 ${elements.length} 个元素: ${selector}`)

    let successCount = 0
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      try {
        element.click()
        successCount++
        
        // 间隔延迟
        if (options?.intervalDelay && i < elements.length - 1) {
          await delay(options.intervalDelay)
        }
      } catch (error) {
        console.error(`[DOM] 点击第 ${i + 1} 个元素失败`, error)
      }
    }

    // 批量点击后的延迟
    if (options?.delay) {
      await delay(options.delay)
    }

    console.log(`[DOM] 批量点击完成: ${successCount}/${elements.length}`)
    return successCount
  } catch (error) {
    console.error(`[DOM] 批量点击失败: ${selector}`, error)
    return 0
  }
}

/**
 * 设置下拉框的值
 * 
 * @param selector - CSS选择器或元素本身
 * @param value - 要设置的值
 * @param triggerEvents - 是否触发change事件
 * @returns 是否成功设置
 * 
 * @example
 * await setSelectValue(SELECTORS.FORM.VISIBILITY, 'everyone')
 */
export const setSelectValue = (
  selector: string | HTMLSelectElement,
  value: string,
  triggerEvents: boolean = true
): boolean => {
  try {
    const element = typeof selector === 'string'
      ? document.querySelector<HTMLSelectElement>(selector)
      : selector

    if (!element) {
      console.warn(`[DOM] Select元素不存在: ${selector}`)
      return false
    }

    if (!(element instanceof HTMLSelectElement)) {
      console.warn(`[DOM] 不是Select元素: ${selector}`)
      return false
    }

    // 设置值
    element.value = value

    // 触发事件
    if (triggerEvents) {
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }

    console.log(`[DOM] 设置Select值: ${selector} = ${value}`)
    return true
  } catch (error) {
    console.error(`[DOM] 设置Select值失败: ${selector}`, error)
    return false
  }
}

/**
 * 设置输入框的值
 * 
 * @param selector - CSS选择器或元素本身
 * @param value - 要设置的值
 * @param triggerEvents - 是否触发input事件
 * @returns 是否成功设置
 */
export const setInputValue = (
  selector: string | HTMLInputElement,
  value: string,
  triggerEvents: boolean = true
): boolean => {
  try {
    const element = typeof selector === 'string'
      ? document.querySelector<HTMLInputElement>(selector)
      : selector

    if (!element) {
      console.warn(`[DOM] Input元素不存在: ${selector}`)
      return false
    }

    if (!(element instanceof HTMLInputElement)) {
      console.warn(`[DOM] 不是Input元素: ${selector}`)
      return false
    }

    // 设置值
    element.value = value

    // 触发事件
    if (triggerEvents) {
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }

    console.log(`[DOM] 设置Input值: ${selector} = ${value}`)
    return true
  } catch (error) {
    console.error(`[DOM] 设置Input值失败: ${selector}`, error)
    return false
  }
}

/**
 * 设置复选框的状态
 * 
 * @param selector - CSS选择器或元素本身
 * @param checked - 是否勾选
 * @param triggerEvents - 是否触发change事件
 * @returns 是否成功设置
 */
export const setCheckboxValue = (
  selector: string | HTMLInputElement,
  checked: boolean,
  triggerEvents: boolean = true
): boolean => {
  try {
    const element = typeof selector === 'string'
      ? document.querySelector<HTMLInputElement>(selector)
      : selector

    if (!element) {
      console.warn(`[DOM] Checkbox元素不存在: ${selector}`)
      return false
    }

    if (!(element instanceof HTMLInputElement) || element.type !== 'checkbox') {
      console.warn(`[DOM] 不是Checkbox元素: ${selector}`)
      return false
    }

    // 设置值
    element.checked = checked

    // 触发事件
    if (triggerEvents) {
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }

    console.log(`[DOM] 设置Checkbox: ${selector} = ${checked}`)
    return true
  } catch (error) {
    console.error(`[DOM] 设置Checkbox失败: ${selector}`, error)
    return false
  }
}

/**
 * 获取元素的文本内容
 * 
 * @param selector - CSS选择器
 * @returns 文本内容，如果元素不存在则返回null
 */
export const getElementText = (selector: string): string | null => {
  try {
    const element = document.querySelector(selector)
    return element?.textContent?.trim() || null
  } catch (error) {
    console.error(`[DOM] 获取文本失败: ${selector}`, error)
    return null
  }
}

/**
 * 获取元素的属性值
 * 
 * @param selector - CSS选择器
 * @param attribute - 属性名
 * @returns 属性值，如果元素不存在则返回null
 */
export const getElementAttribute = (
  selector: string,
  attribute: string
): string | null => {
  try {
    const element = document.querySelector(selector)
    return element?.getAttribute(attribute) || null
  } catch (error) {
    console.error(`[DOM] 获取属性失败: ${selector}.${attribute}`, error)
    return null
  }
}

/**
 * 等待元素出现
 * 
 * @param selector - CSS选择器
 * @param timeout - 超时时间（毫秒）
 * @param checkInterval - 检查间隔（毫秒）
 * @returns Promise，元素出现时resolve，超时则reject
 * 
 * @example
 * await waitForElement('.activities-list', 5000)
 */
export const waitForElement = (
  selector: string,
  timeout: number = 5000,
  checkInterval: number = 100
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const checkElement = () => {
      const element = document.querySelector(selector)
      
      if (element) {
        console.log(`[DOM] 元素已出现: ${selector}`)
        resolve(element)
        return
      }

      if (Date.now() - startTime >= timeout) {
        console.warn(`[DOM] 等待元素超时: ${selector}`)
        reject(new Error(`等待元素超时: ${selector}`))
        return
      }

      setTimeout(checkElement, checkInterval)
    }

    checkElement()
  })
}

/**
 * 等待元素消失
 * 
 * @param selector - CSS选择器
 * @param timeout - 超时时间（毫秒）
 * @param checkInterval - 检查间隔（毫秒）
 * @returns Promise，元素消失时resolve，超时则reject
 */
export const waitForElementGone = (
  selector: string,
  timeout: number = 5000,
  checkInterval: number = 100
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const checkElement = () => {
      const element = document.querySelector(selector)
      
      if (!element) {
        console.log(`[DOM] 元素已消失: ${selector}`)
        resolve()
        return
      }

      if (Date.now() - startTime >= timeout) {
        console.warn(`[DOM] 等待元素消失超时: ${selector}`)
        reject(new Error(`等待元素消失超时: ${selector}`))
        return
      }

      setTimeout(checkElement, checkInterval)
    }

    checkElement()
  })
}

/**
 * 检查元素是否可见
 * 
 * @param selector - CSS选择器或元素本身
 * @returns 是否可见
 */
export const isElementVisible = (selector: string | Element): boolean => {
  try {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector

    if (!element || !(element instanceof HTMLElement)) {
      return false
    }

    // 检查display和visibility
    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false
    }

    // 检查opacity
    if (parseFloat(style.opacity) === 0) {
      return false
    }

    // 检查是否在视口内
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`[DOM] 检查可见性失败: ${selector}`, error)
    return false
  }
}

/**
 * 检查元素是否存在
 * 
 * @param selector - CSS选择器
 * @returns 是否存在
 */
export const elementExists = (selector: string): boolean => {
  return document.querySelector(selector) !== null
}

/**
 * 获取活动的时间戳
 * 用于验证排序
 * 
 * @param count - 要获取的数量
 * @returns 时间戳数组
 */
export const getActivityTimestamps = (count: number = 3): number[] => {
  try {
    const activityRows = document.querySelectorAll(SELECTORS.ACTIVITY.ROW)
    const timestamps: number[] = []

    for (let i = 0; i < Math.min(count, activityRows.length); i++) {
      const row = activityRows[i]
      // 尝试从data属性或其他地方获取时间戳
      const timestampAttr = row.getAttribute('data-timestamp') || 
                           row.getAttribute('data-date')
      
      if (timestampAttr) {
        const timestamp = parseInt(timestampAttr, 10)
        if (!isNaN(timestamp)) {
          timestamps.push(timestamp)
        }
      }
    }

    console.log(`[DOM] 获取到 ${timestamps.length} 个活动时间戳`)
    return timestamps
  } catch (error) {
    console.error('[DOM] 获取活动时间戳失败', error)
    return []
  }
}

/**
 * 滚动到元素位置
 * 
 * @param selector - CSS选择器或元素本身
 * @param options - 滚动选项
 */
export const scrollToElement = (
  selector: string | Element,
  options?: ScrollIntoViewOptions
): boolean => {
  try {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector

    if (!element || !(element instanceof Element)) {
      console.warn(`[DOM] 元素不存在，无法滚动: ${selector}`)
      return false
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      ...options
    })

    console.log(`[DOM] 滚动到元素: ${selector}`)
    return true
  } catch (error) {
    console.error(`[DOM] 滚动失败: ${selector}`, error)
    return false
  }
}

/**
 * 获取元素的计算样式
 * 
 * @param selector - CSS选择器
 * @param property - CSS属性名
 * @returns 属性值
 */
export const getComputedStyle = (
  selector: string,
  property: string
): string | null => {
  try {
    const element = document.querySelector(selector)
    if (!element || !(element instanceof HTMLElement)) {
      return null
    }

    const style = window.getComputedStyle(element)
    return style.getPropertyValue(property)
  } catch (error) {
    console.error(`[DOM] 获取样式失败: ${selector}.${property}`, error)
    return null
  }
}

/**
 * 批量设置元素属性
 * 
 * @param selector - CSS选择器
 * @param attributes - 属性对象
 * @returns 成功设置的元素数量
 */
export const setAttributes = (
  selector: string,
  attributes: Record<string, string>
): number => {
  try {
    const elements = document.querySelectorAll(selector)
    let count = 0

    elements.forEach(element => {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
      count++
    })

    console.log(`[DOM] 设置属性: ${selector}, ${count}个元素`)
    return count
  } catch (error) {
    console.error(`[DOM] 设置属性失败: ${selector}`, error)
    return 0
  }
}

/**
 * 移除元素
 * 
 * @param selector - CSS选择器
 * @returns 移除的元素数量
 */
export const removeElements = (selector: string): number => {
  try {
    const elements = document.querySelectorAll(selector)
    let count = 0

    elements.forEach(element => {
      element.remove()
      count++
    })

    console.log(`[DOM] 移除元素: ${selector}, ${count}个`)
    return count
  } catch (error) {
    console.error(`[DOM] 移除元素失败: ${selector}`, error)
    return 0
  }
}

/**
 * 安全地获取元素
 * 使用备用选择器方案
 * 
 * @param selectors - 选择器数组
 * @returns 第一个匹配的元素
 */
export const safeQuerySelector = querySelector

/**
 * 安全地获取所有元素
 * 使用备用选择器方案
 * 
 * @param selectors - 选择器数组
 * @returns 第一个有结果的选择器匹配的所有元素
 */
export const safeQuerySelectorAll = querySelectorAll

