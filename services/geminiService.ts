import { GoogleGenAI, Type } from "@google/genai";
import { BusinessLicenseData } from "../types";

// Define the precise schema to match the user's requirements
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    thong_tin_chung: {
      type: Type.OBJECT,
      properties: {
        co_quan_cap: {
          type: Type.OBJECT,
          properties: {
            so_ban_nganh: { type: Type.STRING, description: "Ví dụ: SỞ TÀI CHÍNH TỈNH BẮC NINH" },
            phong_ban: { type: Type.STRING, description: "Ví dụ: PHÒNG ĐĂNG KÝ KINH DOANH..." }
          }
        },
        tieu_de_giay_to: { type: Type.STRING },
        loai_hinh_doanh_nghiep: { type: Type.STRING },
        ma_so_doanh_nghiep: { type: Type.STRING },
        ngay_dang_ky_lan_dau: { type: Type.STRING }
      }
    },
    ten_doanh_nghiep: {
      type: Type.OBJECT,
      properties: {
        ten_tieng_viet: { type: Type.STRING },
        ten_tieng_nuoc_ngoai: { type: Type.STRING },
        ten_viet_tat: { type: Type.STRING }
      }
    },
    dia_chi_tru_so: {
      type: Type.OBJECT,
      properties: {
        dia_chi_chi_tiet: { type: Type.STRING },
        dien_thoai: { type: Type.STRING },
        email: { type: Type.STRING }
      }
    },
    von_dieu_le: {
      type: Type.OBJECT,
      properties: {
        so_tien: { type: Type.STRING },
        bang_chu: { type: Type.STRING }
      }
    },
    danh_sach_thanh_vien_gop_von: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stt: { type: Type.STRING },
          ten_thanh_vien: { type: Type.STRING },
          quoc_tich: { type: Type.STRING },
          dia_chi: { type: Type.STRING },
          gia_tri_gop_von: { type: Type.STRING },
          ty_le_gop_von: { type: Type.STRING },
          so_giay_to_phap_ly: { type: Type.STRING }
        }
      }
    },
    nguoi_dai_dien_phap_luat: {
      type: Type.OBJECT,
      properties: {
        ho_ten: { type: Type.STRING },
        chuc_danh: { type: Type.STRING },
        gioi_tinh: { type: Type.STRING },
        sinh_ngay: { type: Type.STRING },
        quoc_tich: { type: Type.STRING },
        so_dinh_danh_ca_nhan: { type: Type.STRING },
        dia_chi_lien_lac: { type: Type.STRING }
      }
    },
    thong_tin_ky_duyet: {
      type: Type.OBJECT,
      properties: {
        chuc_vu_nguoi_ky: { type: Type.STRING },
        ho_ten_nguoi_ky: { type: Type.STRING }
      }
    }
  }
};

export const extractBusinessLicense = async (
  base64Data: string,
  mimeType: string
): Promise<BusinessLicenseData> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Chưa cấu hình API Key. Hãy tạo file .env chứa API_KEY.");
    }

    // Initialize AI client here instead of top-level to prevent crash on load
    const ai = new GoogleGenAI({ apiKey });
    // Use flash-latest alias for better stability with multimodal inputs if preview is unstable
    const modelId = "gemini-2.5-flash-latest"; 
    
    // Clean base64 string if it contains metadata
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    // Ensure mimeType is valid, fallback if empty
    const validMimeType = mimeType || "application/pdf";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: validMimeType,
              data: cleanBase64,
            },
          },
          {
            text: "Trích xuất thông tin từ Giấy chứng nhận đăng ký doanh nghiệp này thành cấu trúc JSON. Hãy đảm bảo trích xuất chính xác tên, địa chỉ, mã số thuế và danh sách thành viên.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      // Clean markdown code blocks if present (e.g. ```json ... ```)
      let cleanedText = response.text.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      
      try {
        return JSON.parse(cleanedText) as BusinessLicenseData;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", response.text);
        throw new Error("Dữ liệu trả về từ AI không đúng định dạng JSON.");
      }
    } else {
      throw new Error("Không nhận được dữ liệu từ Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    // Enhance error message for user
    let userMsg = error.message || "Lỗi không xác định.";
    if (userMsg.includes("400")) userMsg = "Lỗi dữ liệu đầu vào (File lỗi hoặc không hỗ trợ).";
    if (userMsg.includes("403")) userMsg = "API Key không hợp lệ hoặc hết hạn.";
    if (userMsg.includes("429")) userMsg = "Hệ thống đang quá tải, vui lòng thử lại sau giây lát.";
    
    throw new Error(userMsg);
  }
};