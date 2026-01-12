import type { BulkEditFields, UpdateStatus } from "~/types/strava"
import { CURRENT_DELAYS, delay } from "~/config/delays"
import { SELECTORS } from "~/config/selectors"
import { queryByXPath, queryAllByXPath } from "~/utils/domHelper"

/**
 * 更新当前页面的所有活动
 */
const updateCurrentPageActivities = async (fields: BulkEditFields): Promise<number> => {
  // 1. 点击所有快速编辑按钮
  const quickEditButtons = queryAllByXPath<HTMLButtonElement>(
    SELECTORS.ACTIVITY.QUICK_EDIT_BUTTON
  )

  if (quickEditButtons.length === 0) {
    return 0
  }

  // 打开编辑模式
  quickEditButtons.forEach((button) => button.click())

  // 等待编辑表单出现
  await delay(CURRENT_DELAYS.QUICK_EDIT_CLICK)

  // 2. 填充骑行类型
  if (fields.rideType) {
    const rideTypeSelects = queryAllByXPath<HTMLSelectElement>(
      SELECTORS.EDIT.RIDE_TYPE
    )
    rideTypeSelects.forEach((select) => {
      select.value = fields.rideType!
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  // 3. 填充自行车
  if (fields.bike) {
    const bikeSelects = queryAllByXPath<HTMLSelectElement>(
      SELECTORS.EDIT.BIKE
    )
    bikeSelects.forEach((select) => {
      select.value = fields.bike!
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  // 4. 填充跑鞋
  if (fields.shoes) {
    const shoesSelects = queryAllByXPath<HTMLSelectElement>(
      SELECTORS.EDIT.SHOES
    )
    shoesSelects.forEach((select) => {
      select.value = fields.shoes!
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  // 5. 填充隐私设置
  if (fields.visibility) {
    const visibilitySelects = queryAllByXPath<HTMLSelectElement>(
      SELECTORS.EDIT.VISIBILITY
    )
    visibilitySelects.forEach((select) => {
      select.value = fields.visibility!
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  // 等待一下让表单更新
  await delay(CURRENT_DELAYS.FORM_FILL)

  // 6. 提交所有修改
  const submitButtons = queryAllByXPath<HTMLButtonElement>(
    SELECTORS.EDIT.SUBMIT
  )
  submitButtons.forEach((button) => button.click())

  // 等待提交完成
  await delay(CURRENT_DELAYS.SUBMIT_SAVE)

  return quickEditButtons.length
}

/**
 * 检查是否有下一页
 */
const hasNextPage = (): boolean => {
  const nextButton = queryByXPath<HTMLButtonElement>(
    SELECTORS.PAGINATION.NEXT_PAGE
  )
  return nextButton !== null && !nextButton.disabled
}

/**
 * 点击下一页
 */
const goToNextPage = async (): Promise<boolean> => {
  const nextButton = queryByXPath<HTMLButtonElement>(
    SELECTORS.PAGINATION.NEXT_PAGE
  )
  
  if (!nextButton || nextButton.disabled) {
    return false
  }

  nextButton.click()
  
  // 等待页面加载
  await delay(CURRENT_DELAYS.PAGE_LOAD)
  
  return true
}

/**
 * 返回到第一页
 */
const goBackToFirstPage = async (): Promise<void> => {
  while (true) {
    const prevButton = queryByXPath<HTMLButtonElement>(
      SELECTORS.PAGINATION.PREV_PAGE
    )
    
    if (!prevButton || prevButton.disabled) {
      break
    }

    prevButton.click()
    await delay(CURRENT_DELAYS.PAGE_LOAD)
  }
}

/**
 * 批量更新所有活动
 */
export const updateActivities = async (
  fields: BulkEditFields,
  onProgress?: (status: UpdateStatus) => void
): Promise<void> => {
  let totalUpdated = 0
  let currentPage = 1

  try {
    // 循环处理每一页
    while (true) {
      console.log(`Processing page ${currentPage}...`)

      // 更新当前页的活动
      const updatedCount = await updateCurrentPageActivities(fields)
      totalUpdated += updatedCount

      // 更新进度
      if (onProgress) {
        onProgress({
          total: totalUpdated,
          current: totalUpdated,
          isUpdating: true
        })
      }

      // 检查是否有下一页
      if (!hasNextPage()) {
        console.log("No more pages, finishing...")
        break
      }

      // 跳转到下一页
      const success = await goToNextPage()
      if (!success) {
        break
      }

      currentPage++
    }

    // 返回到第一页
    console.log("Returning to first page...")
    await goBackToFirstPage()

    console.log(`Successfully updated ${totalUpdated} activities!`)
  } catch (error) {
    console.error("Error updating activities:", error)
    throw error
  }
}

/**
 * 获取当前页面的活动数量
 */
export const getCurrentPageActivityCount = (): number => {
  const activities = queryAllByXPath(SELECTORS.ACTIVITY.ROW)
  return activities.length
}
