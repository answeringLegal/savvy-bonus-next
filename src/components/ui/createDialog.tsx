// createDialog.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmDialog from './confirm-dialog';
import ReactDOM from 'react-dom';

const createDialog = ({
  title,
  details,
}: {
  title: string;
  details: string;
}) => {
  return new Promise<boolean>((resolve) => {
    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);
    // Create a root for the new dialog
    const root = createRoot(dialogRoot); // Create a root

    const closeDialog = (result: boolean) => {
      // Cleanup
      root.unmount();
      document.body.removeChild(dialogRoot);
      resolve(result);
    };

    const dialogElement = (
      <ConfirmDialog
        open={true}
        title={title}
        details={details}
        onClose={() => closeDialog(false)}
        onConfirm={() => closeDialog(true)}
      />
    );

    root.render(dialogElement);
  });
};

export default createDialog;
