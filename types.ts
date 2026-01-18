export interface CoQuanCap {
  so_ban_nganh: string;
  phong_ban: string;
}

export interface ThongTinChung {
  co_quan_cap: CoQuanCap;
  tieu_de_giay_to: string;
  loai_hinh_doanh_nghiep: string;
  ma_so_doanh_nghiep: string;
  ngay_dang_ky_lan_dau: string;
}

export interface TenDoanhNghiep {
  ten_tieng_viet: string;
  ten_tieng_nuoc_ngoai: string;
  ten_viet_tat: string;
}

export interface DiaChiTruSo {
  dia_chi_chi_tiet: string;
  dien_thoai: string;
  email: string;
}

export interface VonDieuLe {
  so_tien: string;
  bang_chu: string;
}

export interface ThanhVienGopVon {
  stt: string;
  ten_thanh_vien: string;
  quoc_tich: string;
  dia_chi: string;
  gia_tri_gop_von: string;
  ty_le_gop_von: string;
  so_giay_to_phap_ly: string;
}

export interface NguoiDaiDienPhapLuat {
  ho_ten: string;
  chuc_danh: string;
  gioi_tinh: string;
  sinh_ngay: string;
  quoc_tich: string;
  so_dinh_danh_ca_nhan: string;
  dia_chi_lien_lac: string;
}

export interface ThongTinKyDuyet {
  chuc_vu_nguoi_ky: string;
  ho_ten_nguoi_ky: string;
}

export interface BusinessLicenseData {
  thong_tin_chung: ThongTinChung;
  ten_doanh_nghiep: TenDoanhNghiep;
  dia_chi_tru_so: DiaChiTruSo;
  von_dieu_le: VonDieuLe;
  danh_sach_thanh_vien_gop_von: ThanhVienGopVon[];
  nguoi_dai_dien_phap_luat: NguoiDaiDienPhapLuat;
  thong_tin_ky_duyet: ThongTinKyDuyet;
}