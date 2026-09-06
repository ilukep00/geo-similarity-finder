import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { useSelector } from "react-redux";

const ProcessingDialog = () => {
  const { isProcessing } = useSelector((state) => state);

  if (!isProcessing) {
    return null;
  }

  return (
    <Dialog open={isProcessing.openDialog}>
      <DialogContent>
        <DialogContentText>{isProcessing.messageDialog}</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingDialog;
