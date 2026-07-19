import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { next, back } from "../actions/actions";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const steps = [
  "Select the area to predict",
  "Select the region of interest",
  "Find Similarities",
];

const errors = ["There is not area selected", "There is not region selected"];

export default function MapStepper() {
  const FIND_SIMILAR_REGIONS_URL = "http://127.0.0.1:8000/findSimilarRegions/";
  const dispacth = useDispatch();
  const { areaToPredict, regionOfInterest } = useSelector((state) => state);

  const [activeStep, setActiveStep] = React.useState(0);
  const [stepFailed, setStepFailed] = React.useState(-1);

  const callToSimilarityService = async () => {
    const queryBody = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    };
    try {
      await fetch(FIND_SIMILAR_REGIONS_URL, queryBody).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleNext = () => {
    if (
      (activeStep === 0 && areaToPredict === false) ||
      (activeStep === 1 && regionOfInterest === false)
    ) {
      setStepFailed(activeStep);
      return;
    }
    if (isStepFailed !== -1) {
      setStepFailed(-1);
    }
    if (activeStep === steps.length - 1) {
      callToSimilarityService()
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    dispacth(next());
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    dispacth(back());
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const previousActiveStepRef = React.useRef(activeStep);
  const resetButtonRef = React.useRef(null);
  const nextButtonRef = React.useRef(null);

  // Manage focus when the active step changes.
  React.useEffect(() => {
    const previousActiveStep = previousActiveStepRef.current;
    previousActiveStepRef.current = activeStep;

    if (activeStep === steps.length) {
      // If the user has completed all steps and hits "Finish", focus the "Reset" button.
      resetButtonRef.current.focus();
      return;
    }
    if (activeStep === 0 && previousActiveStep === steps.length) {
      // If the user has completed all steps and hits "Reset", focus the "Next" button.
      nextButtonRef.current.focus();
      return;
    }
  }, [activeStep]);

  const isStepFailed = (step) => {
    return step === stepFailed;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepFailed(index)) {
            const error = errors[index];
            labelProps.optional = (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            );

            labelProps.error = true;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset} ref={resetButtonRef}>
              Reset
            </Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext} ref={nextButtonRef}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
