import WebMap from "./components/WebMap";
import MapStepper from "./components/MapStepper";
import ProcessingDialog from "./components/ProcessingDialog";

function App() {
  return (
    <div>
      <MapStepper />
      <WebMap />;
      <ProcessingDialog />
    </div>
  );
}

export default App;
