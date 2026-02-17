# 彈窗（Modal）視窗大小設定說明

## 結構（兩層）

1. **外層 overlay**（全螢幕遮罩）
   - `fixed inset-0`：鋪滿整個視窗
   - `flex justify-center items-start`：內容水平置中、**垂直靠上**（避免留白）
   - `overflow-y-auto`：內容過長時整頁可捲動

2. **內層白色視窗**（實際彈出的框）
   - **寬度**：`w-full max-w-*`（例如 `max-w-md`、`max-w-lg`、`max-w-2xl`）
   - **高度**：
     - `style={{ height: 'auto', minHeight: 0 }}`：高度隨內容，不設最小值
     - `max-h-[85vh]` 或 `max-h-[95vh]`：內容多時不超過視窗，內部捲動
   - **對齊**：`self-start`：在 flex 裡靠上，不會被拉高或置中

## 修改高度時要動的地方

- 只改**白色那層**的 `className` 和 `style`。
- 要「隨內容變矮」：保留 `height: 'auto', minHeight: 0` 和 `self-start`。
- 要「上限高度」：改 `max-h-[85vh]` 或 `max-h-[95vh]` 的數值。

## 已套用此設定的 Modal

- EnrolledStudentsModal、AdjustPaymentDateModal、ReceiptModal、PaymentNoticeModal  
- DailySessionsAttendanceModal、StudentSummaryModal、StudentPaymentModal  
- SessionAttendanceModal、ClassCalendarModal、CombinedPaymentPrintModal  
