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
    <Dialog open={isProcessing}>
      <DialogContent>
        <DialogContentText>The Geometry is being processed</DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingDialog;
