import React, { useState } from 'react';
import { BusinessLicenseData } from '../types';

declare const chrome: any;

interface ResultDisplayProps {
  data: BusinessLicenseData;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'mapping' | 'json'>('form');
  const [fillStatus, setFillStatus] = useState<string | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const copyValue = (val: string) => {
    navigator.clipboard.writeText(val);
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-bold text-blue-700 mt-5 mb-2 pb-1 border-b border-blue-100 uppercase tracking-wide sticky top-0 bg-white z-10 shadow-sm">
      {children}
    </h3>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="font-medium text-slate-500 text-xs flex items-center">{label}</div>
      <div className="col-span-2 text-slate-900 font-medium text-xs break-words leading-relaxed">{value || "---"}</div>
    </div>
  );

  // Cấu hình Mapping tổng quát cho nhiều phần mềm
  const fieldMappings = [
    { section: "Thông tin chung", field: "Mã số thuế", value: data.thong_tin_chung.ma_so_doanh_nghiep },
    { section: "Thông tin chung", field: "Mã số doanh nghiệp", value: data.thong_tin_chung.ma_so_doanh_nghiep },
    { section: "Thông tin chung", field: "Tên doanh nghiệp", value: data.ten_doanh_nghiep.ten_tieng_viet },
    { section: "Thông tin chung", field: "Tên khách hàng", value: data.ten_doanh_nghiep.ten_tieng_viet },
    { section: "Thông tin chung", field: "Tên đơn vị", value: data.ten_doanh_nghiep.ten_tieng_viet },
    { section: "Thông tin chung", field: "Tên viết tắt", value: data.ten_doanh_nghiep.ten_viet_tat },
    { section: "Thông tin chung", field: "Điện thoại", value: data.dia_chi_tru_so.dien_thoai },
    { section: "Số điện thoại", field: "Số điện thoại", value: data.dia_chi_tru_so.dien_thoai },
    { section: "Thông tin chung", field: "Email", value: data.dia_chi_tru_so.email },
    { section: "Thông tin chung", field: "Loại hình", value: data.thong_tin_chung.loai_hinh_doanh_nghiep },
    
    { section: "Địa chỉ", field: "Địa chỉ", value: data.dia_chi_tru_so.dia_chi_chi_tiet },
    { section: "Địa chỉ", field: "Địa chỉ xuất hóa đơn", value: data.dia_chi_tru_so.dia_chi_chi_tiet },
    { section: "Địa chỉ", field: "Địa chỉ giao hàng", value: data.dia_chi_tru_so.dia_chi_chi_tiet },
    
    { section: "Thông tin bổ sung", field: "Ngày thành lập", value: data.thong_tin_chung.ngay_dang_ky_lan_dau },
    { section: "Thông tin bổ sung", field: "Ngày cấp", value: data.thong_tin_chung.ngay_dang_ky_lan_dau },
    { section: "Người liên hệ", field: "Người liên hệ", value: data.nguoi_dai_dien_phap_luat.ho_ten },
    { section: "Người liên hệ", field: "Người đại diện", value: data.nguoi_dai_dien_phap_luat.ho_ten },
    { section: "Người liên hệ", field: "Họ và tên", value: data.nguoi_dai_dien_phap_luat.ho_ten },
    { section: "Người liên hệ", field: "Chức vụ", value: data.nguoi_dai_dien_phap_luat.chuc_danh },
  ];

  const handleFillToApp = async () => {
    // Check if chrome API is available (in extension context)
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      setFillStatus("Đang kết nối vào trang web...");
      
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) {
            setFillStatus("Lỗi: Không tìm thấy tab");
            return;
        }

