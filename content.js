// Lắng nghe tin nhắn từ Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_TO_CRM") {
    const mappings = request.data;
    let count = 0;

    console.log("Bắt đầu điền dữ liệu...", mappings);

    mappings.forEach(item => {
      if (item.value && item.field) {
        const success = findAndFillInput(item.field, item.value);
        if (success) count++;
      }
    });

    sendResponse({ status: "success", filledCount: count });
  }
});

// Hàm tìm input dựa trên Label text và điền dữ liệu
function findAndFillInput(labelText, value) {
  try {
    // 1. Tìm tất cả các thẻ label hoặc div chứa text tương ứng
    // XPath: Tìm phần tử chứa text chính xác hoặc gần đúng
    const xpath = `//label[contains(text(), '${labelText}')] | //div[contains(@class, 'label') and contains(text(), '${labelText}')]`;
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    if (result.snapshotLength > 0) {
      // Lấy phần tử đầu tiên tìm thấy
      const labelEl = result.snapshotItem(0);
      
      // 2. Tìm thẻ input liên quan
      let inputEl = null;

      // Cách 2a: Nếu label có attribute 'for'
      const forAttr = labelEl.getAttribute('for');
      if (forAttr) {
        inputEl = document.getElementById(forAttr);
      }

      // Cách 2b: Nếu input nằm lồng bên trong label (ít gặp ở AMIS nhưng có thể)
      if (!inputEl) {
        inputEl = labelEl.querySelector('input, textarea');
      }

      // Cách 2c: MISA AMIS thường cấu trúc theo dạng:
      // <div class="field-group"> <label>...</label> <div class="input-wrapper"> <input> </div> </div>
      // Nên ta sẽ tìm input trong cùng parent container hoặc parent của parent
      if (!inputEl) {
        // Leo lên 1-2 cấp cha để tìm input con
        let parent = labelEl.parentElement;
        if (parent) {
            inputEl = parent.querySelector('input:not([type="hidden"]), textarea');
            if (!inputEl && parent.parentElement) {
                inputEl = parent.parentElement.querySelector('input:not([type="hidden"]), textarea');
            }
            // Leo thêm 1 cấp nữa cho chắc (cấu trúc grid sâu)
            if (!inputEl && parent.parentElement && parent.parentElement.parentElement) {
                inputEl = parent.parentElement.parentElement.querySelector('input:not([type="hidden"]), textarea');
            }
        }
      }

      // 3. Nếu tìm thấy input, thực hiện điền giá trị
      if (inputEl) {
        // Focus vào ô input trước
        inputEl.focus();
        inputEl.click();

        // Đặt giá trị
        // Với các framework như React/Vue (MISA dùng Vue/Angular tùy module), 
        // việc set .value trực tiếp không kích hoạt data binding.
        // Cần dispatch event 'input' và 'change'.
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        if (nativeInputValueSetter) {
             nativeInputValueSetter.call(inputEl, value);
        } else {
            inputEl.value = value;
        }

        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.blur(); // Blur để trigger validation nếu có

        // --- STYLE UPDATE: Bôi đỏ text để highlight ---
        inputEl.style.setProperty('color', 'red', 'important');
        inputEl.style.setProperty('font-weight', 'bold', 'important');
        inputEl.style.setProperty('border', '1px solid red', 'important');
        // ----------------------------------------------

        console.log(`Đã điền: [${labelText}] -> ${value}`);
        return true;
      } else {
        console.warn(`Tìm thấy label "${labelText}" nhưng không thấy input.`);
      }
    } else {
        console.warn(`Không tìm thấy label: "${labelText}"`);
    }
  } catch (e) {
    console.error(`Lỗi khi điền trường ${labelText}:`, e);
  }
  return false;
}