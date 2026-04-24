"use client";

import Swal, {
  type SweetAlertIcon,
  type SweetAlertOptions,
  type SweetAlertResult,
} from "sweetalert2";

export type ModalOptions = SweetAlertOptions;

const BASE_MODAL_OPTIONS: SweetAlertOptions = {
  background: "#0B1220",
  color: "#E2E8F0",
  confirmButtonColor: "#22C55E",
  cancelButtonColor: "#EF4444",
  reverseButtons: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
};

const buildModalOptions = (options: SweetAlertOptions = {}): SweetAlertOptions => ({
  ...BASE_MODAL_OPTIONS,
  ...options,
});

export const modal = {
  fire: (options: SweetAlertOptions): Promise<SweetAlertResult> =>
    Swal.fire(buildModalOptions(options)),

  success: (
    title: string,
    text?: string,
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        icon: "success",
        title,
        text,
        ...options,
      }),
    ),

  error: (
    title: string,
    text?: string,
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        icon: "error",
        title,
        text,
        ...options,
      }),
    ),

  warning: (
    title: string,
    text?: string,
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        icon: "warning",
        title,
        text,
        ...options,
      }),
    ),

  info: (
    title: string,
    text?: string,
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        icon: "info",
        title,
        text,
        ...options,
      }),
    ),

  confirm: (
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        icon: "question",
        title: "Apakah kamu yakin?",
        text: "Aksi ini akan dijalankan.",
        showCancelButton: true,
        confirmButtonText: "Ya, lanjutkan",
        cancelButtonText: "Batal",
        focusCancel: true,
        ...options,
      }),
    ),

  toast: (
    icon: SweetAlertIcon,
    title: string,
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        toast: true,
        position: "top-end",
        icon,
        title,
        showConfirmButton: false,
        timer: 2400,
        timerProgressBar: true,
        allowOutsideClick: true,
        ...options,
      }),
    ),

  loading: (
    title = "Memproses...",
    text = "Mohon tunggu sebentar",
    options: SweetAlertOptions = {},
  ): Promise<SweetAlertResult> =>
    Swal.fire(
      buildModalOptions({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        ...options,
      }),
    ),

  close: (): void => {
    Swal.close();
  },
};

export default modal;
