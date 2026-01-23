// Chỉ đăng ký listener một lần duy nhất
if (!window.vnLicenseListenerAdded) {
  window.vnLicenseListenerAdded = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FILL_TO_CRM") {
      const mappings = request.data;
      let count = 0;

      console.log("VN License Extractor: Bắt đầu điền dữ liệu...", mappings);

      mappings.forEach(item => {
        if (item.value && item.field && item.value.trim() !== "") {
          const filledForField = findAndFillInput(item.field, item.value);
          if (filledForField) count++;
        }
      });

      sendResponse({ status: "success", filledCount: count });
    }
    return true;
  });
}

// Hàm tìm input dựa trên Label text và điền dữ liệu
function findAndFillInput(labelText, value) {
  let hasFilledAny = false; // Cờ đánh dấu đã điền ít nhất 1 trường
  try {
    // 1. Tìm phần tử chứa text (Label)
    // Cải tiến: 
    // - Mở rộng phạm vi tìm kiếm: label, div, span, td, p, b, strong
    // - Dùng contains(normalize-space(.), ...) để match chính xác hơn
    const xpath = `
      //label[contains(normalize-space(.), '${labelText}')] | 
      //div[contains(@class, 'label') and contains(normalize-space(.), '${labelText}')] | 
      //span[contains(normalize-space(.), '${labelText}')] |
      //td[contains(normalize-space(.), '${labelText}')] |
      //p[contains(normalize-space(.), '${labelText}')] |
      //b[contains(normalize-space(.), '${labelText}')] |
      //strong[contains(normalize-space(.), '${labelText}')]
    `;
    
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    // 2. DUYỆT QUA TẤT CẢ CÁC LABEL TÌM THẤY
    // THAY ĐỔI QUAN TRỌNG: Không return ngay khi điền được, mà tiếp tục duyệt hết danh sách
    // để điền vào tất cả các vị trí có Label giống nhau.
    for (let i = 0; i < result.snapshotLength; i++) {
        const targetLabel = result.snapshotItem(i);
        
        // Bỏ qua nếu element chứa quá nhiều text (có thể là container lớn)
        if (targetLabel.textContent.length > 150) continue;

        let inputEl = null;

        // Chiến thuật 1: Check attribute 'for'
        const forAttr = targetLabel.getAttribute('for');
        if (forAttr) {
            inputEl = document.getElementById(forAttr);
        }

        // Chiến thuật 2: Input lồng bên trong Label
        if (!inputEl) {
            inputEl = targetLabel.querySelector('input, textarea, [contenteditable="true"]');
        }

        // Chiến thuật 3: Leo cây DOM (Parent Traversal)
        if (!inputEl) {
            let parent = targetLabel.parentElement;
            // Leo lên tối đa 4 cấp
            for (let j = 0; j < 4; j++) {
                if (!parent) break;
                
                // Tìm input trong parent này
                const potentialInputs = parent.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');
                
                for (let k = 0; k < potentialInputs.length; k++) {
                    const candidate = potentialInputs[k];
                    // Input phải khác label và input phải nằm sau hoặc cùng cấp (logic tương đối)
                    if (candidate !== targetLabel) {
                        inputEl = candidate;
                        break; 
                    }
                }
                
                if (inputEl) break;
                parent = parent.parentElement;
            }
        }

        // 3. Nếu tìm thấy input hợp lệ, thực hiện điền
        if (inputEl) {
            // Chỉ cuộn tới phần tử đầu tiên tìm thấy để tránh màn hình nhảy loạn xạ
            if (!hasFilledAny) {
                inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Focus nhẹ để kích hoạt event
            // inputEl.focus(); 

            // Logic set value (giữ nguyên như cũ)
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

            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            inputEl.dispatchEvent(new Event('blur', { bubbles: true }));

            // Highlight visual
            inputEl.style.setProperty('background-color', '#fff5f5', 'important');
            inputEl.style.setProperty('border', '1px solid red', 'important');

            console.log(`[VN License] Đã điền: [${labelText}] -> ${value}`);
            
            hasFilledAny = true; 
            // KHÔNG return true ở đây nữa để vòng lặp tiếp tục
        }
    }
  } catch (e) {
    console.error(`[VN License] Lỗi khi điền trường ${labelText}:`, e);
  }
  return hasFilledAny;
}