        // 1. Inject script động vào trang web hiện tại (vì đã bỏ content_scripts trong manifest)
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } catch (scriptErr) {
          console.warn("Script injection warning (có thể đã tồn tại):", scriptErr);
          // Tiếp tục chạy vì có thể script đã được inject trước đó
        }

        // 2. Helper to send message
        const sendMessage = async () => {
            return new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id, { 
                    action: "FILL_TO_CRM", 
                    data: fieldMappings 
                }, (response: any) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                });
            });
        };

        try {
            // 3. Gửi dữ liệu để điền
            const response: any = await sendMessage();
            if (response && response.status === 'success') {
                setFillStatus(`Đã điền ${response.filledCount} trường!`);
                setTimeout(() => setFillStatus(null), 3000);
            } else {
               setFillStatus("Không tìm thấy trường nào phù hợp.");
            }
        } catch (err) {
            console.log("Communication error", err);
            setFillStatus("Lỗi kết nối. Hãy thử F5 lại trang web đích.");
        }

      } catch (e) {
        setFillStatus("Lỗi hệ thống");
        console.error(e);
      }
    } else {
        alert("Chức năng này chỉ hoạt động khi cài đặt Extension lên Chrome.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 flex-shrink-0 bg-slate-50">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 text-xs font-bold transition-all ${
            activeTab === 'form'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Form View
        </button>
        <button
          onClick={() => setActiveTab('mapping')}
          className={`flex-1 py-3 text-xs font-bold transition-all ${
            activeTab === 'mapping'
              ? 'bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          Auto Fill
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-3 text-xs font-bold transition-all ${
            activeTab === 'json'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          JSON Data
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-hidden relative bg-white">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {activeTab === 'form' && (
            <div className="p-4">
                <div className="text-center mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 uppercase leading-snug px-4">{data.thong_tin_chung.tieu_de_giay_to}</h2>
                    <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <span className="text-xs text-blue-500 mr-1">Mã số DN:</span>
                        <span className="font-mono font-bold text-sm text-blue-700">{data.thong_tin_chung.ma_so_doanh_nghiep}</span>
                    </div>
                </div>

                {/* Quick Fill Button in Form View */}
                <div className="mb-6 flex justify-center">
                   <button
                    onClick={handleFillToApp}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-md transition-all active:scale-95 hover:shadow-lg hover:shadow-purple-200"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     Điền nhanh vào Web App
                   </button>
                </div>

                {fillStatus && (
                  <div className={`mb-4 p-2 rounded text-xs font-semibold text-center animate-in fade-in slide-in-from-top-2 ${fillStatus.startsWith('Lỗi') || fillStatus.startsWith('Vui') || fillStatus.startsWith('Không') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {fillStatus}
                  </div>
                )}

                <SectionTitle>1. Thông tin chung</SectionTitle>
                <InfoRow label="Cơ quan cấp" value={data.thong_tin_chung.co_quan_cap.so_ban_nganh} />
                <InfoRow label="Phòng ban" value={data.thong_tin_chung.co_quan_cap.phong_ban} />
                <InfoRow label="Loại hình" value={data.thong_tin_chung.loai_hinh_doanh_nghiep} />
                <InfoRow label="Ngày đăng ký" value={data.thong_tin_chung.ngay_dang_ky_lan_dau} />

                <SectionTitle>2. Tên doanh nghiệp</SectionTitle>
                <InfoRow label="Tiếng Việt" value={data.ten_doanh_nghiep.ten_tieng_viet} />
                <InfoRow label="Nước ngoài" value={data.ten_doanh_nghiep.ten_tieng_nuoc_ngoai} />
                <InfoRow label="Viết tắt" value={data.ten_doanh_nghiep.ten_viet_tat} />

                <SectionTitle>3. Địa chỉ trụ sở</SectionTitle>
                <InfoRow label="Chi tiết" value={data.dia_chi_tru_so.dia_chi_chi_tiet} />
                <InfoRow label="Điện thoại" value={data.dia_chi_tru_so.dien_thoai} />
                <InfoRow label="Email" value={data.dia_chi_tru_so.email} />

                <SectionTitle>4. Vốn điều lệ</SectionTitle>
                <InfoRow label="Số tiền" value={data.von_dieu_le.so_tien} />
                <InfoRow label="Bằng chữ" value={data.von_dieu_le.bang_chu} />

                <SectionTitle>5. Người đại diện pháp luật</SectionTitle>
                <InfoRow label="Họ tên" value={data.nguoi_dai_dien_phap_luat.ho_ten} />
                <InfoRow label="Chức danh" value={data.nguoi_dai_dien_phap_luat.chuc_danh} />
                <InfoRow label="Giới tính" value={data.nguoi_dai_dien_phap_luat.gioi_tinh} />
                <InfoRow label="Sinh ngày" value={data.nguoi_dai_dien_phap_luat.sinh_ngay} />
                <InfoRow label="Quốc tịch" value={data.nguoi_dai_dien_phap_luat.quoc_tich} />
                <InfoRow label="CCCD/CMND" value={data.nguoi_dai_dien_phap_luat.so_dinh_danh_ca_nhan} />
                <InfoRow label="ĐC liên lạc" value={data.nguoi_dai_dien_phap_luat.dia_chi_lien_lac} />

                <SectionTitle>6. Danh sách thành viên góp vốn</SectionTitle>
                <div className="overflow-x-auto border border-slate-200 rounded-lg mt-2 shadow-sm">
                <table className="min-w-full text-xs text-left text-slate-500">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-3 py-2 whitespace-nowrap">STT</th>
                        <th className="px-3 py-2 whitespace-nowrap">Tên thành viên</th>
                        <th className="px-3 py-2 whitespace-nowrap text-right">Vốn góp</th>
                        <th className="px-3 py-2 whitespace-nowrap text-right">%</th>
                        <th className="px-3 py-2 whitespace-nowrap">Thông tin khác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {data.danh_sach_thanh_vien_gop_von.map((tv, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-3 py-2 text-center align-top">{tv.stt}</td>
                        <td className="px-3 py-2 align-top">
                            <div className="font-bold text-slate-900">{tv.ten_thanh_vien}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{tv.quoc_tich}</div>
                        </td>
                        <td className="px-3 py-2 text-right font-mono align-top text-slate-700">{tv.gia_tri_gop_von}</td>
                        <td className="px-3 py-2 text-right font-medium align-top text-slate-700">{tv.ty_le_gop_von}</td>
                        <td className="px-3 py-2 align-top min-w-[200px]">
                            <div className="space-y-1">
                                <p><span className="text-[10px] text-slate-400">Giấy tờ:</span> <span className="font-mono">{tv.so_giay_to_phap_ly}</span></p>
                                <p className="leading-tight"><span className="text-[10px] text-slate-400 block mb-0.5">Địa chỉ:</span> {tv.dia_chi}</p>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                <SectionTitle>7. Thông tin ký duyệt</SectionTitle>
                <InfoRow label="Chức vụ" value={data.thong_tin_ky_duyet.chuc_vu_nguoi_ky} />
                <InfoRow label="Người ký" value={data.thong_tin_ky_duyet.ho_ten_nguoi_ky} />
                
                <div className="h-12"></div>
            </div>
            )}

            {activeTab === 'mapping' && (
              <div className="p-4">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-4 flex justify-between items-start gap-3">
                  <div className="text-xs text-purple-800">
                    <p className="flex gap-2 items-center font-bold mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Điền tự động (Auto Fill)
                    </p>
                    <p className="opacity-90 leading-relaxed">
                      Dữ liệu sẽ được điền vào form trên tab trình duyệt đang mở nếu tên trường trùng khớp.
                    </p>
                  </div>
                  <button
                    onClick={handleFillToApp}
                    className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-3 rounded shadow-md transition-colors active:scale-95 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Điền ngay
                  </button>
                </div>
                
                {fillStatus && (
                  <div className={`mb-4 p-2 rounded text-xs font-semibold text-center ${fillStatus.startsWith('Lỗi') || fillStatus.startsWith('Vui') || fillStatus.startsWith('Không') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {fillStatus}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Group by section conceptually */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">Dữ liệu sẵn sàng điền</h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="px-3 py-2 text-left w-1/3">Tên trường (Label)</th>
                            <th className="px-3 py-2 text-left">Giá trị sẽ điền</th>
                            <th className="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fieldMappings.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-purple-50/30 transition-colors">
                              <td className="px-3 py-2 align-middle">
                                <div className="font-medium text-slate-700">{item.field}</div>
                              </td>
                              <td className="px-3 py-2 align-middle font-mono text-slate-800 break-words">
                                {item.value || <span className="text-slate-300 italic">Trống</span>}
                              </td>
                              <td className="px-2 py-2 align-middle text-right">
                                {item.value && (
                                  <button 
                                    onClick={() => copyValue(item.value!)}
                                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Sao chép"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="h-12"></div>
              </div>
            )}

            {activeTab === 'json' && (
            <div className="min-h-full relative bg-slate-900">
                <div className="sticky top-0 right-0 p-2 flex justify-end bg-slate-900/90 backdrop-blur-md z-20 border-b border-slate-700 shadow-lg">
                    <button
                        onClick={copyToClipboard}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-500 transition-colors shadow-md flex items-center gap-1.5 active:scale-95 transform"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        Sao chép JSON
                    </button>
                </div>
                <pre className="p-4 text-slate-100 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(data, null, 2)}
                </pre>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;