import React, { createContext, useContext, useState, useCallback } from "react";

export interface DialogState {
  selectedSupplier: string | null;
  selectedInvoice: string | null;
  showCreate: boolean;
  roadsOpen: boolean;
  bricksOpen: boolean;
  selectedAction: string | null;
  certOpen: boolean;
  showQR: boolean;
  [key: string]: any;
}

interface DialogContextType {
  dialogs: DialogState;
  setDialog: (key: keyof DialogState, value: any) => void;
  openDialog: (key: keyof DialogState) => void;
  closeDialog: (key: keyof DialogState) => void;
  toggleDialog: (key: keyof DialogState) => void;
  closeAllDialogs: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogState>({
    selectedSupplier: null,
    selectedInvoice: null,
    showCreate: false,
    roadsOpen: false,
    bricksOpen: false,
    selectedAction: null,
    certOpen: false,
    showQR: false,
  });

  const setDialog = useCallback((key: keyof DialogState, value: any) => {
    setDialogs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openDialog = useCallback((key: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeDialog = useCallback((key: keyof DialogState) => {
    setDialogs((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? false : null,
    }));
  }, []);

  const toggleDialog = useCallback((key: keyof DialogState) => {
    setDialogs((prev) => ({
      ...prev,
      [key]:
        typeof prev[key] === "boolean"
          ? !prev[key]
          : prev[key]
          ? null
          : true,
    }));
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogs({
      selectedSupplier: null,
      selectedInvoice: null,
      showCreate: false,
      roadsOpen: false,
      bricksOpen: false,
      selectedAction: null,
      certOpen: false,
      showQR: false,
    });
  }, []);

  return (
    <DialogContext.Provider
      value={{ dialogs, setDialog, openDialog, closeDialog, toggleDialog, closeAllDialogs }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
