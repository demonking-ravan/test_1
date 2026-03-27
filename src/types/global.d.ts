declare global {
  interface Window {
    nextPrev: typeof nextPrev;
    toggleVenue: typeof toggleVenue;
    submitForm: typeof submitForm;
    collectFormData: typeof collectFormData;
    openModal: typeof openModal;
    closeModal: typeof closeModal;
  }
}
export {};
