// Lắng nghe tin nhắn từ Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_TO_CRM") {
    const mappings = request.data;
    let count = 0;

    console.log("VN License Extractor: Bắt đầu điền dữ liệu...", mappings);

    mappings.forEach(item => {
      // Chỉ điền nếu có giá trị và tên trường không rỗng
      if (item.value && item.field && item.value.trim() !== "") {
        const success = findAndFillInput(item.field, item.value);
        if (success) count++;
      }
    });

    sendResponse({ status: "success", filledCount: count });
  }
  // Return true để giữ channel mở cho sendResponse bất đồng bộ nếu cần
  return true;
});

// Hàm tìm input dựa trên Label text và điền dữ liệu
function findAndFillInput(labelText, value) {
  try {
    // 1. Tìm phần tử chứa text (Label)
    // Cải tiến: Sử dụng contains(., ...) thay vì contains(text(), ...) để tìm text nằm trong thẻ con (ví dụ <span>Tên viết tắt</span>)
    // Normalize-space giúp bỏ qua khoảng trắng thừa
    const xpath = `//label[contains(normalize-space(.), '${labelText}')] | //div[contains(@class, 'label') and contains(normalize-space(.), '${labelText}')] | //span[contains(normalize-space(.), '${labelText}')]`;
    
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    // Ưu tiên label chính xác nhất (ngắn nhất nhưng chứa text) để tránh nhầm lẫn
    // Ví dụ: "Tên" vs "Tên viết tắt"
    let targetLabel = null;
    if (result.snapshotLength > 0) {
       // Nếu có nhiều kết quả, chọn kết quả đầu tiên visible hoặc logic phù hợp
       targetLabel = result.snapshotItem(0);
    }

    if (targetLabel) {
      // 2. Tìm thẻ input liên quan
      let inputEl = null;

      // Chiến thuật 1: Check attribute 'for' (Chuẩn HTML)
      const forAttr = targetLabel.getAttribute('for');
      if (forAttr) {
        inputEl = document.getElementById(forAttr);
      }

      // Chiến thuật 2: Input lồng bên trong Label
      if (!inputEl) {
        inputEl = targetLabel.querySelector('input, textarea, [contenteditable="true"]');
      }

      // Chiến thuật 3: Leo cây DOM (Parent Traversal) - AMIS thường dùng cấu trúc Grid
      // Leo lên các cấp cha để tìm input trong cùng container
      if (!inputEl) {
        let parent = targetLabel.parentElement;
        // Thử leo lên tối đa 4 cấp (để cover các case div bọc sâu)
        for (let i = 0; i < 4; i++) {
            if (!parent) break;
            
            // Tìm input trong parent này, nhưng loại trừ hidden input
            // Ưu tiên input text, textarea, email...
            const potentialInput = parent.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');
            
            if (potentialInput && potentialInput !== targetLabel) {
                // Đôi khi label và input cùng nằm trong 1 div cha
                inputEl = potentialInput;
                break; 
            }
            parent = parent.parentElement;
        }
      }

      // 3. Thực hiện điền giá trị
      if (inputEl) {
        // Scroll tới element để đảm bảo visible
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputEl.focus();
        inputEl.click();

        // Xử lý set giá trị
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        
        if (inputEl.tagName === 'TEXTAREA' || inputEl.tagName === 'INPUT') {
            if (nativeInputValueSetter && inputEl.tagName === 'INPUT') {
                nativeInputValueSetter.call(inputEl, value);
            } else {
                inputEl.value = value;
            }
        } else if (inputEl.getAttribute('contenteditable') === 'true') {
            inputEl.innerText = value;
        }

        // Dispatch events quan trọng để trigger Framework (Vue/React/Angular) của AMIS
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        inputEl.dispatchEvent(new Event('blur', { bubbles: true }));

        // --- STYLE UPDATE: Bôi đỏ text để highlight ---
        inputEl.style.setProperty('color', 'red', 'important');
        inputEl.style.setProperty('font-weight', 'bold', 'important');
        inputEl.style.setProperty('border', '1px solid red', 'important');
        inputEl.style.setProperty('background-color', '#fff5f5', 'important');
        // ----------------------------------------------

        console.log(`[VN License] Đã điền: [${labelText}] -> ${value}`);
        return true;
      } else {
        console.warn(`[VN License] Tìm thấy label "${labelText}" nhưng KHÔNG thấy input.`);
      }
    } else {
        // console.warn(`[VN License] Không tìm thấy label: "${labelText}"`);
    }
  } catch (e) {
    console.error(`[VN License] Lỗi khi điền trường ${labelText}:`, e);
  }
  return false;
}