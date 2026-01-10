import type { BulkEditFields, UpdateStatus } from "~types/strava"
import { CURRENT_DELAYS, delay } from "~config/delays"

/**
 * 更新当前页面的所有活动
 */
const updateCurrentPageActivities = async (fields: BulkEditFields): Promise<number> => {
  // 1. 点击所有快速编辑按钮
  const quickEditButtons = document.querySelectorAll<HTMLButtonElement>(
    ".training-activity-row .quick-edit"
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
    const rideTypeSelects = document.querySelectorAll<HTMLSelectElement>(
      '.training-activity-row select[name="workout_type_ride"]'
    )
    rideTypeSelects.forEach((select) => {
      select.value = fields.rideType!
    })
  }

  // 3. 填充自行车
  if (fields.bike) {
    const bikeSelects = document.querySelectorAll<HTMLSelectElement>(
      '.training-activity-row select[name="bike_id"]'
    )
    bikeSelects.forEach((select) => {
      select.value = fields.bike!
    })
  }

  // 4. 填充跑鞋
  if (fields.shoes) {
    const shoesSelects = document.querySelectorAll<HTMLSelectElement>(
      '.training-activity-row select[name="athlete_gear_id"]'
    )
    shoesSelects.forEach((select) => {
      select.value = fields.shoes!
    })
  }

  // 5. 填充隐私设置
  if (fields.visibility) {
    const visibilitySelects = document.querySelectorAll<HTMLSelectElement>(
      '.training-activity-row select[name="visibility"]'
    )
    visibilitySelects.forEach((select) => {
      select.value = fields.visibility!
    })
  }

  // 等待一下让表单更新
  await delay(CURRENT_DELAYS.FORM_FILL)

  // 6. 提交所有修改
  const submitButtons = document.querySelectorAll<HTMLButtonElement>(
    '.training-activity-row button[type="submit"]'
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
  const nextButton = document.querySelector<HTMLButtonElement>("button.next_page")
  return nextButton !== null && !nextButton.disabled
}

/**
 * 点击下一页
 */
const goToNextPage = async (): Promise<boolean> => {
  const nextButton = document.querySelector<HTMLButtonElement>("button.next_page")
  
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
    const prevButton = document.querySelector<HTMLButtonElement>("button.previous_page")
    
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
  const activities = document.querySelectorAll(".training-activity-row")
  return activities.length
}

