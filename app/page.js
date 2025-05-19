import ObjectDetection from "./components/objectDetection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-20">
      <h1 className="gradient-title font-extrabold text-3xl md:text-6xl tracking-tight md: px-6 text-center">
        Silent Sentinel
      </h1>
      <h2 className="gradient-title font-bold text-xl md:text-2xl tracking-tight md: px-6 text-center mt-2">
        Theft Detection Alarm
      </h2>
      <ObjectDetection />
    </main>
  );
}
