//設定変数
var cameraIdealSize = {width: 640, height: 480};
var blazePoseCanvasSize = 128;
var virtualBackTextureSize = 1024;

var blazePoseNet = null;

var videoComponent = null;
var intermediateCanvas = null;
var intermediateCanvasCtx = null;
var intermediateToBlazePoseCanvas = null;
var intermediateToBlazePoseCanvasCtx = null;
var previousFrameCanvas = null;
var previousFrameCanvasCtx = null;
var maskFromBlazePoseCanvas = null;
var maskFromBlazePoseCanvasCtx = null;
var virtualBackTextureCanvas = null;
var virtualBackTextureCanvasCtx = null;

var processedSegmentResult = null;
var blazePoseTimeSum = 0.0;
var blazePoseTimeCount = 0;
var blazePoseTimeSamples = 30;

async function BlazePosePart_drawTextureCanvas(i_processedSegmentResult) {
    if (i_processedSegmentResult.length > 0) {
        virtualBackTextureCanvasCtx.globalCompositeOperation = "source-over";
        virtualBackTextureCanvasCtx.drawImage(previousFrameCanvas, 0, 0, intermediateCanvas.width, intermediateCanvas.height,
            0, 0, virtualBackTextureSize, virtualBackTextureSize);

        var maskImage = await i_processedSegmentResult[0].segmentation.mask.toImageData();
        maskFromBlazePoseCanvasCtx.putImageData(maskImage, 0, 0);
        virtualBackTextureCanvasCtx.globalCompositeOperation = "destination-in";
        virtualBackTextureCanvasCtx.drawImage(maskFromBlazePoseCanvas, 0, 0, blazePoseCanvasSize, blazePoseCanvasSize,
            0, 0, virtualBackTextureSize, virtualBackTextureSize);
    }
    else {
        virtualBackTextureCanvasCtx.globalCompositeOperation = "destination-out";
        virtualBackTextureCanvasCtx.beginPath();
        virtualBackTextureCanvasCtx.fillStyle = "rgba(0, 0, 0, 1)";
        virtualBackTextureCanvasCtx.fillRect(0, 0, virtualBackTextureSize, virtualBackTextureSize);
    }
}

async function BlazePosePart_init(videoStream) {
    videoTracks = videoStream.getVideoTracks();
    if (videoTracks.length <= 0) {
        return;
    }

    videoComponent = document.getElementById("video");
    videoComponent.width = videoTracks[0].getSettings().width;
    videoComponent.height = videoTracks[0].getSettings().height;
    videoComponent.autoplay = true;
    videoComponent.srcObject = videoStream;

    intermediateCanvas = document.getElementById("intermediate");
    intermediateCanvas.width = videoComponent.width;
    intermediateCanvas.height = videoComponent.height;
    intermediateCanvasCtx = intermediateCanvas.getContext("2d");

    intermediateToBlazePoseCanvas = document.getElementById("intermediateToBlazePose");
    intermediateToBlazePoseCanvas.width = blazePoseCanvasSize;
    intermediateToBlazePoseCanvas.height = blazePoseCanvasSize;
    intermediateToBlazePoseCanvasCtx = intermediateToBlazePoseCanvas.getContext("2d");

    previousFrameCanvas = document.getElementById("previousFrame");
    previousFrameCanvas.width = videoComponent.width;
    previousFrameCanvas.height = videoComponent.height;
    previousFrameCanvasCtx = previousFrameCanvas.getContext("2d");

    maskFromBlazePoseCanvas = document.getElementById("maskFromBlazePose");
    maskFromBlazePoseCanvas.width = blazePoseCanvasSize;
    maskFromBlazePoseCanvas.height = blazePoseCanvasSize;
    maskFromBlazePoseCanvasCtx = maskFromBlazePoseCanvas.getContext("2d");

    virtualBackTextureCanvas = document.getElementById("virtualBackTexture");
    virtualBackTextureCanvas.width = virtualBackTextureSize;
    virtualBackTextureCanvas.height = virtualBackTextureSize;
    virtualBackTextureCanvasCtx = virtualBackTextureCanvas.getContext("2d");

    const detectorConfig = {
        runtime: "mediapipe",
        enableSegmentation: true,
        modelType: "lite",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose"
    };
    blazePoseNet = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);

    blazePoseTimeSum = 0.0;
    blazePoseTimeCount = 0;
}

async function BlazePosePart_main() {
    var startTime = performance.now();
    intermediateCanvasCtx.drawImage(videoComponent, 0, 0, intermediateCanvas.width, intermediateCanvas.height);
    intermediateToBlazePoseCanvasCtx.drawImage(intermediateCanvas, 0, 0, intermediateCanvas.width, intermediateCanvas.height,
        0, 0, blazePoseCanvasSize, blazePoseCanvasSize);

    var blazePosePromise = blazePoseNet.estimatePoses(intermediateToBlazePoseCanvas);
    if (processedSegmentResult) {
        await BlazePosePart_drawTextureCanvas(processedSegmentResult);
    }
    processedSegmentResult = await blazePosePromise;

    previousFrameCanvasCtx.drawImage(intermediateCanvas, 0, 0, intermediateCanvas.width, intermediateCanvas.height);
    var endTime = performance.now();
    blazePoseTimeSum += (endTime - startTime);
    blazePoseTimeCount++;

    if (blazePoseTimeCount >= blazePoseTimeSamples) {
        document.getElementById("elapsedTimeBlazePose").innerHTML = (blazePoseTimeSum / blazePoseTimeSamples).toFixed(2);
        blazePoseTimeSum = 0.0;
        blazePoseTimeCount = 0;
    }

    setTimeout(arguments.callee, 1000/60);
}
